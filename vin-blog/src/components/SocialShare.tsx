import { useState } from 'react';

interface Props {
  title:        string;
  blogId:       string;
  description?: string;
  image?:       string;
}

const MY_EMAIL   = 'dr.vincent@skylimits.dev';
const MY_TWITTER = 'drvincent';

function buildShareUrl(blogId: string): string {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://skylimits.vercel.app';
  return `${origin}/api/og?id=${encodeURIComponent(blogId)}`;
}

function buildHumanUrl(blogId: string): string {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://skylimits.vercel.app';
  return `${origin}/?blog=${encodeURIComponent(blogId)}`;
}

export default function SocialShare({ title, blogId, description, image }: Props): JSX.Element {
  const [copied, setCopied] = useState(false);

  const shareUrl     = buildShareUrl(blogId);
  const humanUrl     = buildHumanUrl(blogId);
  const encodedShare = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const emailBody    = encodeURIComponent(
    `I just read "${title}" on SkyLimits and thought you'd enjoy it:\n\n${humanUrl}`
  );

  const SHARES = [
    {
      label: 'Twitter / X',
      icon:  '𝕏',
      bg:    'bg-sky-900/20 border-sky-500/30 hover:bg-sky-900/30',
      text:  'text-sky-400',
      href:  `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedShare}&via=${MY_TWITTER}`,
    },
    {
      label: 'WhatsApp',
      icon:  '💬',
      bg:    'bg-emerald-900/20 border-emerald-500/30 hover:bg-emerald-900/30',
      text:  'text-emerald-400',
      href:  `https://wa.me/?text=${encodedTitle}%20${encodedShare}`,
    },
    {
      label: 'LinkedIn',
      icon:  'in',
      bg:    'bg-blue-900/20 border-blue-500/30 hover:bg-blue-900/30',
      text:  'text-blue-400',
      href:  `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShare}`,
    },
    {
      label: 'Facebook',
      icon:  'f',
      bg:    'bg-indigo-900/20 border-indigo-500/30 hover:bg-indigo-900/30',
      text:  'text-indigo-400',
      href:  `https://www.facebook.com/sharer/sharer.php?u=${encodedShare}`,
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
      await navigator.clipboard.writeText(humanUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement('textarea');
      el.value = humanUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="mt-10 pt-8 border-t border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-border" />
        <div className="text-center flex-shrink-0">
          <p className="text-[0.62rem] font-bold tracking-widest uppercase text-accent">Share This Article</p>
        </div>
        <div className="flex-1 h-px bg-border" />
      </div>

      <p className="text-center text-muted text-xs mb-5">
        If you found this article helpful, sharing it takes 5 seconds and makes a huge difference.
      </p>

      {image && (
        <div className="max-w-sm mx-auto mb-5 border border-border rounded-xl overflow-hidden bg-surface">
          <img src={image} alt={title} className="w-full h-32 object-cover" />
          <div className="p-3">
            <p className="text-[0.6rem] font-bold tracking-widest uppercase text-accent mb-0.5">skylimits.vercel.app</p>
            <p className="text-xs font-semibold text-white leading-snug line-clamp-2 mb-1">{title}</p>
            {description && (
              <p className="text-[0.65rem] text-muted leading-relaxed line-clamp-2">{description}</p>
            )}
          </div>
        </div>
      )}

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

      <div className="flex items-center gap-2 bg-surface2 border border-border rounded-xl px-3 py-2.5 max-w-md mx-auto">
        <span className="text-muted text-xs flex-1 truncate">{humanUrl}</span>
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

      <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 bg-surface border border-border rounded-xl p-4">
        <img
          src="/src/images/authorimg.png"
          alt="Dr. Vincent"
          className="w-12 h-12 rounded-full border-2 border-accent flex-shrink-0"
        />
        <div className="text-center sm:text-left flex-1">
          <p className="text-sm font-bold text-white">Written by Dr. Vincent</p>
          <p className="text-xs text-muted">Medical Doctor · Full-Stack Developer · Writer</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <a href={`mailto:${MY_EMAIL}`} className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5">
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
