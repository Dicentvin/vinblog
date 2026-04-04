import { useState } from 'react';
import { useGetAllCommentsQuery, useDeleteCommentMutation, useLikeCommentMutation, useGetBlogsQuery } from '../../store/apiSlice';
import { useNav } from '../../hooks';

const fd=(d:string)=>new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});

export default function AdminComments():JSX.Element{
  const {navigate}=useNav();
  const {data:blogsData}=useGetBlogsQuery({limit:50});
  const {data:allComments=[],isLoading}=useGetAllCommentsQuery();
  const [deleteComment]=useDeleteCommentMutation();
  const [likeComment]=useLikeCommentMutation();
  const [replyId,setReplyId]=useState<string|null>(null);
  const [replyText,setReplyText]=useState('');
  const [search,setSearch]=useState('');
  const blogs=blogsData?.data??[];
  const filtered=allComments.filter(c=>(c.content??'').toLowerCase().includes(search.toLowerCase())||(c.author??'').toLowerCase().includes(search.toLowerCase()));
  const totalLikes=allComments.reduce((a,c)=>a+(c.likes??0),0);
  const thisWeek=allComments.filter(c=>new Date(c.createdAt)>new Date(Date.now()-7*86400000)).length;
  const grouped=blogs.reduce<{blog:(typeof blogs)[number];comments:typeof allComments}[]>((acc,blog)=>{
    const bc=filtered.filter(c=>c.blogId===blog.id);if(bc.length)acc.push({blog,comments:bc});return acc;
  },[]);

  return(
    <div>
      <div className="mb-7"><p className="text-[0.62rem] text-muted tracking-widest uppercase mb-1.5">Moderation</p><h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">Comments</h1></div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {[{label:'Total Comments',value:allComments.length,icon:'💬',color:'text-accent'},{label:'This Week',value:thisWeek,icon:'🗓',color:'text-accent2'},{label:'Total Likes',value:totalLikes,icon:'👍',color:'text-emerald-400'}].map(s=>(
          <div key={s.label} className="admin-card p-4 sm:p-5 flex items-center gap-4">
            <span className="text-2xl">{s.icon}</span>
            <div><div className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</div><div className="text-xs text-muted">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="relative mb-5 max-w-xs">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">⌕</span>
        <input className="input-field pl-9 text-sm w-full" placeholder="Search comments…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      {isLoading&&<div className="space-y-5">{Array.from({length:3}).map((_,i)=><div key={i} className="admin-card animate-pulse"><div className="h-14 bg-surface2 rounded-t-xl"/><div className="p-4 space-y-3"><div className="h-4 bg-surface2 rounded w-3/4"/><div className="h-3 bg-surface2 rounded w-full"/></div></div>)}</div>}
      {!isLoading&&grouped.length===0&&<div className="text-center py-20"><div className="text-4xl mb-3">💬</div><h3 className="font-display text-xl text-white mb-2">No comments found</h3><p className="text-muted text-sm">Comments will appear here once readers engage.</p></div>}

      <div className="space-y-6">
        {grouped.map(({blog,comments})=>(
          <div key={blog.id}>
            <div className="flex items-center gap-3 px-4 py-3.5 bg-surface2 border border-border rounded-t-xl flex-wrap gap-y-2">
              <img src={blog.image} alt={blog.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0"/>
              <div className="flex-1 min-w-0"><h3 className="text-sm font-bold text-white truncate">{blog.title}</h3><span className="text-xs text-muted">{comments.length} comment{comments.length!==1?'s':''}</span></div>
              <button onClick={()=>navigate('blog',blog.id)} className="btn-ghost text-xs px-3 py-1.5 flex-shrink-0">View Post →</button>
            </div>
            <div className="bg-surface border border-border border-t-0 rounded-b-xl overflow-hidden divide-y divide-border">
              {comments.map(c=>(
                <div key={c.id} className="flex gap-3 p-4">
                  <img src={c.avatar??`https://i.pravatar.cc/150?u=${c.author}`} alt={c.author} className="w-9 h-9 rounded-full flex-shrink-0 border-2 border-border"/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
                      <div><span className="text-sm font-bold text-white">{c.author}</span><span className="text-xs text-muted ml-2">{fd(c.createdAt)}</span></div>
                      <div className="flex gap-1.5 flex-shrink-0 flex-wrap">
                        <button onClick={()=>setReplyId(replyId===c.id?null:c.id)} className="btn-ghost py-1 px-2.5 text-xs">↩ Reply</button>
                        <button onClick={()=>void likeComment(c.id)} className="btn-ghost py-1 px-2.5 text-xs">👍 {c.likes??0}</button>
                        <button onClick={()=>void deleteComment(c.id)} className="btn-danger py-1 px-2.5 text-xs">✕</button>
                      </div>
                    </div>
                    <p className="text-sm text-[#a8a6b8] leading-relaxed">{c.content}</p>
                    {replyId===c.id&&(
                      <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        <textarea className="input-field flex-1 text-sm resize-none" rows={2} placeholder="Write a reply…" value={replyText} onChange={e=>setReplyText(e.target.value)}/>
                        <div className="flex sm:flex-col gap-1.5">
                          <button onClick={()=>{alert(`Reply sent: ${replyText}`);setReplyId(null);setReplyText('');}} className="btn-primary py-1.5 px-3 text-xs whitespace-nowrap">Send</button>
                          <button onClick={()=>{setReplyId(null);setReplyText('');}} className="btn-ghost py-1.5 px-3 text-xs">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
