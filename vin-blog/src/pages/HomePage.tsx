import { useState } from 'react';
import { useGetBlogsQuery, useSubscribeMutation } from '../store/apiSlice';
import { useNav, useHomeCategory } from '../hooks';
import type { Blog } from '../types';

const CATS = [
  { id: 'all',                        name: 'All',                        color: '#d4af37' },
  { id: 'Fullstack',                  name: 'Fullstack',                  color: '#6366f1' },
  { id: 'Politics',                   name: 'Politics',                   color: '#10b981' },
  { id: 'Gynaecologic Oncology',      name: 'Gynae Oncology',             color: '#f59e0b' },
  { id: 'Self Development',           name: 'Self Development',           color: '#ec4899' },
  { id: 'Data Analysis',              name: 'Data Analysis',              color: '#3b82f6' },
  { id: 'Business',                   name: 'Business',                   color: '#14b8a6' },
  { id: 'Female Reproductive Health', name: 'Female Health',              color: '#e879f9' },
  { id: 'AI & ML',                    name: 'AI & ML',                    color: '#8b5cf6' },
];
const TAGS = ['Fullstack','Politics','Oncology','Self Development','Data Analysis','Business','Female Health','AI & ML','Research','Health'];
const fd = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function FeaturedCard({ blog, navigate }: { blog: Blog; navigate: (p: 'blog', id: string) => void }) {
  return (
    <div onClick={() => navigate('blog', blog.id)} className="blog-card flex flex-col sm:flex-row overflow-hidden">
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
    <div onClick={() => navigate('blog', blog.id)} className="blog-card flex flex-col">
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

export default function HomePage(): JSX.Element {
  const { navigate } = useNav();
  const { homeCategory, setHomeCategory } = useHomeCategory();
  const [nlEmail, setNlEmail] = useState('');
  const [nlDone,  setNlDone]  = useState(false);
  const [subscribe] = useSubscribeMutation();

  const apiCat = homeCategory === 'all' ? '' : homeCategory;
  const { data, isLoading } = useGetBlogsQuery({ limit: 50, category: apiCat });
  const blogs    = data?.data ?? [];
  const featured = blogs.filter(b => b.featured);
  const latest   = [...blogs].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const recent   = latest.slice(0, 6);
  const mostRead = [...blogs].sort((a, b) => b.views - a.views).slice(0, 4);

  const handleSub = async (): Promise<void> => {
    if (!nlEmail.trim()) return;
    try { await subscribe(nlEmail).unwrap(); } catch { /* ok */ }
    setNlDone(true);
  };

  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col lg:flex-row items-center justify-between gap-10 border-b border-border">
        <div className="max-w-[560px] w-full">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/25 rounded-full px-4 py-1.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-dot flex-shrink-0" />
            <span className="text-[0.63rem] font-bold tracking-[0.18em] uppercase text-accent">Welcome to SkyLimits</span>
          </div>
          <h1 className="font-display font-bold text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.15] text-white tracking-tight mb-4">
            Engineering insights<br />for the <em className="text-accent not-italic">modern developer</em>
          </h1>
          <p className="text-muted text-[0.9rem] leading-[1.7] max-w-[430px] mb-6">Deep-dives, tutorials, and best practices across frontend, backend, databases and beyond — written by practitioners for practitioners.</p>
          <div className="flex gap-3 flex-wrap mb-7">
            <button onClick={() => navigate('blogs')} className="btn-primary text-sm px-6 py-2.5">Browse Articles →</button>
            <button onClick={() => void handleSub()} className="bg-transparent border border-border text-muted px-5 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-all hover:border-accent hover:text-accent font-body">Subscribe Free</button>
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
          <div className="absolute -bottom-4 -left-4 bg-surface border border-accent/30 rounded-xl px-3 py-2.5 shadow-2xl animate-float flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center text-lg flex-shrink-0">📬</div>
            <div><div className="text-[0.68rem] font-bold text-white">12,841 subscribers</div><div className="text-[0.58rem] text-muted">Join our newsletter</div></div>
          </div>
          <div className="absolute bottom-[30%] -right-4 w-16 h-16 rounded-full border border-accent/15 pointer-events-none" />
        </div>
      </section>

      {/* ═══ 3-COLUMN BODY ═══ */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-10 flex gap-6 items-start">
        {/* Left sidebar */}
        <aside className="hidden xl:flex flex-col gap-5 w-52 flex-shrink-0 sticky top-20 self-start">
          <div>
            <div className="sb-title">Topics</div>
            {CATS.filter(c => c.id !== 'all').map(cat => (
              <button key={cat.id} onClick={() => setHomeCategory(cat.id)}
                className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg transition-all cursor-pointer border-0 font-body ${homeCategory===cat.id?'bg-accent/10':'bg-transparent hover:bg-surface2'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                  <span className={`text-[0.82rem] font-medium ${homeCategory===cat.id?'text-white font-semibold':'text-muted'}`}>{cat.name}</span>
                </div>
                <span className="text-[0.63rem] text-muted font-semibold">{blogs.filter(b=>b.category===cat.id).length}</span>
              </button>
            ))}
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="sb-title border-0 mb-2">Newsletter</div>
            <p className="text-xs text-muted leading-relaxed mb-3">Weekly dev articles, free.</p>
            {nlDone ? (
              <div className="text-center py-3 bg-accent/10 rounded-lg border border-accent/20"><p className="text-xs text-accent font-semibold">✨ Subscribed!</p></div>
            ) : (
              <>
                <input className="input-field text-xs mb-2" placeholder="your@email.com" value={nlEmail} onChange={e => setNlEmail(e.target.value)} onKeyDown={e => e.key==='Enter' && void handleSub()} />
                <button onClick={() => void handleSub()} className="btn-primary w-full text-xs py-2">Subscribe →</button>
              </>
            )}
            <p className="text-[0.57rem] text-muted text-center mt-2">12,841 readers</p>
          </div>
          <div>
            <div className="sb-title">Tags</div>
            <div className="flex flex-wrap gap-1.5">{TAGS.slice(0,10).map(t => <span key={t} className="tag-chip text-[0.58rem]">{t}</span>)}</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="sb-title border-0 mb-3">Numbers</div>
            <div className="grid grid-cols-2 gap-3">
              {[['85','Articles'],['12','Authors'],['48K','Readers'],['3.4K','Comments']].map(([v,l]) => (
                <div key={l} className="text-center">
                  <div className="font-display font-bold text-xl text-accent">{v}</div>
                  <div className="text-[0.55rem] text-muted uppercase tracking-widest mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Centre */}
        <div className="flex-1 min-w-0">
          <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
            {CATS.map(cat => (
              <button key={cat.id} onClick={() => setHomeCategory(cat.id)}
                className={`px-3 py-1 rounded-full border text-[0.63rem] font-semibold tracking-widest uppercase cursor-pointer whitespace-nowrap transition-all font-body ${homeCategory===cat.id?'bg-accent border-accent text-ink':'border-border text-muted hover:border-accent hover:text-accent bg-transparent'}`}>
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
              {Array.from({length:8}).map((_,i) => (
                <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden animate-pulse">
                  <div className="h-36 bg-surface2" />
                  <div className="p-3 space-y-2"><div className="h-3 bg-surface2 rounded w-3/4" /><div className="h-2.5 bg-surface2 rounded w-full" /></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {latest.slice(0,8).map(b => <GridCard key={b.id} blog={b} navigate={navigate} />)}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <aside className="hidden lg:flex flex-col gap-5 w-48 xl:w-52 flex-shrink-0 sticky top-20 self-start">
          <div>
            <div className="sb-title">Recent Posts</div>
            {recent.map((b,i) => (
              <div key={b.id} onClick={() => navigate('blog', b.id)} className="flex gap-2.5 py-2.5 border-b border-border last:border-0 cursor-pointer transition-opacity hover:opacity-70">
                <span className="font-display font-bold text-[0.95rem] text-border flex-shrink-0 w-5 leading-none">{String(i+1).padStart(2,'0')}</span>
                <div>
                  <h4 className="text-[0.7rem] font-semibold text-white leading-snug mb-1 line-clamp-2">{b.title}</h4>
                  <p className="text-[0.6rem] text-muted">{b.minsRead}m · {fd(b.publishedAt)}</p>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="sb-title">Most Read</div>
            <div className="space-y-3">
              {mostRead.map(b => (
                <div key={b.id} onClick={() => navigate('blog', b.id)} className="flex gap-2.5 cursor-pointer transition-opacity hover:opacity-70">
                  <img src={b.image} alt={b.title} className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
                  <div>
                    <h4 className="text-[0.67rem] font-semibold text-white leading-snug mb-1 line-clamp-2">{b.title}</h4>
                    <span className="text-[0.6rem] text-muted">👁 {b.views.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-accent/10 to-accent2/7 border border-accent/20 rounded-xl p-3.5">
            <p className="text-[0.68rem] font-bold text-white mb-1">📬 Weekly Digest</p>
            <p className="text-[0.62rem] text-muted leading-relaxed mb-2.5">Best articles, curated for you.</p>
            <input className="input-field text-[0.67rem] mb-1.5" placeholder="Email address" />
            <button className="btn-primary w-full text-[0.62rem] py-1.5">Subscribe</button>
          </div>
          <div>
            <div className="sb-title">Popular Tags</div>
            <div className="flex flex-wrap gap-1">{TAGS.slice(0,8).map(t => <span key={t} className="tag-chip text-[0.56rem]">{t}</span>)}</div>
          </div>
        </aside>
      </section>
    </div>
  );
}
