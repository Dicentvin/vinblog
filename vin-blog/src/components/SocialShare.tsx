import { useState } from 'react';

interface Props {
  title:        string;
  blogId:       string;
  description?: string;
  image?:       string;
}

const MY_EMAIL   = 'dr.vincent@skylimits.dev';
const MY_TWITTER = 'drvincent';

export default function SocialShare({ title, blogId, description, image }: Props): JSX.Element {
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://vinblog-q9oe.vercel.app';

  // This is the URL shared to social media
  // It goes to /api/og which returns proper OG meta tags for crawlers
  // and redirects humans to /#blog/ID
  const shareUrl     = `${origin}/api/og?id=${encodeURIComponent(blogId)}`;
  const encodedUrl   = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const emailBody    = encodeURIComponent(
    `I just read "${title}" on SkyLimits.\n\nRead it here: ${shareUrl}`
  );

  const SHARES = [
    {
      label: 'WhatsApp',
      icon:  '💬',
      bg:    'bg-emerald-900/20 border-emerald-500/30 hover:bg-emerald-900/30',
      text:  'text-emerald-400',
      // WhatsApp uses this format to generate the preview
      href:  `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      label: 'Facebook',
      icon:  'f',
      bg:    'bg-blue-900/20 border-blue-500/30 hover:bg-blue-900/30',
      text:  'text-blue-400',
      href:  `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: 'Twitter / X',
      icon:  '𝕏',
      bg:    'bg-sky-900/20 border-sky-500/30 hover:bg-sky-900/30',
      text:  'text-sky-400',
      href:  `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&via=${MY_TWITTER}`,
    },
    {
      label: 'LinkedIn',
      icon:  'in',
      bg:    'bg-indigo-900/20 border-indigo-500/30 hover:bg-indigo-900/30',
      text:  'text-indigo-400',
      href:  `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: 'Email',
      icon:  '✉',
      bg:    'bg-surface2 border-border hover:border-accent',
      text:  'text-muted hover:text-accent',
      href:  `mailto:?subject=${encodedTitle}&body=${emailBody}`,
    },
  ];

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mt-10 pt-8 border-t border-border">

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-px bg-border" />
        <p className="text-[0.62rem] font-bold tracking-widest uppercase text-accent flex-shrink-0">
          Share This Article
        </p>
        <div className="flex-1 h-px bg-border" />
      </div>

      <p className="text-center text-muted text-xs mb-5">
        Share this article — it will show the image and title on WhatsApp and Facebook.
      </p>

      {/* Blog preview card (shows what social media will display) */}
      {image && (
        <div className="max-w-sm mx-auto mb-5 border border-border rounded-xl overflow-hidden bg-surface">
          <img src={image} alt={title} className="w-full h-36 object-cover" />
          <div className="p-3">
            <p className="text-[0.58rem] font-bold tracking-widest uppercase text-accent mb-1">
              vinblog-q9oe.vercel.app
            </p>
            <p className="text-xs font-semibold text-white leading-snug line-clamp-2 mb-1">{title}</p>
            {description && (
              <p className="text-[0.65rem] text-muted leading-relaxed line-clamp-2">{description}</p>
            )}
          </div>
        </div>
      )}

      {/* Share buttons */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {SHARES.map(s => (
          <a
            key={s.label}
            href={s.href}
            target={s.label === 'Email' ? '_self' : '_blank'}
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${s.bg} ${s.text}`}
          >
            <span className="font-bold text-base leading-none">{s.icon}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </a>
        ))}
      </div>

      {/* Copy link */}
      <div className="flex items-center gap-2 bg-surface2 border border-border rounded-xl px-3 py-2.5 max-w-md mx-auto mb-6">
        <span className="text-muted text-xs flex-1 truncate">{shareUrl}</span>
        <button
          onClick={() => void handleCopy()}
          className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-body ${
            copied
              ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400'
              : 'bg-surface border-border text-muted hover:border-accent hover:text-accent'
          }`}
        >
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>
      </div>

      {/* Author card */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface border border-border rounded-xl p-4">
        <img
          src="/authorimg.png"
          alt="Dr. Vincent"
          className="w-12 h-12 rounded-full border-2 border-accent flex-shrink-0 object-cover"
          onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://i.pravatar.cc/150?img=51'; }}
        />
        <div className="text-center sm:text-left flex-1">
          <p className="text-sm font-bold text-white">Written by Dr. Vincent</p>
          <p className="text-xs text-muted">Medical Doctor · Gynaecologic Oncologist · Full-Stack Developer</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <a
            href={`mailto:${MY_EMAIL}`}
            className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            📧 Email
          </a>
          <a
            href={`https://twitter.com/${MY_TWITTER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            𝕏 Follow
          </a>
        </div>
      </div>
    </div>
  );
}
