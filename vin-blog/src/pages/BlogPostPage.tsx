import { useState, useEffect, type FormEvent } from 'react';
import { useGetBlogByIdQuery, useLikeBlogMutation, useAddCommentMutation, useSubscribeMutation, useTrackViewMutation } from '../store/apiSlice';
import { useNav } from '../hooks';
import type { Comment } from '../types';
import SocialShare from '../components/SocialShare';

interface Props { blogId: string; }

const fd = (d: string, long = false) => new Date(d).toLocaleDateString('en-US', long ? { year: 'numeric', month: 'long', day: 'numeric' } : { month: 'short', day: 'numeric' });

const sampleContent = (cat: string) => `
<p>When we think about <strong>${cat}</strong> at scale, the architecture decisions we make early define success or failure. In this deep-dive, we explore patterns used by top engineering teams worldwide.</p>
<h2>Why This Matters</h2>
<p>The gap between systems handling 1,000 and 1,000,000 requests isn't just hardware — it's architecture and discipline applied consistently.</p>
<blockquote>"The architecture of your system is the set of decisions that are hard to change." — Martin Fowler</blockquote>
<p>A system that works in development can fall apart under production load. This is a design problem with a design solution.</p>
<h2>Core Principles</h2>
<p><strong>Separation of concerns</strong> keeps components focused. <strong>Loose coupling</strong> lets you scale pieces independently. <strong>Statelessness</strong> opens the door to horizontal scaling.</p>
<h2>Practical Implementation</h2>
<p>Start with clear boundaries and let your architecture evolve as understanding deepens.</p>
<h2>Conclusion</h2>
<p>Great ${cat.toLowerCase()} engineering comes down to discipline, empathy for your future self, and willingness to refactor when context changes.</p>`;

