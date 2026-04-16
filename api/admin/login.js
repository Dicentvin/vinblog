// api/admin/login.js
import { cors } from '../_lib/db.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const correctUser = process.env.ADMIN_USERNAME;
  const correctPass = process.env.ADMIN_PASSWORD;

  if (!correctUser || !correctPass) {
    return res.status(500).json({ error: 'Admin credentials not configured in environment variables' });
  }

  if (username === correctUser && password === correctPass) {
    return res.json({ success: true, message: 'Login successful' });
  }

  await new Promise(r => setTimeout(r, 500));
  return res.status(401).json({ error: 'Invalid username or password' });
}
