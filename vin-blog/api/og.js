// api/og.js
// Serves Open Graph meta tags for social media crawlers (WhatsApp, Facebook, Twitter)
// Regular users get redirected to the blog post via hash URL

// IMPORTANT: do NOT build this from process.env.VERCEL_URL.
// VERCEL_URL is always the unique, per-deployment hash URL
// (e.g. drvincentblog-fe6lb89kr-....vercel.app) — even on a "production"
// deploy — and those hash URLs are gated behind Vercel's Deployment
// Protection. Social crawlers (WhatsApp, Facebook, etc.) can't authenticate,
// so they were being served Vercel's own login/"Overview" page instead of
// this site's OG tags, which is why link previews showed a blank Vercel
// card. Always point at the stable public domain instead. If you ever
// move to a different production domain, update this constant (or set
// CANONICAL_SITE_URL in your Vercel env vars).
const SITE_URL = process.env.CANONICAL_SITE_URL || 'https://drvincent.vercel.app';

const CRAWLERS = [
  'facebookexternalhit',
  'facebookcatalog',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
  'discordbot',
  'slackbot',
  'applebot',
  'googlebot',
  'bingbot',
  'pinterest',
  'vkshare',
  'w3c_validator',
];

function isCrawler(ua = '') {
  const lower = ua.toLowerCase();
  return CRAWLERS.some(bot => lower.includes(bot));
}

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function trunc(str = '', max = 200) {
  const s = str.replace(/<[^>]*>/g, '').trim(); // strip HTML tags
  return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + '…';
}

function buildPage({ title, description, image, pageUrl, redirectUrl }) {
  const t  = esc(title);
  const d  = esc(trunc(description, 200));
  const im = esc(image);
  const pu = esc(pageUrl);
  const ru = esc(redirectUrl);

  return `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>${t}</title>
  <meta name="description" content="${d}" />

  <!-- ── Open Graph (Facebook, WhatsApp, LinkedIn) ─────────────────── -->
  <meta property="og:type"         content="article" />
  <meta property="og:site_name"    content="SkyLimits" />
  <meta property="og:url"          content="${pu}" />
  <meta property="og:title"        content="${t}" />
  <meta property="og:description"  content="${d}" />
  <meta property="og:image"        content="${im}" />
  <meta property="og:image:secure_url" content="${im}" />
  <meta property="og:image:type"   content="image/jpeg" />
  <meta property="og:image:width"  content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt"    content="${t}" />

  <!-- ── Twitter Card ──────────────────────────────────────────────── -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:site"        content="@drvincent" />
  <meta name="twitter:creator"     content="@drvincent" />
  <meta name="twitter:title"       content="${t}" />
  <meta name="twitter:description" content="${d}" />
  <meta name="twitter:image"       content="${im}" />
  <meta name="twitter:image:alt"   content="${t}" />

  <!-- No auto-refresh here: regular visitors already get a plain 302
       redirect before ever reaching this HTML (see handler below), and
       crawlers should read these OG tags as-is rather than being sent
       on to the hash-routed SPA shell, which has no per-post meta tags. -->
  <link rel="canonical" href="${pu}" />
</head>
<body style="background:#0a0a0f;color:#e8e6f0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
  <div style="text-align:center;padding:2rem">
    <p style="font-size:1.1rem;margin-bottom:1rem">SkyLimits</p>
    <a href="${ru}" style="color:#d4af37;font-size:0.9rem">Read the article</a>
  </div>
</body>
</html>`;
}

export default async function handler(req, res) {
  const { id } = req.query;
  const ua     = req.headers['user-agent'] || '';

  // The shareable URL (what goes in WhatsApp/Facebook)
  const pageUrl    = `${SITE_URL}/api/og?id=${id}`;
  // Where humans end up after clicking
  const redirectUrl = `${SITE_URL}/#blog/${id}`;

  // ── No ID → return site homepage OG ──────────────────────────────────────
  if (!id) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).send(buildPage({
      title:       'SkyLimits — Medicine meets Technology',
      description: 'Evidence-based insights on medicine, gynaecologic oncology, AI, fullstack development and more — by Dr. Vincent.',
      image:       `${SITE_URL}/og-default.png`,
      pageUrl:     SITE_URL,
      redirectUrl: SITE_URL,
    }));
  }

  // ── Regular user (not a crawler) → redirect immediately ──────────────────
  if (!isCrawler(ua)) {
    res.setHeader('Location', redirectUrl);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(302).end();
  }

  // ── Social media crawler → fetch blog and return OG HTML ─────────────────
  try {
    const response = await fetch(`${SITE_URL}/api/blogs/${id}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) throw new Error(`API ${response.status}`);

    const blog = await response.json();
    if (!blog?.title) throw new Error('Missing blog title');

    // Ensure image is an absolute HTTPS URL
    let image = (blog.image || '').trim();
    if (!image || image.startsWith('/')) {
      image = `${SITE_URL}/og-default.png`;
    }
    // Force HTTPS (some Unsplash URLs come back as http)
    image = image.replace(/^http:\/\//, 'https://');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    // Some crawlers send a Range header; without this, Vercel's edge cache
    // can honor it and slice this HTML into a 206 partial response, which
    // can truncate the document before later <meta> tags (e.g. og:image)
    // are ever seen by the crawler.
    res.setHeader('Accept-Ranges', 'none');
    // Cache 10 minutes so repeated shares don't hammer the DB. no-transform
    // stops intermediate caches/proxies from altering or re-chunking the body.
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=60, no-transform');

    return res.status(200).send(buildPage({
      title:       blog.title,
      description: blog.description || 'Read this article on SkyLimits.',
      image,
      pageUrl,
      redirectUrl,
    }));

  } catch (err) {
    console.error('[og.js] error:', err.message);
    // On failure still redirect — don't show a broken page
    res.setHeader('Location', redirectUrl);
    return res.status(302).end();
  }
}
