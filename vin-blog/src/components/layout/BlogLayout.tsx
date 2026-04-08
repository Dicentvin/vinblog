// frontend/src/components/layout/BlogLayout.tsx
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
    { page: 'about'   as const, label: 'About'    },
    { page: 'contact' as const, label: 'Contact'  },
  ];

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && search.trim()) { navigate('blogs'); setMenuOpen(false); }
  };

  return (
    <div className="min-h-screen bg-ink text-[#e8e6f0] font-body">

      {/* ── Nav ── */}
      <nav className="border-b border-border sticky top-0 z-50 bg-ink/90 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-[62px] flex items-center justify-between gap-4">

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Logo */}
            <button onClick={() => navigate('home')} className="flex items-center gap-2 bg-transparent border-0 cursor-pointer p-0 flex-shrink-0">
              <div className="w-[30px] h-[30px] bg-accent rounded-md flex items-center justify-center flex-shrink-0">
                <span className="font-display font-bold text-ink text-[0.9rem]">S</span>
              </div>
              <span className="font-display font-bold text-[1.15rem] text-[#e8e6f0] tracking-tight hidden sm:block">
                SkyLimits
              </span>
            </button>

            {/* Desktop links */}
            <div className="hidden md:flex gap-4 lg:gap-5">
              {NAV.map(({ page, label }) => (
                <button key={label} onClick={() => navigate(page)}
                  className={['bg-transparent border-0 cursor-pointer text-[.78rem] font-medium tracking-[.05em] uppercase transition-colors pb-0.5 border-b-2 font-body',
                    currentPage === page ? 'text-accent border-accent' : 'text-muted border-transparent hover:text-accent',
                  ].join(' ')}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden sm:block">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none">⌕</span>
              <input
                className="bg-surface border border-border text-[#e8e6f0] rounded-lg pl-8 pr-3 py-1.5 text-[.78rem] w-[160px] lg:w-[190px] outline-none transition-colors focus:border-accent placeholder:text-muted font-body"
                placeholder="Search…" value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
            <button onClick={() => goAdmin()} className="btn-primary text-[.7rem] px-3 py-1.5 hidden sm:block">
              Admin ↗
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden bg-surface border border-border text-[#e8e6f0] w-9 h-9 rounded-lg text-sm leading-none cursor-pointer flex items-center justify-center"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-surface px-4 py-4 space-y-1">
            {/* Mobile search */}
            <div className="relative mb-3">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none">⌕</span>
              <input
                className="input-field pl-8 text-sm w-full"
                placeholder="Search articles…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
            {NAV.map(({ page, label }) => (
              <button key={label} onClick={() => { navigate(page); setMenuOpen(false); }}
                className={['flex w-full text-left text-sm transition-colors bg-transparent border-0 cursor-pointer font-body py-2.5 px-3 rounded-lg',
                  currentPage === page
                    ? 'text-accent bg-accent/10 font-semibold'
                    : 'text-muted hover:text-accent hover:bg-surface2',
                ].join(' ')}>
                {label}
              </button>
            ))}
            <div className="pt-2 border-t border-border mt-2">
              <button onClick={() => { goAdmin(); setMenuOpen(false); }} className="btn-primary w-full text-sm py-2.5">
                Admin ↗
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Content ── */}
      <main>{children}</main>

      {/* ── Footer ── */}
      <footer className="border-t border-border mt-14 py-9 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center flex-wrap gap-5">
            <div>
              <span className="font-display font-bold text-[1rem] text-[#e8e6f0]">SkyLimits</span>
              <p className="text-muted text-[0.74rem] mt-1">Quality articles for curious minds.</p>
            </div>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {NAV.map(({ page, label }) => (
                <button key={label} onClick={() => navigate(page)}
                  className="text-muted text-[.75rem] font-medium tracking-[.05em] uppercase hover:text-accent transition-colors bg-transparent border-0 cursor-pointer font-body">
                  {label}
                </button>
              ))}
              {['Privacy', 'Terms', 'RSS'].map(l => (
                <button key={l}
                  className="text-muted text-[.75rem] font-medium tracking-[.05em] uppercase hover:text-accent transition-colors bg-transparent border-0 cursor-pointer font-body">
                  {l}
                </button>
              ))}
            </div>
            <p className="text-muted text-[0.68rem] w-full sm:w-auto">© 2025 SkyLimits · Dr. Vincent. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}