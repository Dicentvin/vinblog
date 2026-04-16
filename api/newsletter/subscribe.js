// api/newsletter/subscribe.js
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { getDb, newsletters, cors } from '../_lib/db.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const db    = getDb();
    const { email } = req.body;
    if (!email?.trim()) return res.status(400).json({ error: 'Email is required' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ error: 'Invalid email' });

    const [existing] = await db.select().from(newsletters).where(eq(newsletters.email, email.toLowerCase().trim()));
    if (existing) return res.json({ success: true, message: 'Already subscribed' });

    const [subscriber] = await db.insert(newsletters).values({
      id: uuid(), email: email.toLowerCase().trim(), subscribedAt: new Date(),
    }).returning();

    return res.status(201).json({ success: true, subscriber });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
