/**
 * Vercel Serverless Function: /api/og?id=BLOG_ID
 *
 * Social media crawlers (Twitter, Facebook, WhatsApp, LinkedIn) fetch this
 * endpoint to get Open Graph meta tags with the blog image + description.
 * Regular users are redirected to the SPA.
 */

const BACKEND = process.env.VITE_API_URL || 'https://vinblog.onrender.com';
const SITE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.SITE_URL || 'https://skylimits.vercel.app';

const SOCIAL_CRAWLERS = [
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'slackbot',
  'telegrambot',
  'discordbot',
  'applebot',
  'googlebot',
  'bingbot',
];

function isCrawler(userAgent = '') {
  const ua = userAgent.toLowerCase();
  return SOCIAL_CRAWLERS.some((bot) => ua.includes(bot));
}

function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(str = '', max = 200) {
  if (str.length <= max) return str;
  return str.slice(0, max - 1).trimEnd() + '…';
}

function buildHtml({ title, description, image, url, siteName = 'SkyLimits' }) {
  const safeTitle = escapeHtml(title);
  const safeDesc  = escapeHtml(truncate(description, 200));
  const safeImage = escapeHtml(image);
  const safeUrl   = escapeHtml(url);
  const safeSite  = escapeHtml(siteName);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} — ${safeSite}</title>
  <meta name="description" content="${safeDesc}" />

  <!-- Open Graph (Facebook, WhatsApp, LinkedIn, Discord) -->
  <meta property="og:type"        content="article" />
  <meta property="og:site_name"   content="${safeSite}" />
  <meta property="og:url"         content="${safeUrl}" />
  <meta property="og:title"       content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:image"       content="${safeImage}" />
  <meta property="og:image:width"  content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:site"        content="@drvincent" />
  <meta name="twitter:title"       content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image"       content="${safeImage}" />

  <!-- Redirect humans to the SPA after a tiny delay -->
  <meta http-equiv="refresh" content="0;url=${safeUrl.replace('/api/og?id=', '/?blog=').replace(/\?id=[^&]+/, '')}" />
  <link rel="canonical" href="${safeUrl}" />
</head>
<body>
  <p>Redirecting… <a href="${safeUrl}">Click here if not redirected.</a></p>
</body>
</html>`;
}

function buildFallbackHtml(url) {
  return buildHtml({
    title:       'SkyLimits',
    description: 'Insights on Fullstack, AI & ML, Health, Politics and more — by Dr. Vincent.',
    image:       `${SITE_URL}/og-default.png`,
    url,
  });
}

export default async function handler(req, res) {
  const { id } = req.query;
  const userAgent = req.headers['user-agent'] || '';

  // Canonical share URL for this blog post
  const shareUrl = `${SITE_URL}/?blog=${id}`;

  if (!id) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).send(buildFallbackHtml(SITE_URL));
  }

  // Non-crawlers: just redirect to the SPA
  if (!isCrawler(userAgent)) {
    res.setHeader('Location', shareUrl);
    return res.status(302).end();
  }

  // Crawlers: fetch the blog data and return OG HTML
  try {
    const apiRes = await fetch(`${BACKEND}/api/blogs/${id}`);
    if (!apiRes.ok) throw new Error(`API ${apiRes.status}`);

    const blog = await apiRes.json();

    const html = buildHtml({
      title:       blog.title,
      description: blog.description,
      image:       blog.image,
      url:         shareUrl,
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    // Cache for 10 minutes — crawlers re-fetch infrequently
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=60');
    return res.status(200).send(html);
  } catch (err) {
    console.error('[og.js] Failed to fetch blog:', err.message);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=30');
    return res.status(200).send(buildFallbackHtml(shareUrl));
  }
}
