import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

// Use the transaction/session pooler URL (port 5432, not 6543)
// In Supabase dashboard: Settings → Database → Connection string → URI
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:              { rejectUnauthorized: false },
  // Serverless-friendly pool settings — small pool, fast release
  max:              3,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
});

export const db = drizzle(pool, { schema });

pool.on('error', (err) => {
  console.error('Unexpected pool error:', err.message);
});

export async function testConnection(): Promise<void> {
  const client = await pool.connect();
  client.release();
  console.log('✅ Database connected');
}
