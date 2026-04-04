import { useGetBlogsQuery } from '../store/apiSlice';
import { useBlogsFilter, useNav } from '../hooks';
import type { Blog } from '../types';

const CATS = [
  { id:'all',name:'All Topics',color:'#d4af37'},
  { id:'Fullstack',name:'Fullstack',color:'#6366f1'},
  { id:'Politics',name:'Politics',color:'#10b981'},
  { id:'Gynaecologic Oncology',name:'Gynae Oncology',color:'#f59e0b'},
  { id:'Self Development',name:'Self Development',color:'#ec4899'},
  { id:'Data Analysis',name:'Data Analysis',color:'#3b82f6'},
  { id:'Business',name:'Business',color:'#14b8a6'},
  { id:'Female Reproductive Health',name:'Female Health',color:'#e879f9'},
  { id:'AI & ML',name:'AI & ML',color:'#8b5cf6'},
];
const TAGS=['Fullstack','Politics','Oncology','Self Development','Data Analysis','Business','Female Health','AI & ML','Research','Medicine','Health','Tech'];
const PER=8;
const fd=(d:string)=>new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
function pgNums(cur:number,tot:number):(number|'…')[]{
  if(tot<=7)return Array.from({length:tot},(_,i)=>i+1);
  if(cur<=4)return[1,2,3,4,5,'…',tot];
  if(cur>=tot-3)return[1,'…',tot-4,tot-3,tot-2,tot-1,tot];
  return[1,'…',cur-1,cur,cur+1,'…',tot];
}

function BlogCard({blog,navigate,fd:fmtDate}:{blog:Blog;navigate:(p:'blog',id:string)=>void;fd:(d:string)=>string}):JSX.Element{
  return(
    <div onClick={()=>navigate('blog',blog.id)} className="blog-card flex flex-col cursor-pointer">
      <div className="relative overflow-hidden flex-shrink-0">
        <img src={blog.image} alt={blog.title} className="w-full h-36 object-cover transition-transform duration-500 hover:scale-105"/>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/60 pointer-events-none"/>
        <span className="absolute top-2 left-2 text-[0.52rem] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full bg-ink/75 text-accent2 border border-accent2/30">{blog.category}</span>
        {blog.featured&&<span className="absolute top-2 right-2 text-[0.5rem] font-extrabold tracking-widest uppercase px-1.5 py-0.5 rounded-full bg-accent text-ink">★</span>}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-display font-bold text-sm leading-snug text-white tracking-tight mb-1.5 line-clamp-2">{blog.title}</h3>
        <p className="text-muted text-[0.7rem] leading-relaxed line-clamp-2 mb-2.5 flex-1">{blog.description}</p>
        <div className="flex flex-wrap gap-1 mb-2.5">{blog.tags.slice(0,2).map(t=><span key={t} className="text-[0.52rem] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded-full border border-border text-muted">{t}</span>)}</div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1.5">
            <img src={blog.author.image} alt={blog.author.name} className="w-5 h-5 rounded-full border border-border"/>
            <div><div className="text-[0.63rem] font-semibold text-white leading-none">{blog.author.name.split(' ')[0]}</div><div className="text-[0.57rem] text-muted mt-0.5">{fmtDate(blog.publishedAt)}</div></div>
          </div>
          <div className="flex gap-1.5 text-[0.56rem] text-muted"><span>⏱{blog.minsRead}m</span><span>👁{blog.views.toLocaleString()}</span></div>
        </div>
      </div>
    </div>
  );
}

