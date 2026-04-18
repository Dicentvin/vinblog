// api/admin/stats.js
import { sql } from 'drizzle-orm';
import { getDb, blogs, comments, newsletters, cors } from '../_lib/db.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const db = getDb();
    const [[blogsCount], [commentsCount], [subscribersCount], [viewsTotal]] = await Promise.all([
      db.select({ count: sql`count(*)` }).from(blogs),
      db.select({ count: sql`count(*)` }).from(comments),
      db.select({ count: sql`count(*)` }).from(newsletters),
      db.select({ total: sql`coalesce(sum(views), 0)` }).from(blogs),
    ]);

    return res.json({
      totalBlogs:       Number(blogsCount.count),
      totalComments:    Number(commentsCount.count),
      totalSubscribers: Number(subscribersCount.count),
      totalViews:       Number(viewsTotal.total),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
