// api/blogs/[id].js
// Handles: GET/PATCH/DELETE /api/blogs/:id
//          POST /api/blogs/:id/like
//          POST /api/blogs/:id/view
//          GET/POST /api/blogs/:id/comments
//
// Vercel passes the dynamic segment as req.query.id
// When the rewrite rule maps /api/blogs/:id/like → this file,
// Vercel sets req.query.id = the :id segment only (not "id/like").
// So we detect the action from the original URL path instead.

import { eq, desc, sql } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { getDb, blogs, comments, cors } from '../_lib/db.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  const db = getDb();

  // Detect blog ID and action from the URL path
  // e.g. /api/blogs/abc123/like  → blogId=abc123, action=like
  // e.g. /api/blogs/abc123       → blogId=abc123, action=undefined
  const urlPath = req.url?.split('?')[0] ?? '';
  const parts   = urlPath.replace(/^\/api\/blogs\//, '').split('/');
  const blogId  = parts[0];
  const action  = parts[1]; // 'like' | 'view' | 'comments' | undefined

  if (!blogId) {
    return res.status(400).json({ error: 'Blog ID is required' });
  }

  // ── POST /api/blogs/:id/like ──────────────────────────────────────────────
  if (req.method === 'POST' && action === 'like') {
    try {
      await db.update(blogs)
        .set({ likes: sql`${blogs.likes} + 1` })
        .where(eq(blogs.id, blogId));
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST /api/blogs/:id/view ──────────────────────────────────────────────
  if (req.method === 'POST' && action === 'view') {
    try {
      await db.update(blogs)
        .set({ views: sql`${blogs.views} + 1` })
        .where(eq(blogs.id, blogId));
      return res.json({ success: true });
    } catch {
      return res.json({ success: true }); // never fail view tracking
    }
  }

  // ── GET /api/blogs/:id/comments ───────────────────────────────────────────
  if (req.method === 'GET' && action === 'comments') {
    try {
      const cmts = await db.select().from(comments)
        .where(eq(comments.blogId, blogId))
        .orderBy(desc(comments.createdAt));
      return res.json(cmts);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST /api/blogs/:id/comments ─────────────────────────────────────────
  if (req.method === 'POST' && action === 'comments') {
    try {
      const { author, content, avatar } = req.body;
      if (!author?.trim())  return res.status(400).json({ error: 'Author is required' });
      if (!content?.trim()) return res.status(400).json({ error: 'Content is required' });

      const [comment] = await db.insert(comments).values({
        id:        uuid(),
        blogId,
        author:    author.trim(),
        avatar:    avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(author.trim())}`,
        content:   content.trim(),
        likes:     0,
        createdAt: new Date(),
      }).returning();

      return res.status(201).json(comment);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── GET /api/blogs/:id ────────────────────────────────────────────────────
  if (req.method === 'GET' && !action) {
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
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── PATCH /api/blogs/:id ──────────────────────────────────────────────────
  if (req.method === 'PATCH' && !action) {
    try {
      const [existing] = await db.select().from(blogs).where(eq(blogs.id, blogId));
      if (!existing) return res.status(404).json({ error: 'Blog not found' });

      const allowed = [
        'title', 'description', 'image', 'imageFileId', 'content',
        'contentBlocks', 'category', 'tags', 'authorName', 'authorImage',
        'authorBio', 'minsRead', 'featured', 'status',
      ];

      const updates = {};
      for (const field of allowed) {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      }

      if (!Object.keys(updates).length) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      updates.updatedAt = new Date();

      const [updated] = await db.update(blogs)
        .set(updates)
        .where(eq(blogs.id, blogId))
        .returning();

      return res.json({
        ...updated,
        author: { name: updated.authorName, image: updated.authorImage, bio: updated.authorBio },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── DELETE /api/blogs/:id ─────────────────────────────────────────────────
  if (req.method === 'DELETE' && !action) {
    try {
      const [blog] = await db.select().from(blogs).where(eq(blogs.id, blogId));
      if (!blog) return res.status(404).json({ error: 'Blog not found' });

      await db.delete(comments).where(eq(comments.blogId, blogId));
      await db.delete(blogs).where(eq(blogs.id, blogId));
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
