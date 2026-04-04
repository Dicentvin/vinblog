import { useState, type ReactNode } from 'react';
import { useNav, useAppSelector } from '../../hooks';
import { selectCurrentPage } from '../../store/uiSlice';

interface Props { children: ReactNode; }

export default function BlogLayout({ children }: Props): JSX.Element {
  const { navigate, goAdmin } = useNav();
  const currentPage = useAppSelector(selectCurrentPage);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch]     = useState('');

  const NAV = [
    { page: 'home'    as const, label: 'Home'    },
    { page: 'blogs'   as const, label: 'Articles' },
    { page: 'about'   as const, label: 'About'   },
    { page: 'contact' as const, label: 'Contact'  },
  ];

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && search.trim()) { navigate('blogs'); setMenuOpen(false); }
  };

  return (
    <div className="min-h-screen bg-ink text-[#e8e6f0] font-body">
      {/* ── Nav ── */}
      <nav className="border-b border-border sticky top-0 z-50 bg-ink/90 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo */}
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-2.5 bg-transparent border-0 cursor-pointer p-0 flex-shrink-0"
          >
            <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
              <span className="font-display font-bold text-ink text-sm">S</span>
            </div>
            <span className="font-display font-bold text-lg text-[#e8e6f0] tracking-tight hidden sm:block">
              SkyLimits
            </span>
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex gap-5">
            {NAV.map(({ page, label }) => (
              <button
                key={label}
                onClick={() => navigate(page)}
                className={[
                  'bg-transparent border-0 cursor-pointer text-xs font-medium tracking-widest uppercase transition-colors pb-0.5 border-b-2 font-body',
                  currentPage === page
                    ? 'text-accent border-accent'
                    : 'text-muted border-transparent hover:text-accent',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden sm:block">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none">⌕</span>
              <input
                className="bg-surface border border-border text-[#e8e6f0] rounded-lg pl-8 pr-3 py-1.5 text-xs w-40 lg:w-52 outline-none transition-colors focus:border-accent placeholder:text-muted"
                placeholder="Search articles…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
            <button onClick={() => goAdmin()} className="btn-primary text-[0.7rem] px-3 py-1.5 hidden sm:block">
              Admin ↗
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden bg-surface border border-border text-[#e8e6f0] px-2.5 py-1.5 rounded-lg text-sm leading-none cursor-pointer"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-surface px-4 py-4 space-y-2">
            <div className="relative mb-3">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none">⌕</span>
              <input
                className="input-field pl-8 text-sm"
                placeholder="Search articles…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
            {NAV.map(({ page, label }) => (
              <button
                key={label}
                onClick={() => { navigate(page); setMenuOpen(false); }}
                className={[
                  'block w-full text-left text-sm transition-colors bg-transparent border-0 cursor-pointer font-body py-2 px-2 rounded-lg',
                  currentPage === page
                    ? 'text-accent bg-accent/10 font-semibold'
                    : 'text-muted hover:text-accent hover:bg-surface2',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => { goAdmin(); setMenuOpen(false); }}
              className="btn-primary w-full text-sm py-2 mt-2"
            >
              Admin ↗
            </button>
          </div>
        )}
      </nav>

      {/* ── Content ── */}
      <main>{children}</main>

      {/* ── Footer ── */}
      <footer className="border-t border-border mt-16 sm:mt-20 py-10 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
                  <span className="font-display font-bold text-ink text-sm">S</span>
                </div>
                <span className="font-display font-bold text-lg text-[#e8e6f0]">SkyLimits</span>
              </div>
              <p className="text-muted text-sm leading-relaxed max-w-xs">
                A medical doctor's perspective on technology, health, and the world. Evidence-based insights for curious minds.
              </p>
              {/* Social links */}
              <div className="flex gap-3 mt-4">
                {[
                  { icon: '𝕏', href: 'https://twitter.com', label: 'Twitter' },
                  { icon: 'in', href: 'https://linkedin.com', label: 'LinkedIn' },
                  { icon: '▶', href: 'https://youtube.com', label: 'YouTube' },
                ].map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-surface2 border border-border flex items-center justify-center text-muted hover:text-accent hover:border-accent transition-all text-sm font-bold"
                    aria-label={s.label}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-xs font-bold tracking-widest uppercase text-white mb-3">Navigation</h4>
              <div className="space-y-2">
                {NAV.map(({ page, label }) => (
                  <button
                    key={label}
                    onClick={() => navigate(page)}
                    className="block text-sm text-muted hover:text-accent transition-colors bg-transparent border-0 cursor-pointer font-body text-left"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xs font-bold tracking-widest uppercase text-white mb-3">Contact</h4>
              <div className="space-y-2">
                <a href="mailto:dr.vincent@skylimits.dev" className="block text-sm text-muted hover:text-accent transition-colors">
                  dr.vincent@skylimits.dev
                </a>
                <a href="tel:+2348012345678" className="block text-sm text-muted hover:text-accent transition-colors">
                  +234 801 234 5678
                </a>
                <button
                  onClick={() => navigate('contact')}
                  className="btn-primary text-xs px-4 py-2 mt-2"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-muted text-xs">© 2025 SkyLimits · Dr. Vincent. All rights reserved.</p>
            <div className="flex gap-4">
              {['Privacy Policy', 'Terms', 'RSS'].map(l => (
                <button key={l} className="text-muted text-xs hover:text-accent transition-colors bg-transparent border-0 cursor-pointer font-body">
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
