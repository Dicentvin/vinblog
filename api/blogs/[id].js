// api/blogs/[id].js  →  /api/blogs/:id  and sub-routes
import { eq, desc, sql } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { getDb, blogs, comments, cors } from '../_lib/db.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  const db = getDb();
  const { id } = req.query;

  // Remove trailing sub-routes from id (e.g. "abc123/like" → "abc123")
  const blogId = id?.split('/')[0];
  const action = id?.split('/')[1]; // 'like' | 'view' | 'comments' | undefined

  // ── POST /api/blogs/:id/like ──────────────────────────────────────────────
  if (req.method === 'POST' && action === 'like') {
    try {
      await db.update(blogs).set({ likes: sql`${blogs.likes} + 1` }).where(eq(blogs.id, blogId));
      return res.json({ success: true });
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  // ── POST /api/blogs/:id/view ──────────────────────────────────────────────
  if (req.method === 'POST' && action === 'view') {
    try {
      await db.update(blogs).set({ views: sql`${blogs.views} + 1` }).where(eq(blogs.id, blogId));
      return res.json({ success: true });
    } catch { return res.json({ success: true }); } // never fail
  }

  // ── GET /api/blogs/:id/comments  or  POST /api/blogs/:id/comments ─────────
  if (action === 'comments') {
    if (req.method === 'GET') {
      try {
        const cmts = await db.select().from(comments)
          .where(eq(comments.blogId, blogId))
          .orderBy(desc(comments.createdAt));
        return res.json(cmts);
      } catch (err) { return res.status(500).json({ error: err.message }); }
    }

    if (req.method === 'POST') {
      try {
        const { author, content, avatar } = req.body;
        if (!author?.trim()) return res.status(400).json({ error: 'Author required' });
        if (!content?.trim()) return res.status(400).json({ error: 'Content required' });

        const [comment] = await db.insert(comments).values({
          id: uuid(), blogId, author: author.trim(),
          avatar: avatar || `https://i.pravatar.cc/150?u=${author.trim()}`,
          content: content.trim(), likes: 0, createdAt: new Date(),
        }).returning();
        return res.status(201).json(comment);
      } catch (err) { return res.status(500).json({ error: err.message }); }
    }
  }

  // ── GET /api/blogs/:id ────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const [blog] = await db.select().from(blogs).where(eq(blogs.id, blogId));
      if (!blog) return res.status(404).json({ error: 'Blog not found' });

      const cmts = await db.select().from(comments)
        .where(eq(comments.blogId, blogId))
        .orderBy(desc(comments.createdAt));

      return res.json({
        ...blog,
        author:   { name: blog.authorName, image: blog.authorImage, bio: blog.authorBio },
        comments: cmts,
      });
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  // ── PATCH /api/blogs/:id ──────────────────────────────────────────────────
  if (req.method === 'PATCH') {
    try {
      const [existing] = await db.select().from(blogs).where(eq(blogs.id, blogId));
      if (!existing) return res.status(404).json({ error: 'Blog not found' });

      const allowed = [
        'title', 'description', 'image', 'imageFileId', 'content',
        'contentBlocks', 'category', 'tags', 'authorName', 'authorImage',
        'authorBio', 'minsRead', 'featured', 'status',
      ];
      const updates = {};
      for (const f of allowed) {
        if (req.body[f] !== undefined) updates[f] = req.body[f];
      }
      if (!Object.keys(updates).length) return res.status(400).json({ error: 'No fields to update' });
      updates.updatedAt = new Date();

      const [updated] = await db.update(blogs).set(updates).where(eq(blogs.id, blogId)).returning();
      return res.json({
        ...updated,
        author: { name: updated.authorName, image: updated.authorImage, bio: updated.authorBio },
      });
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  // ── DELETE /api/blogs/:id ─────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    try {
      const [blog] = await db.select().from(blogs).where(eq(blogs.id, blogId));
      if (!blog) return res.status(404).json({ error: 'Blog not found' });

      await db.delete(comments).where(eq(comments.blogId, blogId));
      await db.delete(blogs).where(eq(blogs.id, blogId));
      return res.json({ success: true });
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