export default function BlogsPage():JSX.Element{
  const {navigate}=useNav();
  const {filter,setSearch,setCategory,toggleTag,setSort,setPage,reset}=useBlogsFilter();
  const apiCat=filter.category==='all'?'':filter.category;
  const {data,isLoading,isError}=useGetBlogsQuery({search:filter.search,category:apiCat,page:filter.page,limit:PER,sort:filter.sort});
  const blogs=data?.data??[];
  const total=data?.total??0;
  const totalPages=Math.max(1,Math.ceil(total/PER));
  const hasFilters=!!(filter.search||filter.category!=='all'||filter.tag||filter.sort!=='newest');
  const goPage=(p:number):void=>{setPage(p);window.scrollTo({top:0,behavior:'smooth'});};

  return(
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-7">
        <p className="text-[0.63rem] font-bold tracking-[0.2em] uppercase text-accent mb-2">Browse All Articles</p>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight mb-2">The <em className="text-accent not-italic">complete</em> collection</h1>
        <p className="text-muted text-sm">{total} articles across {CATS.length-1} topics</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Filters */}
        <aside className="w-full lg:w-52 xl:w-56 flex-shrink-0 lg:sticky lg:top-20 lg:self-start">
          {/* Mobile pills */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-4">
            {CATS.map(cat=>(
              <button key={cat.id} onClick={()=>setCategory(cat.id)}
                className={`px-3 py-1 rounded-full border text-[0.63rem] font-semibold tracking-widest uppercase cursor-pointer whitespace-nowrap transition-all font-body flex-shrink-0 ${filter.category===cat.id?'bg-accent border-accent text-ink':'border-border text-muted bg-transparent'}`}>
                {cat.name}
              </button>
            ))}
          </div>
          {/* Desktop sidebar */}
          <div className="hidden lg:block space-y-5">
            <div>
              <div className="sb-title">Search</div>
              <div className="relative"><span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none">⌕</span>
                <input className="input-field pl-8 text-xs" placeholder="Search articles…" value={filter.search} onChange={e=>setSearch(e.target.value)}/>
              </div>
            </div>
            <div>
              <div className="sb-title">Sort By</div>
              {([['newest','Newest First'],['popular','Most Viewed'],['mostread','Longest Read']] as const).map(([v,l])=>(
                <button key={v} onClick={()=>setSort(v)} className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer border-0 font-body text-left ${filter.sort===v?'bg-accent/10 text-accent font-semibold':'bg-transparent text-muted hover:bg-surface2 hover:text-white'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${filter.sort===v?'bg-accent':'bg-border'}`}/>{l}
                </button>
              ))}
            </div>
            <div>
              <div className="sb-title">Category</div>
              {CATS.map(cat=>{const active=filter.category===cat.id;return(
                <button key={cat.id} onClick={()=>setCategory(cat.id)} className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border-0 font-body ${active?'bg-accent/10':'bg-transparent hover:bg-surface2'}`}>
                  <div className="flex items-center gap-1.5">
                    {cat.id!=='all'&&<span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:cat.color}}/>}
                    <span className={`text-xs ${active?'text-white font-semibold':'text-muted'}`}>{cat.name}</span>
                  </div>
                  <span className={`text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full ${active?'bg-accent/15 text-accent':'text-muted'}`}>{cat.id==='all'?total:blogs.filter(b=>b.category===cat.id).length}</span>
                </button>
              );})}
            </div>
            <div>
              <div className="sb-title">Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.map(t=>(
                  <button key={t} onClick={()=>toggleTag(t)} className={`px-2 py-0.5 rounded-full text-[0.59rem] font-semibold tracking-widest uppercase cursor-pointer transition-all font-body border ${filter.tag===t?'border-accent bg-accent/12 text-accent':'border-border text-muted hover:border-accent hover:text-accent bg-transparent'}`}>{t}</button>
                ))}
              </div>
            </div>
            {hasFilters&&<button onClick={reset} className="w-full py-1.5 rounded-lg border border-red-500/30 bg-red-900/10 text-red-400 text-xs font-semibold cursor-pointer hover:bg-red-900/20 font-body transition-all">✕ Clear Filters</button>}
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border flex-wrap gap-2">
            <p className="text-xs text-muted">Showing <strong className="text-white">{total}</strong> article{total!==1?'s':''}
              {filter.category!=='all'&&<> in <span className="text-accent2">{filter.category}</span></>}
              {filter.tag&&<> tagged <span className="text-accent">#{filter.tag}</span></>}
            </p>
            <p className="text-xs text-muted">Page {filter.page} of {totalPages}</p>
          </div>
          {/* Mobile search */}
          <div className="lg:hidden relative mb-4">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none">⌕</span>
            <input className="input-field pl-8 text-sm" placeholder="Search articles…" value={filter.search} onChange={e=>setSearch(e.target.value)}/>
          </div>

          {isLoading&&<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">{Array.from({length:8}).map((_,i)=><div key={i} className="bg-surface border border-border rounded-xl overflow-hidden animate-pulse"><div className="h-36 bg-surface2"/><div className="p-3 space-y-2"><div className="h-3 bg-surface2 rounded w-3/4"/><div className="h-2.5 bg-surface2 rounded w-full"/></div></div>)}</div>}
          {isError&&<div className="text-center py-20"><div className="text-4xl mb-3">⚠️</div><h3 className="font-display text-xl text-white mb-2">Failed to load articles</h3><p className="text-muted text-sm mb-4">Make sure the backend is running on port 3001.</p><button onClick={reset} className="btn-primary">Reset</button></div>}
          {!isLoading&&!isError&&blogs.length===0&&<div className="text-center py-20"><div className="text-4xl mb-3">🔍</div><h3 className="font-display text-xl text-white mb-2">No articles found</h3><p className="text-muted text-sm mb-5">Try adjusting your filters.</p><button onClick={reset} className="btn-primary">Clear Filters</button></div>}
          {!isLoading&&!isError&&blogs.length>0&&<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">{blogs.map(blog=><BlogCard key={blog.id} blog={blog} navigate={navigate} fd={fd}/>)}</div>}

          {totalPages>1&&!isLoading&&(
            <>
              <div className="flex justify-center items-center gap-1.5 mt-10 flex-wrap">
                <button disabled={filter.page===1} onClick={()=>goPage(filter.page-1)} className="w-9 h-9 rounded-lg border border-border bg-transparent text-muted flex items-center justify-center transition-all disabled:text-border disabled:cursor-not-allowed hover:enabled:border-accent hover:enabled:text-accent cursor-pointer font-body text-sm">←</button>
                {pgNums(filter.page,totalPages).map((p,i)=>p==='…'?<span key={`e${i}`} className="text-muted text-sm px-1">…</span>:<button key={p} onClick={()=>goPage(p)} className={`w-9 h-9 rounded-lg border text-sm flex items-center justify-center transition-all cursor-pointer font-body ${p===filter.page?'bg-accent border-accent text-ink font-bold':'border-border bg-transparent text-muted hover:border-accent hover:text-accent'}`}>{p}</button>)}
                <button disabled={filter.page===totalPages} onClick={()=>goPage(filter.page+1)} className="w-9 h-9 rounded-lg border border-border bg-transparent text-muted flex items-center justify-center transition-all disabled:text-border disabled:cursor-not-allowed hover:enabled:border-accent hover:enabled:text-accent cursor-pointer font-body text-sm">→</button>
              </div>
              <p className="text-center text-[0.67rem] text-muted mt-3">Showing {(filter.page-1)*PER+1}–{Math.min(filter.page*PER,total)} of {total} articles</p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
