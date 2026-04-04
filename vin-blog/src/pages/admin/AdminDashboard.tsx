import { useGetAdminStatsQuery, useGetBlogsQuery } from '../../store/apiSlice';
import { useNav } from '../../hooks';

const CATS=[{id:'Fullstack',color:'#6366f1'},{id:'Politics',color:'#10b981'},{id:'Gynaecologic Oncology',color:'#f59e0b'},{id:'Self Development',color:'#ec4899'},{id:'Data Analysis',color:'#3b82f6'},{id:'Business',color:'#14b8a6'},{id:'Female Reproductive Health',color:'#e879f9'},{id:'AI & ML',color:'#8b5cf6'}];
const fd=(d:string)=>new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});

export default function AdminDashboard():JSX.Element{
  const {switchAdminPage}=useNav();
  const {data:stats,isLoading:sl}=useGetAdminStatsQuery();
  const {data:blogsData,isLoading:bl}=useGetBlogsQuery({limit:50});
  const blogs=blogsData?.data??[];
  const tv=blogs.reduce((a,b)=>a+(b.views??0),0);
  const tc=blogs.reduce((a,b)=>a+(b.comments?.length??0),0);

  const statCards=[
    {label:'Total Posts', value:(stats?.totalBlogs??blogs.length).toString(),    change:'+3 this month',  icon:'📝',color:'text-accent'},
    {label:'Total Views', value:(stats?.totalViews??tv).toLocaleString(),          change:'+12% this month',icon:'👁', color:'text-accent2'},
    {label:'Comments',    value:(stats?.totalComments??tc).toString(),             change:'+8 this week',  icon:'💬',color:'text-emerald-400'},
    {label:'Subscribers', value:(stats?.totalSubscribers??'12,841').toString(),    change:'+241 this week',icon:'📬',color:'text-blue-400'},
  ];

  return(
    <div>
      <div className="mb-7"><p className="text-[0.62rem] text-muted tracking-widest uppercase mb-1.5">Overview</p><h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">Dashboard</h1></div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {statCards.map(s=>(
          <div key={s.label} className="admin-card p-4 sm:p-5">
            <div className="text-xl sm:text-2xl mb-2.5">{s.icon}</div>
            {sl?<div className="h-7 bg-surface2 rounded w-16 mb-1.5 animate-pulse"/>:<div className="font-display font-bold text-xl sm:text-2xl text-white mb-1">{s.value}</div>}
            <div className="text-xs text-muted mb-1">{s.label}</div>
            <div className={`text-[0.62rem] font-semibold ${s.color}`}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-5">
        <div className="admin-card p-4 sm:p-5">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Views by Category</h3>
          {CATS.map(cat=>{const cv=blogs.filter(b=>b.category===cat.id).reduce((a,b)=>a+(b.views??0),0);const pct=tv>0?Math.round(cv/tv*100):0;return(
            <div key={cat.id} className="mb-3">
              <div className="flex justify-between text-xs mb-1.5"><span className="text-white">{cat.id}</span><span className="text-muted">{cv.toLocaleString()} ({pct}%)</span></div>
              <div className="h-1.5 bg-surface2 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`,background:cat.color}}/></div>
            </div>
          );})}
        </div>
        <div className="admin-card p-4 sm:p-5">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Top Performing Posts</h3>
          {bl?Array.from({length:5}).map((_,i)=><div key={i} className="flex gap-2.5 mb-3 animate-pulse"><div className="w-8 h-8 bg-surface2 rounded-lg flex-shrink-0"/><div className="flex-1 space-y-1.5"><div className="h-2.5 bg-surface2 rounded w-3/4"/><div className="h-2 bg-surface2 rounded w-1/2"/></div></div>):
            [...blogs].sort((a,b)=>b.views-a.views).slice(0,5).map((b,i)=>(
              <div key={b.id} className="flex items-center gap-2.5 mb-3">
                <span className="font-display font-bold text-[0.88rem] text-border w-5 text-center flex-shrink-0">{i+1}</span>
                <img src={b.image} alt={b.title} className="w-8 h-8 rounded-lg object-cover flex-shrink-0"/>
                <div className="min-w-0"><div className="text-xs font-semibold text-white truncate">{b.title}</div><div className="text-[0.63rem] text-muted">{b.views.toLocaleString()} views · {b.likes} likes</div></div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Recent table */}
      <div className="admin-card mb-6">
        <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-0 flex-wrap gap-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest">Recent Posts</h3>
          <button onClick={()=>switchAdminPage('blogs')} className="btn-ghost text-[0.7rem] px-3 py-1">View All →</button>
        </div>
        <div className="p-3 sm:p-4 overflow-x-auto">
          <table className="w-full border-collapse" style={{minWidth:520}}>
            <thead><tr>{['Post','Category','Author','Views','Status'].map(h=><th key={h} className="text-[0.6rem] font-bold tracking-widest uppercase text-muted text-left py-2.5 px-3 border-b border-border">{h}</th>)}</tr></thead>
            <tbody>
              {[...blogs].sort((a,b)=>new Date(b.publishedAt).getTime()-new Date(a.publishedAt).getTime()).slice(0,5).map(b=>(
                <tr key={b.id} className="hover:bg-white/[0.016] transition-colors">
                  <td className="py-3 px-3 border-b border-border"><div className="flex items-center gap-2.5"><img src={b.image} alt={b.title} className="w-9 h-9 rounded-lg object-cover flex-shrink-0"/><span className="text-xs font-medium text-white truncate max-w-[180px]">{b.title}</span></div></td>
                  <td className="py-3 px-3 border-b border-border"><span className="text-[0.7rem] text-accent2">{b.category}</span></td>
                  <td className="py-3 px-3 border-b border-border"><div className="flex items-center gap-1.5"><img src={b.author.image} alt={b.author.name} className="w-5 h-5 rounded-full"/><span className="text-xs text-[#e8e6f0] truncate max-w-[100px]">{b.author.name}</span></div></td>
                  <td className="py-3 px-3 border-b border-border text-xs text-muted">{b.views.toLocaleString()}</td>
                  <td className="py-3 px-3 border-b border-border"><span className={b.featured?'pill-feat':'pill-pub'}>{b.featured?'Featured':'Published'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex gap-3 flex-wrap">
        <button onClick={()=>switchAdminPage('create')} className="btn-primary">✚ Create New Post</button>
        <button onClick={()=>switchAdminPage('comments')} className="btn-ghost">View All Comments</button>
      </div>
    </div>
  );
}
