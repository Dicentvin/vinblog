// api/comments/index.js  →  GET /api/comments  (admin all comments)
import { desc } from 'drizzle-orm';
import { getDb, comments, cors } from '../_lib/db.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const db  = getDb();
    const all = await db.select().from(comments).orderBy(desc(comments.createdAt));
    return res.json(all);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
