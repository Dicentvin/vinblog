import { useState } from 'react';

interface Props {
  title:   string;
  url?:    string;
}

const MY_EMAIL   = 'dr.vincent@bytescribe.dev';
const MY_TWITTER = 'drvincent';

export default function SocialShare({ title, url }: Props): JSX.Element {
  const [copied, setCopied] = useState(false);

  const pageUrl   = url ?? (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl   = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(title);
  const emailBody    = encodeURIComponent(`I just read "${title}" on ByteScribe and thought you'd enjoy it:\n\n${pageUrl}`);

  const SHARES = [
    {
      label: 'Twitter / X',
      icon: '𝕏',
      bg: 'bg-sky-900/20 border-sky-500/30 hover:bg-sky-900/30',
      text: 'text-sky-400',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&via=${MY_TWITTER}`,
    },
    {
      label: 'WhatsApp',
      icon: '💬',
      bg: 'bg-emerald-900/20 border-emerald-500/30 hover:bg-emerald-900/30',
      text: 'text-emerald-400',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      label: 'LinkedIn',
      icon: 'in',
      bg: 'bg-blue-900/20 border-blue-500/30 hover:bg-blue-900/30',
      text: 'text-blue-400',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: 'Facebook',
      icon: 'f',
      bg: 'bg-indigo-900/20 border-indigo-500/30 hover:bg-indigo-900/30',
      text: 'text-indigo-400',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: 'Email',
      icon: '✉',
      bg: 'bg-surface2 border-border hover:border-accent',
      text: 'text-muted hover:text-accent',
      href: `mailto:?subject=${encodedTitle}&body=${emailBody}`,
    },
  ];

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback — select text
    }
  };

  return (
    <div className="mt-10 pt-8 border-t border-border">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-border" />
        <div className="text-center flex-shrink-0">
          <p className="text-[0.62rem] font-bold tracking-widests uppercase text-accent">Share This Article</p>
        </div>
        <div className="flex-1 h-px bg-border" />
      </div>

      <p className="text-center text-muted text-xs mb-5">
        If you found this article helpful, sharing it takes 5 seconds and makes a huge difference.
      </p>

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
      <div className="flex items-center gap-2 bg-surface2 border border-border rounded-xl px-3 py-2.5 max-w-md mx-auto">
        <span className="text-muted text-xs flex-1 truncate">{pageUrl}</span>
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

      {/* Author contact */}
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
