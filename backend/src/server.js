import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import { serve } from 'inngest/express';
import { db } from './db/index.js';
import { blogs, comments, newsletters, aiRequests } from './db/schema.js';
import { eq, desc, ilike, or, sql, and } from 'drizzle-orm';
import { uploadToImageKit, deleteFromImageKit } from './lib/imagekit.js';
import { runGeminiAssist } from './lib/gemini.js';
import { inngest } from './lib/inngest.js';
import {
  incrementViewCount,
  sendWelcomeEmail,
  processAiAssist,
  sendWeeklyDigest,
  cleanupAiCache,
} from './inngest/functions.js';

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin || allowed.includes(origin)) callback(null, true);
    else callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger — helpful during development
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Multer — memory storage, pipe to ImageKit
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});
// ── Root Route (Render test) ────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.send('🚀 ByteScribe Backend is LIVE');
});
// ── Inngest (MUST be before other routes) ─────────────────────────────────────

app.use('/api/inngest', serve({
  client:    inngest,
  functions: [
    incrementViewCount,
    sendWelcomeEmail,
    processAiAssist,
    sendWeeklyDigest,
    cleanupAiCache,
  ],
}));

// ═══════════════════════════════════════════════════════════════════════════════
// BLOG ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/blogs
app.get('/api/blogs', async (req, res) => {
  try {
    const {
      search,
      category,
      limit    = '8',
      offset   = '0',
      sort     = 'newest',
      status   = 'published', // allow admin to fetch drafts too
    } = req.query;

    // Build where conditions
    const conditions = [];

    // Only filter by status if explicitly set
    if (status) conditions.push(eq(blogs.status, status));

    if (search) {
      conditions.push(
        or(
          ilike(blogs.title,       `%${search}%`),
          ilike(blogs.description, `%${search}%`),
          ilike(blogs.authorName,  `%${search}%`)
        )
      );
    }

    if (category) {
      conditions.push(eq(blogs.category, category));
    }

    // Base query with selected columns
    const baseQuery = db.select({
      id:          blogs.id,
      title:       blogs.title,
      description: blogs.description,
      image:       blogs.image,
      imageFileId: blogs.imageFileId,
      category:    blogs.category,
      tags:        blogs.tags,
      authorName:  blogs.authorName,
      authorImage: blogs.authorImage,
      authorBio:   blogs.authorBio,
      minsRead:    blogs.minsRead,
      featured:    blogs.featured,
      status:      blogs.status,
      views:       blogs.views,
      likes:       blogs.likes,
      publishedAt: blogs.publishedAt,
      createdAt:   blogs.createdAt,
    }).from(blogs);

    // Apply conditions
    const filteredQuery = conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery;

    // Apply sort
    const sortedQuery = sort === 'popular'
      ? filteredQuery.orderBy(desc(blogs.views))
      : sort === 'mostread'
        ? filteredQuery.orderBy(desc(blogs.minsRead))
        : filteredQuery.orderBy(desc(blogs.publishedAt));

    // Apply pagination
    const data = await sortedQuery
      .limit(Math.min(Number(limit), 200)) // cap at 200
      .offset(Number(offset));

    // Get total count with same filters
    const countQuery = conditions.length > 0
      ? db.select({ count: sql`count(*)` }).from(blogs).where(and(...conditions))
      : db.select({ count: sql`count(*)` }).from(blogs);

    const [{ count }] = await countQuery;

    // Attach comments to each blog efficiently
    const blogIds     = data.map(b => b.id);
    const allComments = blogIds.length > 0
      ? await db.select().from(comments).where(
          sql`${comments.blogId} = ANY(${sql.raw(`ARRAY['${blogIds.join("','")}']`)})`
        )
      : [];

    const blogsWithComments = data.map(blog => ({
      ...blog,
      author:   { name: blog.authorName, image: blog.authorImage, bio: blog.authorBio },
      comments: allComments.filter(c => c.blogId === blog.id),
    }));

    res.json({ data: blogsWithComments, total: Number(count) });
  } catch (err) {
    console.error('GET /api/blogs error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/blogs/:id
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const [blog] = await db
      .select()
      .from(blogs)
      .where(eq(blogs.id, req.params.id));

    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    const cmts = await db
      .select()
      .from(comments)
      .where(eq(comments.blogId, req.params.id))
      .orderBy(desc(comments.createdAt));

    res.json({
      ...blog,
      author:   { name: blog.authorName, image: blog.authorImage, bio: blog.authorBio },
      comments: cmts,
    });
  } catch (err) {
    console.error('GET /api/blogs/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/blogs
app.post('/api/blogs', async (req, res) => {
  try {
    const {
      title, description, image, imageFileId, content,
      contentBlocks, category, tags, authorName, authorImage,
      authorBio, minsRead, featured, status,
    } = req.body;

    // Validate required fields
    if (!title?.trim())    return res.status(400).json({ error: 'Title is required' });
    if (!category?.trim()) return res.status(400).json({ error: 'Category is required' });

    const [blog] = await db.insert(blogs).values({
      id:            uuid(),
      title:         title.trim(),
      description:   description?.trim(),
      image,
      imageFileId,
      content,
      contentBlocks,
      category,
      tags:          Array.isArray(tags) ? tags : [],
      authorName:    authorName?.trim() || 'ByteScribe Author',
      authorImage:   authorImage || 'https://i.pravatar.cc/150?img=47',
      authorBio:     authorBio?.trim() || 'Staff Writer',
      minsRead:      Number(minsRead) || 5,
      featured:      Boolean(featured),
      status:        status || 'draft',
      views:         0,
      likes:         0,
      publishedAt:   new Date(),
      createdAt:     new Date(),
      updatedAt:     new Date(),
    }).returning();

    res.status(201).json(blog);
  } catch (err) {
    console.error('POST /api/blogs error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/blogs/:id
app.patch('/api/blogs/:id', async (req, res) => {
  try {
    // Check blog exists
    const [existing] = await db
      .select()
      .from(blogs)
      .where(eq(blogs.id, req.params.id));

    if (!existing) return res.status(404).json({ error: 'Blog not found' });

    // Only update fields that are actually sent
    const allowedFields = [
      'title', 'description', 'image', 'imageFileId',
      'content', 'contentBlocks', 'category', 'tags',
      'authorName', 'authorImage', 'authorBio',
      'minsRead', 'featured', 'status',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.updatedAt = new Date();

    const [updated] = await db
      .update(blogs)
      .set(updates)
      .where(eq(blogs.id, req.params.id))
      .returning();

    res.json({
      ...updated,
      author: { name: updated.authorName, image: updated.authorImage, bio: updated.authorBio },
    });
  } catch (err) {
    console.error('PATCH /api/blogs/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/blogs/:id
app.delete('/api/blogs/:id', async (req, res) => {
  try {
    const [blog] = await db
      .select()
      .from(blogs)
      .where(eq(blogs.id, req.params.id));

    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    // Delete image from ImageKit if it was uploaded there
    if (blog.imageFileId) {
      await deleteFromImageKit(blog.imageFileId);
    }

    // Delete associated comments first (cascade safety)
    await db.delete(comments).where(eq(comments.blogId, req.params.id));

    // Delete the blog
    await db.delete(blogs).where(eq(blogs.id, req.params.id));

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/blogs/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/blogs/:id/like
app.post('/api/blogs/:id/like', async (req, res) => {
  try {
    const [blog] = await db.select().from(blogs).where(eq(blogs.id, req.params.id));
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    await db
      .update(blogs)
      .set({ likes: sql`${blogs.likes} + 1` })
      .where(eq(blogs.id, req.params.id));

    res.json({ success: true });
  } catch (err) {
    console.error('POST /api/blogs/:id/like error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/blogs/:id/view — fires Inngest event (non-blocking)
app.post('/api/blogs/:id/view', async (req, res) => {
  try {
    await inngest.send({
      name: 'blog/viewed',
      data: { blogId: req.params.id },
    });
    res.json({ success: true });
  } catch {
    // Never fail silently — view tracking is not critical
    res.json({ success: true });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// COMMENT ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/comments — all comments for admin panel
app.get('/api/comments', async (req, res) => {
  try {
    const all = await db
      .select()
      .from(comments)
      .orderBy(desc(comments.createdAt));
    res.json(all);
  } catch (err) {
    console.error('GET /api/comments error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/blogs/:id/comments
app.post('/api/blogs/:id/comments', async (req, res) => {
  try {
    const { author, content } = req.body;

    if (!author?.trim()) return res.status(400).json({ error: 'Author name is required' });
    if (!content?.trim()) return res.status(400).json({ error: 'Comment content is required' });

    // Check blog exists
    const [blog] = await db.select().from(blogs).where(eq(blogs.id, req.params.id));
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    const [comment] = await db.insert(comments).values({
      id:        uuid(),
      blogId:    req.params.id,
      author:    author.trim(),
      avatar:    req.body.avatar || `https://i.pravatar.cc/150?u=${author.trim()}`,
      content:   content.trim(),
      likes:     0,
      createdAt: new Date(),
    }).returning();

    res.status(201).json(comment);
  } catch (err) {
    console.error('POST /api/blogs/:id/comments error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/comments/:id
app.delete('/api/comments/:id', async (req, res) => {
  try {
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, req.params.id));

    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    await db.delete(comments).where(eq(comments.id, req.params.id));
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/comments/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/comments/:id/like
app.post('/api/comments/:id/like', async (req, res) => {
  try {
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, req.params.id));

    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    await db
      .update(comments)
      .set({ likes: sql`${comments.likes} + 1` })
      .where(eq(comments.id, req.params.id));

    res.json({ success: true });
  } catch (err) {
    console.error('POST /api/comments/:id/like error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE UPLOAD (ImageKit)
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });

    const result = await uploadToImageKit(
      req.file.buffer,
      req.file.originalname,
      '/bytescribe/blogs'
    );

    res.json({
      url:    result.url,
      fileId: result.fileId,
      name:   result.name,
    });
  } catch (err) {
    console.error('POST /api/upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// AI ASSISTANT (Gemini via Inngest)
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/ai/assist
app.post('/api/ai/assist', async (req, res) => {
  const { type, content, title } = req.body;

  if (!type) return res.status(400).json({ error: 'AI assist type is required' });

  const requestId = uuid();

  try {
    // Save pending record
    await db.insert(aiRequests).values({
      id:        requestId,
      type,
      status:    'pending',
      createdAt: new Date(),
    });

    // Try Inngest first (async background job)
    try {
      await inngest.send({
        name: 'ai/assist-requested',
        data: { type, content, title, requestId },
      });
      return res.json({ requestId, status: 'processing' });
    } catch {
      // Inngest not configured — run synchronously
    }

    // Synchronous fallback — run Gemini directly
    const result = await runGeminiAssist(type, content, title);

    // Update DB record
    await db
      .update(aiRequests)
      .set({ status: 'done', result })
      .where(eq(aiRequests.id, requestId));

    res.json({ requestId, status: 'done', result });

  } catch (err) {
    console.error('POST /api/ai/assist error:', err);

    // Mark as failed in DB
    await db
      .update(aiRequests)
      .set({ status: 'failed', result: err.message })
      .where(eq(aiRequests.id, requestId))
      .catch(() => {});

    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/result/:requestId — poll for async AI result
app.get('/api/ai/result/:requestId', async (req, res) => {
  try {
    const [record] = await db
      .select()
      .from(aiRequests)
      .where(eq(aiRequests.id, req.params.requestId));

    if (!record) return res.status(404).json({ error: 'AI request not found' });

    res.json(record);
  } catch (err) {
    console.error('GET /api/ai/result error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// NEWSLETTER
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) return res.status(400).json({ error: 'Email is required' });

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Check already subscribed
    const [existing] = await db
      .select()
      .from(newsletters)
      .where(eq(newsletters.email, email.toLowerCase().trim()));

    if (existing) {
      return res.json({ success: true, message: 'Already subscribed' });
    }

    const [subscriber] = await db.insert(newsletters).values({
      id:           uuid(),
      email:        email.toLowerCase().trim(),
      subscribedAt: new Date(),
    }).returning();

    // Fire welcome email via Inngest (non-blocking)
    inngest.send({
      name: 'newsletter/subscribed',
      data: { email: subscriber.email },
    }).catch(() => {});

    res.status(201).json({ success: true, subscriber });
  } catch (err) {
    console.error('POST /api/newsletter/subscribe error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const correctUsername = process.env.ADMIN_USERNAME;
  const correctPassword = process.env.ADMIN_PASSWORD;

  if (!correctUsername || !correctPassword) {
    return res.status(500).json({
      error: 'Admin credentials not configured. Add ADMIN_USERNAME and ADMIN_PASSWORD to your .env file',
    });
  }

  if (username === correctUsername && password === correctPassword) {
    return res.json({ success: true, message: 'Login successful' });
  }

  // Small delay to slow down brute force attempts
  setTimeout(() => {
    res.status(401).json({ error: 'Invalid username or password' });
  }, 500);
});

// GET /api/admin/stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [
      [blogsCount],
      [commentsCount],
      [subscribersCount],
      [viewsTotal],
    ] = await Promise.all([
      db.select({ count: sql`count(*)` }).from(blogs),
      db.select({ count: sql`count(*)` }).from(comments),
      db.select({ count: sql`count(*)` }).from(newsletters),
      db.select({ total: sql`coalesce(sum(views), 0)` }).from(blogs),
    ]);

    res.json({
      totalBlogs:       Number(blogsCount.count),
      totalComments:    Number(commentsCount.count),
      totalSubscribers: Number(subscribersCount.count),
      totalViews:       Number(viewsTotal.total),
    });
  } catch (err) {
    console.error('GET /api/admin/stats error:', err);
    res.status(500).json({ error: err.message });
  }
});



// ── Health check (Render) ───────────────────────────────────────────────────
app.get('/healthz', (_req, res) => {
  res.status(200).send('OK');
});
// ── 404 handler ───────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── Start server ──────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 ByteScribe API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Admin login: ${process.env.ADMIN_USERNAME ? '✅ configured' : '❌ not set in .env'}`);
  console.log(`   Gemini AI:   ${process.env.GEMINI_API_KEY ? '✅ configured' : '❌ not set in .env'}`);
  console.log(`   ImageKit:    ${process.env.IMAGEKIT_PUBLIC_KEY ? '✅ configured' : '❌ not set in .env'}`);
  console.log(`   Inngest:     ${process.env.INNGEST_EVENT_KEY ? '✅ configured' : '⚠️  not set — AI runs synchronously'}`);
});