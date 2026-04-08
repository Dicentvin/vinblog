// frontend/src/pages/HomePage.tsx
import { useState } from 'react';
import { useGetBlogsQuery, useSubscribeMutation } from '../store/apiSlice';
import { useNav, useHomeCategory } from '../hooks';
import type { Blog } from '../types';

const CATS = [
  { id: 'Fullstack',              name: 'Fullstack',      color: '#6366f1' },
  { id: 'politics',               name: 'Politics',       color: '#10b981' },
  { id: 'gynaecologic oncology',  name: 'Gynae Oncology', color: '#f59e0b' },
  { id: 'self-development',       name: 'Self Dev',       color: '#ec4899' },
  { id: 'Data analysis',          name: 'Data Analysis',  color: '#3b82f6' },
  { id: 'Business',               name: 'Business',       color: '#14b8a6' },
  { id: 'female Reductive',       name: 'Female Health',  color: '#e879f9' },
  { id: 'AI & ML',                name: 'AI & ML',        color: '#8b5cf6' },
];

const TAGS = ['Fullstack','Politics','Oncology','Self Dev','Data Analysis','Business','Female Health','AI & ML','Research','Health'];

const fd = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function FeaturedCard({ blog, navigate }: { blog: Blog; navigate: (p: 'blog', id: string) => void }) {
  return (
    <div onClick={() => navigate('blog', blog.id)} className="blog-card flex flex-col overflow-hidden cursor-pointer">
      <div className="relative overflow-hidden w-full flex-shrink-0">
        <img
          src={blog.image} alt={blog.title}
          className="w-full object-cover block transition-transform duration-500 hover:scale-[1.03]"
          style={{ height: 160 }}
        />
        <span className="absolute top-2 left-2 bg-accent text-ink text-[0.55rem] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-full">
          Featured
        </span>
      </div>
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <span className="text-[0.59rem] font-bold tracking-widest uppercase text-accent2 block mb-1">{blog.category}</span>
        <h2 className="font-display font-bold text-[0.95rem] sm:text-[1.05rem] leading-snug text-white tracking-tight mb-1.5 line-clamp-2">{blog.title}</h2>
        <p className="text-muted text-[0.72rem] leading-relaxed line-clamp-2 flex-1">{blog.description}</p>
        <div className="mt-2 hidden sm:flex flex-wrap gap-1">
          {blog.tags.slice(0, 3).map(t => <span key={t} className="tag-chip">{t}</span>)}
        </div>
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
          <img src={blog.author.image} alt={blog.author.name} className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-[0.66rem] font-semibold text-white truncate">{blog.author.name}</div>
            <div className="text-[0.58rem] text-muted">{blog.minsRead}m · {fd(blog.publishedAt)}</div>
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
        <img
          src={blog.image} alt={blog.title}
          className="w-full object-cover block transition-transform duration-500 hover:scale-105"
          style={{ height: 130 }}
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-ink/60" />
        <span className="absolute top-1.5 left-1.5 text-[0.5rem] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full bg-ink/75 text-accent2 border border-accent2/30">
          {blog.category}
        </span>
        {blog.featured && (
          <span className="absolute top-1.5 right-1.5 text-[0.48rem] font-extrabold px-1.5 py-0.5 rounded-full bg-accent text-ink">★</span>
        )}
      </div>
      <div className="p-2.5 flex flex-col flex-1">
        <h3 className="font-display font-bold text-[0.82rem] leading-snug text-white tracking-tight mb-1 line-clamp-2">{blog.title}</h3>
        <p className="text-muted text-[0.67rem] leading-relaxed line-clamp-2 mb-1.5 flex-1">{blog.description}</p>
        <div className="flex items-center justify-between pt-1.5 border-t border-border">
          <div className="flex items-center gap-1">
            <img src={blog.author.image} alt={blog.author.name} className="w-4 h-4 rounded-full border border-border flex-shrink-0" />
            <span className="text-[0.6rem] font-semibold text-white truncate max-w-[80px]">{blog.author.name.split(' ')[0]}</span>
          </div>
          <div className="flex gap-1 text-[0.55rem] text-muted">
            <span>⏱{blog.minsRead}m</span>
            <span>💬{blog.comments.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden animate-pulse">
          <div className="bg-surface2" style={{ height: 130 }} />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-surface2 rounded w-3/4" />
            <div className="h-2.5 bg-surface2 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Newsletter box (reused in sidebar + mobile) ───────────────────────────────
function NewsletterBox({ email, setEmail, done, onSub }: {
  email: string; setEmail: (v: string) => void; done: boolean; onSub: () => void;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="sb-title" style={{ borderBottom: 'none', marginBottom: 7 }}>Newsletter</div>
      <p className="text-[0.69rem] text-muted leading-relaxed mb-2.5">Weekly articles, free.</p>
      {done ? (
        <div className="text-center py-2.5 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-[0.69rem] text-accent font-semibold">✨ Subscribed!</p>
        </div>
      ) : (
        <>
          <input
            className="input-field text-[0.74rem] mb-1.5"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSub()}
          />
          <button className="btn-primary w-full text-[0.67rem] py-1.5" onClick={onSub}>
            Subscribe →
          </button>
        </>
      )}
      <p className="text-[0.58rem] text-muted mt-1.5 text-center">12,841 readers</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HomePage(): JSX.Element {
  const { navigate }  = useNav();
  const { homeCategory, setHomeCategory } = useHomeCategory();
  const [nlEmail, setNlEmail] = useState('');
  const [nlDone,  setNlDone]  = useState(false);
  const [mobileSection, setMobileSection] = useState<'feed' | 'recent' | 'topics'>('feed');
  const [subscribe] = useSubscribeMutation();

  const apiCat = homeCategory === 'all' ? '' : homeCategory;
  const { data, isLoading } = useGetBlogsQuery({ limit: 50, category: apiCat });
  const blogs    = data?.data ?? [];
  const featured = blogs.filter(b => b.featured);
  const latest   = [...blogs].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const recent   = latest.slice(0, 6);
  const mostRead = [...blogs].sort((a, b) => b.views - a.views).slice(0, 4);

  const handleSub = (): void => {
    if (!nlEmail.trim()) return;
    void (async () => {
      try { await subscribe(nlEmail).unwrap(); } catch { /* ok */ }
      setNlDone(true);
    })();
  };

  const catFilterList = [{ id: 'all', name: 'All', color: '#d4af37' }, ...CATS];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 sm:py-7">

      {/* ── Hero ── */}
      <div className="mb-5 sm:mb-7 pb-5 border-b border-border">
        <p className="text-[0.64rem] font-bold tracking-[.2em] uppercase text-accent mb-2">Welcome to SkyLimits</p>
        <h1
          className="font-display font-bold text-white tracking-tight"
          style={{ fontSize: 'clamp(1.3rem,3.5vw,2.4rem)', lineHeight: 1.15, maxWidth: 500 }}
        >
          Insights across medicine,<br />
          <em className="text-accent not-italic">tech & the modern world</em>
        </h1>
      </div>

      {/* ── Mobile tab switcher ── */}
      <div className="flex lg:hidden gap-1 mb-4 bg-surface2 p-1 rounded-xl">
        {[
          { id: 'feed'   as const, label: 'Feed'   },
          { id: 'recent' as const, label: 'Recent' },
          { id: 'topics' as const, label: 'Topics' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setMobileSection(tab.id)}
            className={`flex-1 py-2 rounded-lg text-[0.7rem] font-semibold tracking-widest uppercase transition-all cursor-pointer font-body border-0 ${
              mobileSection === tab.id
                ? 'bg-accent text-ink'
                : 'bg-transparent text-muted hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Mobile: Topics tab ── */}
      {mobileSection === 'topics' && (
        <div className="lg:hidden mb-6 space-y-4">
          {/* Category list */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="sb-title">Topics</div>
            <div className="grid grid-cols-2 gap-1.5">
              {CATS.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setHomeCategory(cat.id); setMobileSection('feed'); }}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-left border-0 font-body w-full ${
                    homeCategory === cat.id ? 'bg-accent/10' : 'bg-surface2 hover:bg-surface2/80'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                  <span className={`text-[0.72rem] font-medium truncate ${homeCategory === cat.id ? 'text-white font-semibold' : 'text-muted'}`}>
                    {cat.name}
                  </span>
                  <span className="text-[0.6rem] text-muted ml-auto flex-shrink-0">
                    {blogs.filter(b => b.category === cat.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {/* Tags */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="sb-title">Popular Tags</div>
            <div className="flex flex-wrap gap-1.5">
              {TAGS.map(t => <span key={t} className="tag-chip text-[0.6rem]">{t}</span>)}
            </div>
          </div>
          {/* Newsletter */}
          <NewsletterBox email={nlEmail} setEmail={setNlEmail} done={nlDone} onSub={handleSub} />
        </div>
      )}

      {/* ── Mobile: Recent tab ── */}
      {mobileSection === 'recent' && (
        <div className="lg:hidden mb-6 space-y-4">
          {/* Recent posts list */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="sb-title">Recent Posts</div>
            <div className="divide-y divide-border">
              {recent.map((b, i) => (
                <div
                  key={b.id}
                  onClick={() => navigate('blog', b.id)}
                  className="flex gap-3 py-3 cursor-pointer transition-opacity hover:opacity-70"
                >
                  <img src={b.image} alt={b.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-display font-bold text-[0.75rem] text-border flex-shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[0.6rem] text-accent2 truncate">{b.category}</span>
                    </div>
                    <h4 className="text-[0.75rem] font-semibold text-white leading-snug mb-1 line-clamp-2">{b.title}</h4>
                    <p className="text-[0.63rem] text-muted">{b.minsRead}m · {fd(b.publishedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Read */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="sb-title">Most Read</div>
            <div className="grid grid-cols-2 gap-3">
              {mostRead.map(b => (
                <div
                  key={b.id}
                  onClick={() => navigate('blog', b.id)}
                  className="cursor-pointer transition-opacity hover:opacity-70"
                >
                  <img src={b.image} alt={b.title} className="w-full h-20 rounded-lg object-cover mb-1.5" />
                  <h4 className="text-[0.68rem] font-semibold text-white leading-snug line-clamp-2 mb-0.5">{b.title}</h4>
                  <span className="text-[0.6rem] text-muted">👁 {b.views.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Feed (desktop: 3-column, mobile: single column) ── */}
      {(mobileSection === 'feed' || true) && (
        <div className={`flex flex-col lg:flex-row gap-5 items-start ${mobileSection !== 'feed' ? 'hidden lg:flex' : ''}`}>

          {/* ── Left Sidebar (desktop only) ── */}
          <aside className="hidden lg:flex lg:w-[200px] xl:w-[210px] flex-shrink-0 sticky top-[76px] self-start flex-col gap-5">
            <div>
              <div className="sb-title">Topics</div>
              {CATS.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setHomeCategory(cat.id)}
                  className={`flex items-center justify-between w-full px-2 py-1.5 rounded-lg cursor-pointer transition-colors border-0 font-body ${
                    homeCategory === cat.id ? 'bg-accent/10' : 'hover:bg-surface2 bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                    <span className={`text-[0.76rem] ${homeCategory === cat.id ? 'text-white font-semibold' : 'text-white font-medium'}`}>
                      {cat.name}
                    </span>
                  </div>
                  <span className="text-[0.62rem] text-muted font-semibold">
                    {blogs.filter(b => b.category === cat.id).length}
                  </span>
                </button>
              ))}
            </div>

            <NewsletterBox email={nlEmail} setEmail={setNlEmail} done={nlDone} onSub={handleSub} />

            <div>
              <div className="sb-title">Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.slice(0, 10).map(t => <span key={t} className="tag-chip text-[0.58rem]">{t}</span>)}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="sb-title" style={{ borderBottom: 'none', marginBottom: 11 }}>Numbers</div>
              <div className="grid grid-cols-2 gap-2.5">
                {[['85','Articles'],['12','Authors'],['48K','Readers'],['3.4K','Comments']].map(([v,l]) => (
                  <div key={l} className="text-center">
                    <div className="font-display font-bold text-[1.15rem] text-accent">{v}</div>
                    <div className="text-[0.56rem] text-muted uppercase tracking-widest mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Centre ── */}
          <div className="flex-1 min-w-0 w-full">

            {/* Category filter pills — desktop */}
            <div className="hidden lg:flex gap-1.5 mb-4 overflow-x-auto pb-0.5">
              {catFilterList.map(cat => (
                <button key={cat.id} onClick={() => setHomeCategory(cat.id)}
                  className={`px-3 py-0.5 rounded-full border text-[0.65rem] font-semibold tracking-widests uppercase cursor-pointer whitespace-nowrap transition-all font-body ${
                    homeCategory === cat.id ? 'bg-accent border-accent text-ink' : 'border-border text-muted hover:border-accent hover:text-accent bg-transparent'
                  }`}>
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Mobile: category pills (in feed tab) */}
            <div className="flex lg:hidden gap-1.5 mb-4 overflow-x-auto pb-1">
              {catFilterList.map(cat => (
                <button key={cat.id} onClick={() => setHomeCategory(cat.id)}
                  className={`px-3 py-1 rounded-full border text-[0.62rem] font-semibold tracking-widest uppercase cursor-pointer whitespace-nowrap transition-all font-body flex-shrink-0 ${
                    homeCategory === cat.id ? 'bg-accent border-accent text-ink' : 'border-border text-muted bg-transparent'
                  }`}>
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Featured — 2 cols on sm+, 1 col on xs */}
            {!isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                {(featured.length > 0 ? featured : latest.slice(0, 2)).slice(0, 2).map(b => (
                  <FeaturedCard key={b.id} blog={b} navigate={navigate} />
                ))}
              </div>
            )}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                {[0,1].map(i => (
                  <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden animate-pulse">
                    <div className="bg-surface2" style={{ height: 160 }} />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-surface2 rounded w-1/3" />
                      <div className="h-4 bg-surface2 rounded w-3/4" />
                      <div className="h-3 bg-surface2 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Latest grid */}
            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <p className="text-[0.58rem] font-bold tracking-[.15em] uppercase text-accent mb-0.5">Latest Articles</p>
                  <h2 className="font-display font-bold text-[1.1rem] sm:text-[1.25rem] text-white tracking-tight">
                    Fresh from the blog
                  </h2>
                </div>
                <button
                  onClick={() => navigate('blogs')}
                  className="border border-border text-muted px-3 sm:px-4 py-1.5 rounded-lg text-[0.68rem] sm:text-[0.7rem] font-medium cursor-pointer transition-all hover:border-accent hover:text-accent bg-transparent font-body whitespace-nowrap"
                >
                  View All →
                </button>
              </div>

              {isLoading
                ? <SkeletonGrid count={6} />
                : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {latest.slice(0, 6).map(b => <GridCard key={b.id} blog={b} navigate={navigate} />)}
                  </div>
                )
              }
            </div>
          </div>

          {/* ── Right Sidebar (desktop only) ── */}
          <aside className="hidden lg:flex lg:w-[188px] xl:w-[200px] flex-shrink-0 sticky top-[76px] self-start flex-col gap-5">

            <div>
              <div className="sb-title">Recent Posts</div>
              {recent.map((b, i) => (
                <div key={b.id} onClick={() => navigate('blog', b.id)}
                  className="flex gap-2 py-2.5 border-b border-border last:border-0 cursor-pointer transition-opacity hover:opacity-70">
                  <div className="font-display font-bold text-[0.9rem] text-border w-4 flex-shrink-0 leading-none mt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[0.69rem] font-semibold text-white leading-snug mb-0.5 line-clamp-2">{b.title}</div>
                    <div className="text-[0.58rem] text-muted">{b.minsRead}m · {fd(b.publishedAt)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="sb-title">Most Read</div>
              <div className="flex flex-col gap-2.5">
                {mostRead.map(b => (
                  <div key={b.id} onClick={() => navigate('blog', b.id)}
                    className="flex gap-2 cursor-pointer transition-opacity hover:opacity-70">
                    <img src={b.image} alt={b.title} className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[0.67rem] font-semibold text-white leading-snug mb-0.5 line-clamp-2">{b.title}</div>
                      <span className="text-[0.58rem] text-muted">👁 {b.views.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-3.5 border border-accent/20" style={{ background: 'linear-gradient(135deg,rgba(212,175,55,.1),rgba(192,132,252,.07))' }}>
              <p className="text-[0.68rem] font-bold text-white mb-1">📬 Weekly Digest</p>
              <p className="text-[0.63rem] text-muted mb-2 leading-relaxed">Best articles, curated.</p>
              <input className="input-field text-[0.68rem] mb-1.5" placeholder="Email address" />
              <button className="btn-primary w-full text-[0.63rem] py-1.5">Subscribe</button>
            </div>

            <div>
              <div className="sb-title">Popular Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.slice(0, 8).map(t => <span key={t} className="tag-chip text-[0.56rem]">{t}</span>)}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}