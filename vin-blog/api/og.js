// vin-blog/api/og.js
const SITE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.VITE_SITE_URL || 'https://vinblog-q9oe.vercel.app';

const SOCIAL_CRAWLERS = [
  'facebookexternalhit','twitterbot','linkedinbot','whatsapp',
  'slackbot','telegrambot','discordbot','applebot','googlebot','bingbot',
];

function isCrawler(ua = '') {
  return SOCIAL_CRAWLERS.some(bot => ua.toLowerCase().includes(bot));
}

function escapeHtml(str = '') {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function truncate(str = '', max = 200) {
  return str.length <= max ? str : str.slice(0, max - 1).trimEnd() + '…';
}

function buildHtml({ title, description, image, canonicalUrl, redirectUrl }) {
  const t = escapeHtml(title);
  const d = escapeHtml(truncate(description, 200));
  const i = escapeHtml(image);
  const c = escapeHtml(canonicalUrl);
  const r = escapeHtml(redirectUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${t} — SkyLimits</title>
  <meta name="description" content="${d}"/>
  <meta property="og:type" content="article"/>
  <meta property="og:site_name" content="SkyLimits"/>
  <meta property="og:url" content="${c}"/>
  <meta property="og:title" content="${t}"/>
  <meta property="og:description" content="${d}"/>
  <meta property="og:image" content="${i}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:image:type" content="image/jpeg"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:site" content="@drvincent"/>
  <meta name="twitter:title" content="${t}"/>
  <meta name="twitter:description" content="${d}"/>
  <meta name="twitter:image" content="${i}"/>
  <meta http-equiv="refresh" content="0;url=${r}"/>
  <link rel="canonical" href="${c}"/>
</head>
<body><p>Redirecting… <a href="${r}">Click here</a></p></body>
</html>`;
}

export default async function handler(req, res) {
  const { id } = req.query;
  const ua = req.headers['user-agent'] || '';

  // The share URL — uses /blog/ path (not hash) so server can read it
  const shareUrl   = `${SITE_URL}/api/og?id=${id}`;
  const redirectUrl = `${SITE_URL}/#blog/${id}`;

  if (!id) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(buildHtml({
      title: 'SkyLimits',
      description: 'Insights on medicine, tech and the modern world — by Dr. Vincent.',
      image: `${SITE_URL}/og-default.png`,
      canonicalUrl: SITE_URL,
      redirectUrl: SITE_URL,
    }));
  }

  // Regular users → redirect to blog post
  if (!isCrawler(ua)) {
    res.setHeader('Location', redirectUrl);
    return res.status(302).end();
  }

  // Social media crawlers → return OG HTML with blog data
  try {
    const apiBase = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : SITE_URL;

    const apiRes = await fetch(`${apiBase}/api/blogs/${id}`);
    if (!apiRes.ok) throw new Error(`API ${apiRes.status}`);

    const blog = await apiRes.json();
    if (!blog?.title) throw new Error('No title');

    // Make sure image is an absolute URL
    let image = blog.image || '';
    if (image && image.startsWith('/')) {
      image = `${SITE_URL}${image}`;
    }
    if (!image) image = `${SITE_URL}/og-default.png`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=60');
    return res.status(200).send(buildHtml({
      title:        blog.title,
      description:  blog.description || '',
      image,
      canonicalUrl: shareUrl,
      redirectUrl,
    }));
  } catch (err) {
    console.error('[og.js]', err.message);
    res.setHeader('Location', redirectUrl);
    return res.status(302).end();
  }
}