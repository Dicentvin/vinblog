import { useState } from 'react';
import { useGetBlogsQuery, useSubscribeMutation } from '../store/apiSlice';
import { useNav, useHomeCategory } from '../hooks';
import type { Blog } from '../types';

const CATS = [
  { id: 'all',                   name: 'All',                    color: '#d4af37' },
  { id: 'Fullstack',             name: 'Fullstack',              color: '#6366f1' },
  { id: 'Politics',              name: 'Politics',               color: '#10b981' },
  { id: 'Gynecologic oncology',  name: 'Gynaecologic Oncology',  color: '#f59e0b' },
  { id: 'female reproductive',   name: 'Female Reproductive',    color: '#ec4899' },
  { id: 'Data analysis',         name: 'Data Analysis',          color: '#3b82f6' },
  { id: 'AI & ML',               name: 'AI & ML',                color: '#8b5cf6' },
  { id: 'Business',              name: 'Business',               color: '#f97316' },
  { id: 'Self-Development',      name: 'Self-Development',       color: '#14b8a6' },
];
const TAGS = ['Node.js','React','TypeScript','PostgreSQL','CSS','Tailwind','API','Docker','GraphQL','Redis'];
const fd = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// ── Shared subscribe hook ─────────────────────────────────────────────────────
// Returns { email, setEmail, loading, done, error, submit }
function useSubscribe() {
  const [subscribe]    = useSubscribeMutation();
  const [email,  setEmail]  = useState('');
  const [loading, setLoading] = useState(false);
  const [done,   setDone]   = useState(false);
  const [error,  setError]  = useState('');

  const submit = async (overrideEmail?: string): Promise<void> => {
    const val = (overrideEmail ?? email).trim();
    if (!val) { setError('Please enter your email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { setError('Enter a valid email address.'); return; }
    setError('');
    setLoading(true);
    try {
      await subscribe(val).unwrap();
      setDone(true);
      setEmail('');
    } catch {
      setError('Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, loading, done, error, submit };
}

// ── Newsletter box (reused in both sidebars + hero modal) ─────────────────────
function NewsletterBox({ compact = false }: { compact?: boolean }) {
  const { email, setEmail, loading, done, error, submit } = useSubscribe();

  if (done) {
    return (
      <div className="text-center py-3 bg-accent/10 rounded-lg border border-accent/20">
        <p className="text-xs text-accent font-semibold">✨ You're subscribed!</p>
        <p className="text-[0.58rem] text-muted mt-1">Check your inbox to confirm.</p>
      </div>
    );
  }

  return (
    <div className={compact ? '' : 'bg-gradient-to-br from-accent/10 to-accent2/7 border border-accent/20 rounded-xl p-3.5'}>
      {!compact && (
        <>
          <p className="text-[0.68rem] font-bold text-white mb-1">📬 Weekly Digest</p>
          <p className="text-[0.62rem] text-muted leading-relaxed mb-2.5">Best articles, curated for you.</p>
        </>
      )}
      {compact && <p className="text-xs text-muted leading-relaxed mb-3">Weekly articles, free.</p>}
      <input
        className="input-field text-[0.67rem] mb-1.5"
        placeholder="your@email.com"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && void submit()}
        disabled={loading}
      />
      {error && <p className="text-[0.6rem] text-red-400 mb-1.5">{error}</p>}
      <button
        onClick={() => void submit()}
        disabled={loading}
        className="btn-primary w-full text-[0.62rem] py-1.5 disabled:opacity-60"
      >
        {loading ? '⏳ Subscribing…' : 'Subscribe →'}
      </button>
      <p className="text-[0.57rem] text-muted text-center mt-2">12,841 readers · no spam</p>
    </div>
  );
}

// ── Hero subscribe modal ───────────────────────────────────────────────────────
function HeroSubscribeModal({ onClose }: { onClose: () => void }) {
  const { email, setEmail, loading, done, error, submit } = useSubscribe();

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-sm bg-surface border border-border rounded-2xl shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-surface2 border border-border text-muted hover:text-white text-sm flex items-center justify-center cursor-pointer border-0 font-body"
        >✕</button>

        <div className="text-center mb-5">
          <div className="text-3xl mb-2">📬</div>
          <h2 className="font-display font-bold text-lg text-white">Join the Newsletter</h2>
          <p className="text-muted text-xs mt-1">Weekly articles delivered free to your inbox.</p>
        </div>

        {done ? (
          <div className="text-center py-4 bg-accent/10 rounded-xl border border-accent/20">
            <p className="text-sm text-accent font-semibold">✨ You're subscribed!</p>
            <p className="text-xs text-muted mt-1">Check your inbox to confirm.</p>
            <button onClick={onClose} className="btn-primary mt-4 text-xs px-5 py-2">Done</button>
          </div>
        ) : (
          <>
            <input
              className="input-field text-sm mb-2 w-full"
              placeholder="your@email.com"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && void submit()}
              disabled={loading}
              autoFocus
            />
            {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
            <button
              onClick={() => void submit()}
              disabled={loading}
              className="btn-primary w-full text-sm py-2.5 disabled:opacity-60"
            >
              {loading ? '⏳ Subscribing…' : 'Subscribe Free →'}
            </button>
            <p className="text-[0.62rem] text-muted text-center mt-3">12,841 readers · unsubscribe anytime</p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Cards ─────────────────────────────────────────────────────────────────────

function FeaturedCard({ blog, navigate }: { blog: Blog; navigate: (p: 'blog', id: string) => void }) {
  return (
    <div onClick={() => navigate('blog', blog.id)} className="blog-card flex flex-col sm:flex-row overflow-hidden cursor-pointer">
      <div className="relative flex-shrink-0 overflow-hidden sm:w-[44%]">
        <img src={blog.image} alt={blog.title} className="w-full h-52 sm:h-full object-cover transition-transform duration-500 hover:scale-105" style={{ minHeight: 200 }} />
        <span className="absolute top-2.5 left-2.5 bg-accent text-ink text-[0.55rem] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-full">Featured</span>
      </div>
      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          <span className="text-[0.6rem] font-bold tracking-widest uppercase text-accent2 block mb-2">{blog.category}</span>
          <h2 className="font-display font-bold text-lg leading-snug text-white tracking-tight mb-2 line-clamp-3">{blog.title}</h2>
          <p className="text-muted text-sm leading-relaxed line-clamp-3">{blog.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">{blog.tags.slice(0,3).map(t => <span key={t} className="tag-chip">{t}</span>)}</div>
        </div>
        <div className="flex items-center gap-2.5 mt-4 pt-4 border-t border-border">
          <img src={blog.author.image} alt={blog.author.name} className="w-7 h-7 rounded-full border-2 border-border" />
          <div>
            <div className="text-xs font-semibold text-white">{blog.author.name}</div>
            <div className="text-[0.63rem] text-muted">{blog.minsRead}m · {fd(blog.publishedAt)}</div>
          </div>
          <div className="ml-auto flex gap-3 text-xs text-muted">
            <span>👁 {blog.views.toLocaleString()}</span>
            <span>💬 {blog.comments.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function GridCard({ blog, navigate }: { blog: Blog; navigate: (p: 'blog', id: string) => void }) {
  return (
    <div onClick={() => navigate('blog', blog.id)} className="blog-card flex flex-col cursor-pointer">
      <div className="relative overflow-hidden flex-shrink-0">
        <img src={blog.image} alt={blog.title} className="w-full h-36 object-cover transition-transform duration-500 hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/60 pointer-events-none" />
        <span className="absolute top-2 left-2 text-[0.5rem] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full bg-ink/75 text-accent2 border border-accent2/30">{blog.category}</span>
        {blog.featured && <span className="absolute top-2 right-2 text-[0.48rem] font-extrabold tracking-widest uppercase px-1.5 py-0.5 rounded-full bg-accent text-ink">★</span>}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-display font-bold text-[0.86rem] leading-snug text-white tracking-tight mb-1.5 line-clamp-2">{blog.title}</h3>
        <p className="text-muted text-[0.68rem] leading-relaxed line-clamp-2 mb-2.5 flex-1">{blog.description}</p>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1.5">
            <img src={blog.author.image} alt={blog.author.name} className="w-5 h-5 rounded-full border border-border" />
            <span className="text-[0.63rem] font-semibold text-white truncate max-w-[80px]">{blog.author.name.split(' ')[0]}</span>
          </div>
          <div className="flex gap-1.5 text-[0.57rem] text-muted">
            <span>⏱{blog.minsRead}m</span><span>💬{blog.comments.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Collapsible sidebar section ───────────────────────────────────────────────

function SidebarSection({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden lg:bg-transparent lg:border-0 lg:rounded-none lg:overflow-visible">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 lg:px-0 lg:py-0 lg:pointer-events-none cursor-pointer lg:cursor-default bg-transparent border-0 font-body"
      >
        <span className="sb-title mb-0">{title}</span>
        <span className={`text-muted text-xs transition-transform duration-200 lg:hidden ${open ? 'rotate-180' : ''}`} aria-hidden>▼</span>
      </button>
      <div className={`px-4 pb-4 lg:px-0 lg:pb-0 lg:block ${open ? 'block' : 'hidden'}`}>
        {children}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function HomePage(): JSX.Element {
  const { navigate }                    = useNav();
  const { homeCategory, setHomeCategory } = useHomeCategory();
  const [showSubModal, setShowSubModal] = useState(false);
  const [leftOpen,  setLeftOpen]        = useState(false);
  const [rightOpen, setRightOpen]       = useState(false);

  const apiCat = homeCategory === 'all' ? '' : homeCategory;
  const { data, isLoading } = useGetBlogsQuery({ limit: 50, category: apiCat });
  const blogs    = data?.data ?? [];
  const featured = blogs.filter(b => b.featured);
  const latest   = [...blogs].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const recent   = latest.slice(0, 6);
  const mostRead = [...blogs].sort((a, b) => b.views - a.views).slice(0, 4);

  // ── Left sidebar ────────────────────────────────────────────────────────────
  const LeftSidebarContent = (
    <div className="flex flex-col gap-5">
      <SidebarSection title="Topics">
        {CATS.filter(c => c.id !== 'all').map(cat => (
          <button
            key={cat.id}
            onClick={() => { setHomeCategory(cat.id); setLeftOpen(false); }}
            className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg transition-all cursor-pointer border-0 font-body ${homeCategory === cat.id ? 'bg-accent/10' : 'bg-transparent hover:bg-surface2'}`}
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
              <span className={`text-[0.82rem] font-medium ${homeCategory === cat.id ? 'text-white font-semibold' : 'text-muted'}`}>{cat.name}</span>
            </div>
            <span className="text-[0.63rem] text-muted font-semibold">{blogs.filter(b => b.category === cat.id).length}</span>
          </button>
        ))}
      </SidebarSection>

      {/* Left sidebar newsletter — each NewsletterBox has its own isolated state */}
      <SidebarSection title="Newsletter" defaultOpen={false}>
        <NewsletterBox compact />
      </SidebarSection>

      <SidebarSection title="Tags" defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {TAGS.slice(0, 10).map(t => <span key={t} className="tag-chip text-[0.58rem]">{t}</span>)}
        </div>
      </SidebarSection>

      <SidebarSection title="Numbers" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-3 pt-1">
          {[['85','Articles'],['12','Authors'],['48K','Readers'],['3.4K','Comments']].map(([v, l]) => (
            <div key={l} className="text-center">
              <div className="font-display font-bold text-xl text-accent">{v}</div>
              <div className="text-[0.55rem] text-muted uppercase tracking-widest mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </SidebarSection>
    </div>
  );

  // ── Right sidebar ───────────────────────────────────────────────────────────
  const RightSidebarContent = (
    <div className="flex flex-col gap-5">
      <SidebarSection title="Recent Posts">
        {recent.map((b, i) => (
          <div
            key={b.id}
            onClick={() => { navigate('blog', b.id); setRightOpen(false); }}
            className="flex gap-2.5 py-2.5 border-b border-border last:border-0 cursor-pointer transition-opacity hover:opacity-70"
          >
            <span className="font-display font-bold text-[0.95rem] text-border flex-shrink-0 w-5 leading-none">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h4 className="text-[0.7rem] font-semibold text-white leading-snug mb-1 line-clamp-2">{b.title}</h4>
              <p className="text-[0.6rem] text-muted">{b.minsRead}m · {fd(b.publishedAt)}</p>
            </div>
          </div>
        ))}
      </SidebarSection>

      <SidebarSection title="Most Read" defaultOpen={false}>
        <div className="space-y-3 pt-1">
          {mostRead.map(b => (
            <div
              key={b.id}
              onClick={() => { navigate('blog', b.id); setRightOpen(false); }}
              className="flex gap-2.5 cursor-pointer transition-opacity hover:opacity-70"
            >
              <img src={b.image} alt={b.title} className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
              <div>
                <h4 className="text-[0.67rem] font-semibold text-white leading-snug mb-1 line-clamp-2">{b.title}</h4>
                <span className="text-[0.6rem] text-muted">👁 {b.views.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </SidebarSection>

      {/* Right sidebar newsletter — fully wired, own isolated state */}
      <SidebarSection title="Weekly Digest" defaultOpen={false}>
        <NewsletterBox />
      </SidebarSection>

      <SidebarSection title="Popular Tags" defaultOpen={false}>
        <div className="flex flex-wrap gap-1 pt-1">
          {TAGS.slice(0, 8).map(t => <span key={t} className="tag-chip text-[0.56rem]">{t}</span>)}
        </div>
      </SidebarSection>
    </div>
  );

  return (
    <div>
      {/* Hero subscribe modal */}
      {showSubModal && <HeroSubscribeModal onClose={() => setShowSubModal(false)} />}

      {/* ═══ HERO ═══ */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col lg:flex-row items-center justify-between gap-10 border-b border-border">
        <div className="max-w-[560px] w-full">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/25 rounded-full px-4 py-1.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-dot flex-shrink-0" />
            <span className="text-[0.63rem] font-bold tracking-[0.18em] uppercase text-accent">Welcome to skyLimit</span>
          </div>
          <h1 className="font-display font-bold text-[20px] leading-[1.15] text-white tracking-tight mb-4">
            A modern perspective <br /> to <em className="text-accent not-italic">contemporary issues on the society</em>
          </h1>
          <p className="text-muted text-[14px] leading-[1.7] max-w-[430px] mb-6">
            In-depth analysis, tutorials, and real-world insights spanning medicine, politics, business, and technology — crafted by those who live it, not just study it.
          </p>
          <div className="flex gap-3 flex-wrap mb-7">
            <button onClick={() => navigate('blogs')} className="btn-primary text-sm px-6 py-2.5">Browse Articles →</button>
            {/* Opens modal so user can enter their email */}
            <button
              onClick={() => setShowSubModal(true)}
              className="bg-transparent border border-border text-muted px-5 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-all hover:border-accent hover:text-accent font-body"
            >
              Subscribe Free
            </button>
          </div>
          <div className="flex gap-6 sm:gap-8 pt-5 border-t border-border flex-wrap">
            {[['85+','Articles'],['48K','Monthly Readers'],['12','Expert Authors']].map(([v,l]) => (
              <div key={l}><div className="font-display font-bold text-2xl text-accent tracking-tight">{v}</div><div className="text-xs text-muted mt-0.5">{l}</div></div>
            ))}
          </div>
        </div>

        {/* Hero visual */}
        <div className="relative flex-shrink-0 w-full lg:w-auto hidden lg:block" style={{ width: 'min(100%,460px)' }}>
          <div className="rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.5)] animate-float">
            <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=700&q=80" alt="Developer working" className="w-full object-cover" style={{ height: 'clamp(190px,26vw,320px)' }} />
          </div>
          {latest[0] && (
            <div className="absolute -top-4 -right-4 bg-surface border border-border rounded-xl px-3 py-2.5 shadow-2xl animate-float-delay" style={{ minWidth: 152 }}>
              <p className="text-[0.57rem] text-muted mb-1">Latest article</p>
              <p className="text-[0.73rem] font-semibold text-white leading-snug line-clamp-2">{latest[0].title}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <img src={latest[0].author.image} alt="" className="w-4 h-4 rounded-full" />
                <span className="text-[0.6rem] text-accent">{latest[0].author.name.split(' ')[0]}</span>
                <span className="text-[0.57rem] text-muted ml-auto">{latest[0].minsRead}m</span>
              </div>
            </div>
          )}
          <div
            className="absolute -bottom-4 -left-4 bg-surface border border-accent/30 rounded-xl px-3 py-2.5 shadow-2xl animate-float flex items-center gap-2.5 cursor-pointer hover:border-accent transition-colors"
            onClick={() => setShowSubModal(true)}
          >
            <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center text-lg flex-shrink-0">📬</div>
            <div><div className="text-[0.68rem] font-bold text-white">12,841 subscribers</div><div className="text-[0.58rem] text-muted">Join our newsletter</div></div>
          </div>
          <div className="absolute bottom-[30%] -right-4 w-16 h-16 rounded-full border border-accent/15 pointer-events-none" />
        </div>
      </section>

      {/* ═══ Mobile sidebar toggle bar ═══ */}
      <div className="lg:hidden flex gap-2 px-4 py-3 border-b border-border sticky top-0 z-40 bg-ink/95 backdrop-blur-sm">
        <button
          onClick={() => { setLeftOpen(o => !o); setRightOpen(false); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer font-body ${leftOpen ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted bg-transparent hover:border-accent hover:text-accent'}`}
        >
          <span>☰</span> Topics & Tags
        </button>
        <button
          onClick={() => { setRightOpen(o => !o); setLeftOpen(false); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer font-body ${rightOpen ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted bg-transparent hover:border-accent hover:text-accent'}`}
        >
          <span>📋</span> Recent & More
        </button>
      </div>

      {leftOpen  && <div className="lg:hidden px-4 py-4 border-b border-border bg-surface/50">{LeftSidebarContent}</div>}
      {rightOpen && <div className="lg:hidden px-4 py-4 border-b border-border bg-surface/50">{RightSidebarContent}</div>}

      {/* ═══ 3-COLUMN BODY ═══ */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-10 flex gap-6 items-start">
        <aside className="hidden lg:flex flex-col gap-5 w-52 flex-shrink-0 sticky top-20 self-start">{LeftSidebarContent}</aside>

        {/* Centre */}
        <div className="flex-1 min-w-0">
          <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
            {CATS.map(cat => (
              <button key={cat.id} onClick={() => setHomeCategory(cat.id)}
                className={`px-3 py-1 rounded-full border text-[0.63rem] font-semibold tracking-widest uppercase cursor-pointer whitespace-nowrap transition-all font-body ${homeCategory === cat.id ? 'bg-accent border-accent text-ink' : 'border-border text-muted hover:border-accent hover:text-accent bg-transparent'}`}>
                {cat.name}
              </button>
            ))}
          </div>

          {!isLoading && featured.length > 0 && (
            <div className="space-y-3 mb-6">
              {featured.map(b => <FeaturedCard key={b.id} blog={b} navigate={navigate} />)}
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[0.58rem] font-bold tracking-[0.15em] uppercase text-accent mb-1">Latest Articles</p>
              <h2 className="font-display font-bold text-xl text-white tracking-tight">Fresh from the blog</h2>
            </div>
            <button onClick={() => navigate('blogs')} className="border border-border text-muted px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all hover:border-accent hover:text-accent bg-transparent font-body whitespace-nowrap">View All →</button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden animate-pulse">
                  <div className="h-36 bg-surface2" />
                  <div className="p-3 space-y-2"><div className="h-3 bg-surface2 rounded w-3/4" /><div className="h-2.5 bg-surface2 rounded w-full" /></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {latest.slice(0, 8).map(b => <GridCard key={b.id} blog={b} navigate={navigate} />)}
            </div>
          )}
        </div>

        <aside className="hidden lg:flex flex-col gap-5 w-48 xl:w-52 flex-shrink-0 sticky top-20 self-start">{RightSidebarContent}</aside>
      </section>
    </div>
  );
}