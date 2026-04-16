// api/_lib/db.js
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { pgTable, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

// ── Schema (inline to avoid import issues in Vercel) ─────────────────────────
export const blogs = pgTable('blogs', {
  id:            text('id').primaryKey(),
  title:         text('title').notNull(),
  description:   text('description'),
  image:         text('image'),
  imageFileId:   text('image_file_id'),
  content:       text('content'),
  contentBlocks: jsonb('content_blocks'),
  category:      text('category').notNull(),
  tags:          text('tags').array().default([]),
  authorName:    text('author_name'),
  authorImage:   text('author_image'),
  authorBio:     text('author_bio'),
  minsRead:      integer('mins_read').default(5),
  featured:      boolean('featured').default(false),
  status:        text('status').default('draft'),
  views:         integer('views').default(0),
  likes:         integer('likes').default(0),
  publishedAt:   timestamp('published_at').defaultNow(),
  createdAt:     timestamp('created_at').defaultNow(),
  updatedAt:     timestamp('updated_at').defaultNow(),
});

export const comments = pgTable('comments', {
  id:        text('id').primaryKey(),
  blogId:    text('blog_id').references(() => blogs.id, { onDelete: 'cascade' }),
  author:    text('author').notNull(),
  avatar:    text('avatar'),
  content:   text('content').notNull(),
  likes:     integer('likes').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const newsletters = pgTable('newsletters', {
  id:           text('id').primaryKey(),
  email:        text('email').notNull().unique(),
  subscribedAt: timestamp('subscribed_at').defaultNow(),
});

export const aiRequests = pgTable('ai_requests', {
  id:        text('id').primaryKey(),
  type:      text('type').notNull(),
  status:    text('status').default('pending'),
  result:    text('result'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── DB connection (pooled, reused across warm invocations) ────────────────────
let _db = null;

export function getDb() {
  if (_db) return _db;
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3, // keep low for serverless
  });
  _db = drizzle(pool, { schema: { blogs, comments, newsletters, aiRequests } });
  return _db;
}

// ── CORS helper ───────────────────────────────────────────────────────────────
export function cors(req, res) {
  const allowed = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  const origin = req.headers.origin;
  if (!origin || allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // handled
  }
  return false;
}
