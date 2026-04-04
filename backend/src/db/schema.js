import { pgTable, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

// ── Blogs ─────────────────────────────────────────────────────────────────────
export const blogs = pgTable('blogs', {
  id:            text('id').primaryKey(),
  title:         text('title').notNull(),
  description:   text('description'),
  image:         text('image'),           // ImageKit public URL
  imageFileId:   text('image_file_id'),   // ImageKit file ID for deletion
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

// ── Comments ──────────────────────────────────────────────────────────────────
export const comments = pgTable('comments', {
  id:        text('id').primaryKey(),
  blogId:    text('blog_id').references(() => blogs.id, { onDelete: 'cascade' }),
  author:    text('author').notNull(),
  avatar:    text('avatar'),
  content:   text('content').notNull(),
  likes:     integer('likes').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Newsletter Subscribers ────────────────────────────────────────────────────
export const newsletters = pgTable('newsletters', {
  id:          text('id').primaryKey(),
  email:       text('email').notNull().unique(),
  subscribedAt: timestamp('subscribed_at').defaultNow(),
});

// ── AI Request Cache (optional — stores AI results for polling) ───────────────
export const aiRequests = pgTable('ai_requests', {
  id:        text('id').primaryKey(),
  type:      text('type').notNull(),
  status:    text('status').default('pending'), // pending | done | failed
  result:    text('result'),
  createdAt: timestamp('created_at').defaultNow(),
});
