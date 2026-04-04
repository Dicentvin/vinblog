import { inngest } from '../lib/inngest.js';
import { db } from '../db/index.js';
import { blogs, newsletters, aiRequests } from '../db/schema.js';
import { eq, sql, desc } from 'drizzle-orm';
import { runGeminiAssist } from '../lib/gemini.js';

// ── 1. Increment view count (background — non-blocking) ───────────────────────
export const incrementViewCount = inngest.createFunction(
  { id: 'increment-view-count', name: 'Increment Blog View Count' },
  { event: 'blog/viewed' },
  async ({ event }) => {
    const { blogId } = event.data;
    await db
      .update(blogs)
      .set({ views: sql`${blogs.views} + 1` })
      .where(eq(blogs.id, blogId));
    return { success: true, blogId };
  }
);

// ── 2. Send welcome email after newsletter signup ─────────────────────────────
export const sendWelcomeEmail = inngest.createFunction(
  { id: 'send-welcome-email', name: 'Send Welcome Email' },
  { event: 'newsletter/subscribed' },
  async ({ event, step }) => {
    const { email } = event.data;

    // Wait 1 minute before sending to avoid triggering spam filters
    await step.sleep('wait-before-send', '1m');

    await step.run('send-welcome', async () => {
      // TODO: integrate with Resend or SendGrid
      // Example with Resend:
      // await resend.emails.send({
      //   from: 'ByteScribe <hello@bytescribe.dev>',
      //   to: email,
      //   subject: 'Welcome to ByteScribe! 🎉',
      //   html: `<h1>Welcome!</h1><p>Thanks for subscribing to ByteScribe...</p>`
      // });
      console.log(`📧 Welcome email queued for: ${email}`);
    });

    return { sent: true, email };
  }
);

// ── 3. Process AI writing task in background ──────────────────────────────────
export const processAiAssist = inngest.createFunction(
  { id: 'process-ai-assist', name: 'Process AI Writing Request',
    retries: 3 },
  { event: 'ai/assist-requested' },
  async ({ event }) => {
    const { type, content, title, requestId } = event.data;

    try {
      // Run Gemini AI
      const result = await runGeminiAssist(type, content, title);

      // Store result in DB so frontend can poll for it
      await db
        .update(aiRequests)
        .set({ status: 'done', result })
        .where(eq(aiRequests.id, requestId));

      return { success: true, requestId };
    } catch (err) {
      // Mark as failed in DB
      await db
        .update(aiRequests)
        .set({ status: 'failed', result: err.message })
        .where(eq(aiRequests.id, requestId));
      throw err; // Inngest will retry
    }
  }
);

// ── 4. Weekly digest — every Monday at 9am ───────────────────────────────────
export const sendWeeklyDigest = inngest.createFunction(
  { id: 'weekly-digest', name: 'Send Weekly Digest' },
  { cron: '0 9 * * MON' },
  async ({ step }) => {
    // Get all subscribers
    const subscribers = await step.run('get-subscribers', async () => {
      return db.select().from(newsletters);
    });

    // Get top 5 posts this week by views
    const topPosts = await step.run('get-top-posts', async () => {
      return db
        .select()
        .from(blogs)
        .where(eq(blogs.status, 'published'))
        .orderBy(desc(blogs.views))
        .limit(5);
    });

    // Send digest to each subscriber
    await step.run('send-digests', async () => {
      for (const sub of subscribers) {
        // TODO: integrate with Resend or SendGrid
        // await resend.emails.send({ to: sub.email, subject: 'ByteScribe Weekly Digest', ... })
        console.log(`📰 Weekly digest sent to: ${sub.email}`);
      }
    });

    return {
      subscribers: subscribers.length,
      posts:       topPosts.length,
      sentAt:      new Date().toISOString(),
    };
  }
);

// ── 5. Clean up old AI request cache (daily) ─────────────────────────────────
export const cleanupAiCache = inngest.createFunction(
  { id: 'cleanup-ai-cache', name: 'Clean Up AI Request Cache' },
  { cron: '0 0 * * *' }, // midnight daily
  async ({ step }) => {
    await step.run('delete-old-requests', async () => {
      // Delete AI requests older than 24 hours
      await db.execute(
        sql`DELETE FROM ai_requests WHERE created_at < NOW() - INTERVAL '24 hours'`
      );
    });
    return { cleaned: true };
  }
);