export default function BlogPostPage({ blogId }: Props): JSX.Element {
  const { navigate }  = useNav();
  const { data: blog, isLoading, isError } = useGetBlogByIdQuery(blogId, { skip: !blogId });
  const [likeBlog]    = useLikeBlogMutation();
  const [addComment]  = useAddCommentMutation();
  const [subscribe]   = useSubscribeMutation();
  const [trackView]   = useTrackViewMutation();

  const [liked,     setLiked]     = useState(false);
  const [subDone,   setSubDone]   = useState(false);
  const [nlEmail,   setNlEmail]   = useState('');
  const [cmtName,   setCmtName]   = useState('');
  const [cmtText,   setCmtText]   = useState('');
  const [localCmts, setLocalCmts] = useState<Comment[]>([]);

  // Track view via Inngest on mount
  useEffect(() => { if (blogId) trackView(blogId); }, [blogId]);

  const handleLike = async () => {
    if (liked) return;
    try { await likeBlog(blogId).unwrap(); } catch { /* optimistic */ }
    setLiked(true);
  };

  const handleComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!cmtName.trim() || !cmtText.trim()) return;
    try {
      await addComment({ blogId, author: cmtName, content: cmtText }).unwrap();
    } catch {
      setLocalCmts(p => [...p, { id: Date.now().toString(), author: cmtName, avatar: `https://i.pravatar.cc/150?u=${cmtName}`, content: cmtText, createdAt: new Date().toISOString(), likes: 0 }]);
    }
    setCmtName(''); setCmtText('');
  };

  const handleSub = async () => {
    if (!nlEmail.trim()) return;
    try { await subscribe(nlEmail).unwrap(); } catch { /* ok */ }
    setSubDone(true);
  };

  if (isLoading) return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="h-72 sm:h-96 bg-surface rounded-2xl mb-8" />
      <div className="max-w-3xl mx-auto space-y-3">
        <div className="h-7 bg-surface rounded w-3/4" /><div className="h-4 bg-surface rounded w-full" /><div className="h-4 bg-surface rounded w-5/6" />
      </div>
    </div>
  );

  if (isError || !blog) return (
    <div className="text-center py-24 px-4">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="font-display text-2xl text-white mb-3">Could not load article</h2>
      <p className="text-muted mb-6 text-sm">Make sure the backend is running on port 3001.</p>
      <button onClick={() => navigate('blogs')} className="btn-primary">← Back to Articles</button>
    </div>
  );

  const comments: Comment[] = [...(blog.comments ?? []), ...localCmts];
  const likeCount = (blog.likes ?? 0) + (liked ? 1 : 0);
 
  return (
    <main className="max-w-[1400px] mx-auto px-8 sm:px-12  lg:px-24 py-8">
      <div className="flex flex-col xl:flex-row gap-8 xl:gap-10 items-start">
        {/* Action bar */}
        <div className="xl:w-14 xl:flex-shrink-0 xl:sticky xl:top-24 self-start">
          <div className="flex xl:hidden gap-2 mb-6">
            {[{icon:liked?'❤️':'🤍',label:String(likeCount),action:handleLike,active:liked},{icon:'💬',label:String(comments.length)},{icon:'🔖',label:'Save'},{icon:'↗',label:'Share'}].map((item,i)=>(
              <button key={i} onClick={()=>void item.action?.()} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all cursor-pointer font-body text-xs ${item.active?'border-accent bg-accent/10':'border-border bg-surface hover:border-accent'}`}>
                <span>{item.icon}</span><span className="text-muted font-semibold">{item.label}</span>
              </button>
            ))}
          </div>
          <div className="hidden xl:flex flex-col gap-2">
            {[{icon:liked?'❤️':'🤍',label:String(likeCount),action:handleLike,active:liked},{icon:'💬',label:String(comments.length)},{icon:'🔖',label:'Save'},{icon:'↗',label:'Share'}].map((item,i)=>(
              <button key={i} onClick={()=>void item.action?.()} className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all cursor-pointer font-body w-14 ${item.active?'border-accent bg-accent/10':'border-border bg-surface hover:border-accent'}`}>
                <span className="text-base">{item.icon}</span><span className="text-[0.57rem] text-muted font-semibold">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Article */}
        <article className="flex-1 min-w-0">
          <nav className="flex items-center gap-1.5 text-xs text-muted mb-5 flex-wrap">
            <button onClick={()=>navigate('home')} className="hover:text-accent transition-colors bg-transparent border-0 cursor-pointer text-muted text-xs font-body">Home</button>
            <span className="text-border">›</span>
            <button onClick={()=>navigate('blogs')} className="text-accent2 bg-transparent border-0 cursor-pointer text-xs font-body hover:underline">{blog.category}</button>
            <span className="text-border">›</span>
            <span className="truncate max-w-[200px] sm:max-w-sm">{blog.title}</span>
          </nav>

          <span className="inline-block text-[0.6rem] font-bold tracking-widest uppercase text-accent2 px-3 py-1 rounded-full border border-accent2/30 bg-accent2/8 mb-3">{blog.category}</span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl leading-tight text-white tracking-tight mb-4">{blog.title}</h1>
          <p className="text-muted text-sm sm:text-base leading-relaxed mb-6 italic pl-4 border-l-4 border-accent">{blog.description}</p>

          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-border mb-7">
            <div className="flex items-center gap-3">
              <img src={blog.author.image} alt={blog.author.name} className="w-10 h-10 rounded-full border-2 border-accent" />
              <div><div className="text-sm font-semibold text-white">{blog.author.name}</div><div className="text-xs text-muted">{blog.author.bio}</div></div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted">
              <span>📅 {fd(blog.publishedAt, true)}</span>
              <span>⏱ {blog.minsRead} min read</span>
              <span>👁 {blog.views.toLocaleString()}</span>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden mb-7"><img src={blog.image} alt={blog.title} className="w-full max-h-[420px] object-cover" /></div>
          <div className="flex flex-wrap gap-1.5 mb-6">{blog.tags.map(t=><span key={t} className="tag-chip">{t}</span>)}</div>

          <div className="text-[#c4c2d0] leading-[1.85] text-[0.95rem] [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-xl [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:tracking-tight [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:py-3 [&_blockquote]:my-6 [&_blockquote]:bg-surface [&_blockquote]:rounded-r-lg [&_blockquote]:italic [&_blockquote]:text-white [&_strong]:text-white [&_strong]:font-bold [&_p]:mb-4"
            dangerouslySetInnerHTML={{ __html: blog.content || sampleContent(blog.category) }} />

          {/* Newsletter */}
          <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-accent/10 to-accent2/8 border border-accent/20 text-center">
            <div className="text-3xl mb-3">📬</div>
            <h3 className="font-display font-bold text-xl text-white mb-2">Enjoyed this article?</h3>
            <p className="text-muted text-sm mb-5 leading-relaxed">Get more like this every week. No spam, unsubscribe anytime.</p>
            {subDone ? <p className="text-accent font-semibold">✅ You&apos;re subscribed!</p> : (
              <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
                <input className="input-field flex-1 text-sm" placeholder="your@email.com" value={nlEmail} onChange={e=>setNlEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&void handleSub()}/>
                <button onClick={()=>void handleSub()} className="btn-primary whitespace-nowrap">Subscribe</button>
              </div>
            )}
          </div>

          {/* Social Share */}
          <SocialShare title={blog.title} blogId={blog.id} description={blog.description} image={blog.image} />

          {/* Comments */}
          <div className="mt-14 pt-10 border-t-2 border-border">
            <h2 className="font-display font-bold text-2xl text-white mb-6">{comments.length} Comment{comments.length!==1?'s':''}</h2>
            <form onSubmit={e=>void handleComment(e)} className="bg-surface border border-border rounded-xl p-4 sm:p-6 mb-7">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-4">Leave a Comment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input className="input-field" placeholder="Your name" value={cmtName} onChange={e=>setCmtName(e.target.value)} required/>
                <input className="input-field" placeholder="Email (optional)" type="email"/>
              </div>
              <textarea className="input-field mb-3 resize-y" rows={4} placeholder="Share your thoughts…" value={cmtText} onChange={e=>setCmtText(e.target.value)} required/>
              <button type="submit" className="btn-primary">Post Comment →</button>
            </form>
            <div className="divide-y divide-border">
              {comments.map(c=>(
                <div key={c.id} className="flex gap-3 py-4">
                  <img src={c.avatar??`https://i.pravatar.cc/150?u=${c.author}`} alt={c.author} className="w-9 h-9 rounded-full border-2 border-border flex-shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-sm font-bold text-white">{c.author}</span>
                      <span className="text-xs text-muted">{fd(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-[#a8a6b8] leading-relaxed">{c.content}</p>
                    <span className="text-xs text-muted mt-1.5 block">👍 {c.likes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related */}
          <div className="mt-14">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-border"/>
              <div className="text-center flex-shrink-0">
                <p className="text-[0.6rem] font-bold tracking-widest uppercase text-accent mb-1">Keep Reading</p>
                <h2 className="font-display font-bold text-2xl text-white tracking-tight">Related Articles</h2>
              </div>
              <div className="flex-1 h-px bg-border"/>
            </div>
            <p className="text-center text-muted text-sm">Explore more in <button onClick={()=>navigate('blogs')} className="text-accent underline bg-transparent border-0 cursor-pointer font-body text-sm">the full collection →</button></p>
          </div>
        </article>

        {/* Right sidebar */}
        <aside className="hidden xl:flex flex-col gap-5 w-56 flex-shrink-0 sticky top-20 self-start">
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-[0.6rem] font-bold tracking-widest uppercase text-accent mb-3">In This Article</p>
            {['Why This Matters','Core Principles','Practical Implementation','Conclusion'].map(s=>(
              <div key={s} className="text-xs text-muted py-2 border-b border-border last:border-0 cursor-pointer transition-colors hover:text-accent">{s}</div>
            ))}
          </div>
          <div className="bg-gradient-to-br from-accent/10 to-accent2/8 border border-accent/20 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">📬</div>
            <h3 className="font-display font-bold text-sm text-white mb-1">Never miss a post</h3>
            <p className="text-[0.63rem] text-muted mb-3 leading-relaxed">Weekly dev articles in your inbox.</p>
            {subDone ? <p className="text-accent text-xs font-semibold">✅ Subscribed!</p> : (
              <>
                <input className="input-field text-xs mb-2" placeholder="your@email.com" value={nlEmail} onChange={e=>setNlEmail(e.target.value)}/>
                <button onClick={()=>void handleSub()} className="btn-primary w-full text-xs py-2">Subscribe</button>
              </>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
