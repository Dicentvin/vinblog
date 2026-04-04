import { type ReactNode } from 'react';
import { useNav, useAdminSidebar, useAppSelector } from '../../hooks';
import { selectAdminPage } from '../../store/uiSlice';
import type { AdminPage } from '../../types';

interface Props {
  children:  ReactNode;
  onLogout?: () => void;
}
interface NavItem { id: AdminPage; label: string; icon: string; }

const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard',   icon: '⬡' },
  { id: 'blogs',     label: 'All Blogs',   icon: '📝' },
  { id: 'create',    label: 'Create Blog', icon: '✚' },
  { id: 'comments',  label: 'Comments',    icon: '💬' },
];

export default function AdminLayout({ children, onLogout }: Props): JSX.Element {
  const { exitAdmin, switchAdminPage } = useNav();
  const { open, toggle, close }        = useAdminSidebar();
  const adminPage                      = useAppSelector(selectAdminPage);

  const handleLogout = (): void => {
    onLogout?.();
    close();
  };

  return (
    <div className="min-h-screen bg-ink text-[#e8e6f0] font-body flex">

      {/* ── MOBILE TOPBAR ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
        <button
          onClick={toggle}
          className="bg-surface2 border border-border text-[#e8e6f0] w-9 h-9 rounded-lg cursor-pointer text-base leading-none flex items-center justify-center flex-shrink-0"
          aria-label="Open menu"
        >
          ☰
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-accent rounded flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-ink text-[0.72rem]">S</span>
          </div>
          <span className="font-display font-bold text-sm text-[#e8e6f0]">SkyLimits</span>
          <span className="text-[0.55rem] text-muted bg-surface2 px-1.5 py-0.5 rounded-full border border-border">Admin</span>
        </div>
        <button onClick={() => { exitAdmin(); }} className="btn-ghost text-xs px-2.5 py-1.5 flex-shrink-0">
          ← Blog
        </button>
      </div>

      {/* ── OVERLAY — sits below sidebar, above page content ── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 z-[70] md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* ── SIDEBAR ──
          z-[80] — above overlay (z-70) and topbar (z-60)
          Mobile: slides in/out with translate
          Desktop: always visible
      ── */}
      <aside
        className={[
          'fixed top-0 left-0 bottom-0 z-[80]',
          'w-[234px] bg-surface border-r border-border',
          'flex flex-col',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0',
        ].join(' ')}
      >
        {/* Logo header */}
        <div className="p-5 border-b border-border flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => { exitAdmin(); close(); }}
            className="flex items-center gap-2.5 bg-transparent border-0 cursor-pointer p-0 min-w-0"
          >
            <div className="w-7 h-7 bg-accent rounded flex items-center justify-center flex-shrink-0">
              <span className="font-display font-bold text-ink text-[0.82rem]">S</span>
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-[0.93rem] text-[#e8e6f0] truncate">SkyLimits</div>
              <div className="text-[0.54rem] text-muted uppercase tracking-widest">Admin Panel</div>
            </div>
          </button>
          {/* Close — mobile only */}
          <button
            onClick={close}
            className="md:hidden bg-transparent border-0 text-muted cursor-pointer text-xl leading-none hover:text-white transition-colors font-body flex-shrink-0 ml-2"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Nav links */}
        <nav className="p-3 flex-1 overflow-y-auto">
          <p className="text-[0.57rem] font-bold tracking-[0.18em] uppercase text-muted px-3 py-1.5 mb-1">
            Management
          </p>
          {NAV.map(item => (
            <button
              key={item.id}
              className={`anav ${adminPage === item.id ? 'active' : ''}`}
              onClick={() => { switchAdminPage(item.id); close(); }}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-border flex-shrink-0 space-y-1">
          <button
            className="anav"
            onClick={() => { exitAdmin(); close(); }}
          >
            <span>←</span> Back to Blog
          </button>
          {onLogout && (
            <button
              className="anav text-red-400 hover:bg-red-900/20 hover:text-red-300"
              onClick={handleLogout}
            >
              <span>🔒</span> Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col md:ml-[234px] pt-[57px] md:pt-0 min-w-0">
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
