// api/blogs/index.js  →  GET /api/blogs  |  POST /api/blogs
import { eq, desc, ilike, or, sql, and } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { getDb, blogs, comments, cors } from '../_lib/db.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  const db = getDb();

  // ── GET /api/blogs ────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const {
        search,
        category,
        limit    = '8',
        offset   = '0',
        sort     = 'newest',
        status   = 'published',
      } = req.query;

      const conditions = [];
      if (status)   conditions.push(eq(blogs.status, status));
      if (search)   conditions.push(or(ilike(blogs.title, `%${search}%`), ilike(blogs.description, `%${search}%`)));
      if (category) conditions.push(ilike(blogs.category, category)); // case-insensitive

      const baseQ = db.select({
        id: blogs.id, title: blogs.title, description: blogs.description,
        image: blogs.image, imageFileId: blogs.imageFileId,
        category: blogs.category, tags: blogs.tags,
        authorName: blogs.authorName, authorImage: blogs.authorImage, authorBio: blogs.authorBio,
        minsRead: blogs.minsRead, featured: blogs.featured, status: blogs.status,
        views: blogs.views, likes: blogs.likes,
        publishedAt: blogs.publishedAt, createdAt: blogs.createdAt,
      }).from(blogs);

      const filteredQ = conditions.length ? baseQ.where(and(...conditions)) : baseQ;
      const sortedQ   = sort === 'popular'
        ? filteredQ.orderBy(desc(blogs.views))
        : sort === 'mostread'
          ? filteredQ.orderBy(desc(blogs.minsRead))
          : filteredQ.orderBy(desc(blogs.publishedAt));

      const data = await sortedQ.limit(Math.min(Number(limit), 200)).offset(Number(offset));

      const countQ = conditions.length
        ? db.select({ count: sql`count(*)` }).from(blogs).where(and(...conditions))
        : db.select({ count: sql`count(*)` }).from(blogs);
      const [{ count }] = await countQ;

      const blogIds = data.map(b => b.id);
      let allComments = [];
      if (blogIds.length > 0) {
        allComments = await db.select().from(comments).where(
          sql`${comments.blogId} = ANY(ARRAY[${sql.raw(blogIds.map(id => `'${id}'`).join(','))}]::text[])`
        );
      }

      const result = data.map(blog => ({
        ...blog,
        author:   { name: blog.authorName, image: blog.authorImage, bio: blog.authorBio },
        comments: allComments.filter(c => c.blogId === blog.id),
      }));

      return res.json({ data: result, total: Number(count) });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST /api/blogs ───────────────────────────────────────────────────────
  if (req.method === 'POST') {
    try {
      const {
        title, description, image, imageFileId, content,
        contentBlocks, category, tags, authorName, authorImage,
        authorBio, minsRead, featured, status,
      } = req.body;

      if (!title?.trim())    return res.status(400).json({ error: 'Title is required' });
      if (!category?.trim()) return res.status(400).json({ error: 'Category is required' });

      const [blog] = await db.insert(blogs).values({
        id: uuid(), title: title.trim(), description: description?.trim(),
        image, imageFileId, content, contentBlocks, category,
        tags: Array.isArray(tags) ? tags : [],
        authorName: authorName?.trim() || 'Dr. Vincent',
        authorImage: authorImage || '/authorimg.png',
        authorBio: authorBio?.trim() || 'Medical Doctor · Developer · Writer',
        minsRead: Number(minsRead) || 5,
        featured: Boolean(featured),
        status: status || 'draft',
        views: 0, likes: 0,
        publishedAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
      }).returning();

      return res.status(201).json(blog);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
