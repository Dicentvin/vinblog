// api/comments/[id].js
// Handles: DELETE /api/comments/:id
//          POST /api/comments/:id/like

import { eq, sql } from 'drizzle-orm';
import { getDb, comments, cors } from '../_lib/db.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  const db = getDb();

  // Detect ID and action from URL path
  const urlPath = req.url?.split('?')[0] ?? '';
  const parts   = urlPath.replace(/^\/api\/comments\//, '').split('/');
  const cmtId   = parts[0];
  const action  = parts[1]; // 'like' | undefined

  if (!cmtId) {
    return res.status(400).json({ error: 'Comment ID is required' });
  }

  // ── POST /api/comments/:id/like ───────────────────────────────────────────
  if (req.method === 'POST' && action === 'like') {
    try {
      await db.update(comments)
        .set({ likes: sql`${comments.likes} + 1` })
        .where(eq(comments.id, cmtId));
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── DELETE /api/comments/:id ──────────────────────────────────────────────
  if (req.method === 'DELETE') {
    try {
      const [existing] = await db.select().from(comments).where(eq(comments.id, cmtId));
      if (!existing) return res.status(404).json({ error: 'Comment not found' });

      await db.delete(comments).where(eq(comments.id, cmtId));
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
