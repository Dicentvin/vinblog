import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useCreateBlogMutation, useAiAssistMutation, useUploadImageMutation, useGetAiResultQuery } from '../../store/apiSlice';
import { useNav, useAppSelector } from '../../hooks';
import { selectEditBlogId } from '../../store/uiSlice';
import type { ContentBlock, CreateBlogPayload, SeoResult } from '../../types';

const CATS=['Fullstack','Politics','Gynaecologic Oncology','Self Development','Data Analysis','Business','Female Reproductive Health','AI & ML'] as const;
type BCat=(typeof CATS)[number];
interface AiModal{type:string;result:string;}

export default function AdminCreateBlog():JSX.Element{
  const {switchAdminPage}=useNav();
  const editId=useAppSelector(selectEditBlogId);
  const [createBlog,{isLoading:saving}]=useCreateBlogMutation();
  const [aiAssist,{isLoading:aiLoading}]=useAiAssistMutation();
  const [uploadImage,{isLoading:uploading}]=useUploadImageMutation();

  const [title,setTitle]=useState('');
  const [desc,setDesc]=useState('');
  const [category,setCategory]=useState<BCat|''>('');
  const [tags,setTags]=useState<string[]>([]);
  const [tagInput,setTagInput]=useState('');
  const [authorName,setAuthor]=useState('');
  const [minsRead,setMins]=useState(5);
  const [status,setStatus]=useState<'draft'|'published'>('draft');
  const [coverUrl,setCoverUrl]=useState('');
  const [coverFileId,setCoverFileId]=useState('');
  const [blocks,setBlocks]=useState<ContentBlock[]>([{id:'b1',type:'text',content:''}]);
  const [aiModal,setAiModal]=useState<AiModal|null>(null);
  const [seoData,setSeoData]=useState<SeoResult|null>(null);
  const [aiRequestId,setAiRequestId]=useState<string|null>(null);

  // Poll for async AI result from Inngest
  const {data:aiPoll}=useGetAiResultQuery(aiRequestId??'',{skip:!aiRequestId,pollingInterval:1500});

  // When Inngest finishes, show modal
  if(aiPoll?.status==='done'&&aiPoll.result&&aiRequestId){
    if(aiPoll.type==='seo'){
      try{const d=JSON.parse(aiPoll.result.replace(/```json|```/g,'').trim())as SeoResult;setSeoData(d);}catch{}
    }else{
      setAiModal({type:aiPoll.type,result:aiPoll.result});
    }
    setAiRequestId(null);
  }

  const getContent=():string=>blocks.filter(b=>b.type==='text').map(b=>b.content??'').join('\n\n');
  const addTag=():void=>{const v=tagInput.trim();if(v&&!tags.includes(v)){setTags([...tags,v]);setTagInput('');}};
  const addBlock=(type:'text'|'image',afterId?:string):void=>{
    const nb:ContentBlock={id:Date.now().toString(),type,content:'',url:'',caption:''};
    if(!afterId){setBlocks(p=>[...p,nb]);return;}
    setBlocks(p=>{const i=p.findIndex(b=>b.id===afterId);return[...p.slice(0,i+1),nb,...p.slice(i+1)];});
  };
  const updateBlock=(id:string,key:keyof ContentBlock,val:string):void=>setBlocks(p=>p.map(b=>b.id===id?{...b,[key]:val}:b));
  const removeBlock=(id:string):void=>setBlocks(p=>p.filter(b=>b.id!==id));

  const handleImageUpload=async(e:ChangeEvent<HTMLInputElement>):Promise<void>=>{
    const file=e.target.files?.[0];if(!file)return;
    const fd=new FormData();fd.append('image',file);
    try{const r=await uploadImage(fd).unwrap();setCoverUrl(r.url);setCoverFileId(r.fileId);}
    catch(err){console.error('Upload failed:',err);}
  };

  const runAI=async(type:'write'|'fix'|'format'|'seo'):Promise<void>=>{
    const content=getContent();
    if(type!=='write'&&!content.trim()){alert('Add some content first!');return;}
    try{
      const res=await aiAssist({type,content,title}).unwrap();
      // If synchronous result (fallback)
      if(res.status==='done'&&res.result){
        if(type==='seo'){try{setSeoData(JSON.parse((res.result as string).replace(/```json|```/g,'').trim()));}catch{}}
        else setAiModal({type,result:res.result as string});
      }else{
        // Polling for Inngest async result
        setAiRequestId(res.requestId);
      }
    }catch{setAiModal({type,result:'⚠️ AI not connected. Configure GEMINI_API_KEY in backend .env'});}
  };

  const applyAI=():void=>{
    if(aiModal?.result&&blocks[0]?.type==='text')setBlocks(p=>p.map((b,i)=>i===0?{...b,content:aiModal.result}:b));
    setAiModal(null);
  };

  const handleSave=async(e:FormEvent):Promise<void>=>{
    e.preventDefault();if(!title.trim()){alert('Please enter a title.');return;}
    const payload:CreateBlogPayload={title,description:desc,image:coverUrl,imageFileId:coverFileId,content:getContent(),contentBlocks:blocks,category:category||'Frontend',tags,authorName,minsRead,status};
    try{await createBlog(payload).unwrap();alert(`"${title}" saved as ${status}!`);switchAdminPage('blogs');}
    catch(err:unknown){const msg=err&&typeof err==='object'&&'data'in err?(err as{data?:{error?:string}}).data?.error??'Unknown':'Unknown';alert('Error: '+msg);}
  };

  return(
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div><p className="text-[0.62rem] text-muted tracking-widest uppercase mb-1.5">Content</p><h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">{editId?'Edit Post':'Create New Post'}</h1></div>
        <div className="flex gap-2 flex-wrap">
          <select value={status} onChange={e=>setStatus(e.target.value as'draft'|'published')} className="input-field w-36 text-sm"><option value="draft">Draft</option><option value="published">Published</option></select>
          <button onClick={()=>switchAdminPage('blogs')} className="btn-ghost">Cancel</button>
          <button onClick={e=>void handleSave(e)} disabled={saving} className="btn-primary disabled:opacity-60">{saving?'⏳ Saving…':status==='published'?'Publish →':'Save Draft'}</button>
        </div>
      </div>

      <form onSubmit={e=>void handleSave(e)} className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
        <div className="space-y-4">
          {/* Title/desc */}
          <div className="admin-card p-4 sm:p-5">
            <label className="block text-[0.62rem] font-bold tracking-widest uppercase text-muted mb-2">Title</label>
            <input className="input-field font-display font-bold text-xl mb-4" placeholder="Post title…" value={title} onChange={e=>setTitle(e.target.value)}/>
            <label className="block text-[0.62rem] font-bold tracking-widest uppercase text-muted mb-2">Excerpt</label>
            <textarea className="input-field resize-y" rows={2} placeholder="Short description…" value={desc} onChange={e=>setDesc(e.target.value)}/>
          </div>

          {/* Cover */}
          <div className="admin-card p-4 sm:p-5">
            <label className="block text-[0.62rem] font-bold tracking-widest uppercase text-muted mb-3">Cover Image (ImageKit)</label>
            {coverUrl?(
              <div className="relative rounded-xl overflow-hidden">
                <img src={`${coverUrl}?tr=w-800,h-400,q-auto,f-webp`} alt="cover" className="w-full h-48 object-cover"/>
                <button type="button" onClick={()=>{setCoverUrl('');setCoverFileId('');}} className="absolute top-2 right-2 btn-danger py-1 px-2.5 text-xs">✕ Remove</button>
                <div className="absolute bottom-2 left-2 bg-ink/80 text-accent text-[0.58rem] px-2 py-0.5 rounded">✓ Hosted on ImageKit</div>
              </div>
            ):(
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">🌅</div>
                <p className="text-muted text-sm mb-3">{uploading?'⏳ Uploading to ImageKit…':'Upload image or paste URL'}</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center items-center flex-wrap">
                  <label className="btn-ghost text-xs px-3 py-1.5 cursor-pointer">
                    {uploading?'Uploading…':'📁 Upload File'}
                    <input type="file" accept="image/*" className="hidden" onChange={e=>void handleImageUpload(e)}/>
                  </label>
                  <span className="text-muted text-xs">or</span>
                  <input type="url" placeholder="https://…" className="input-field w-full sm:w-64 text-sm" onChange={(e:ChangeEvent<HTMLInputElement>)=>{if(e.target.value.startsWith('http'))setCoverUrl(e.target.value);}}/>
                </div>
              </div>
            )}
          </div>

          {/* AI */}
          <div className="rounded-xl p-4 border border-accent/20 bg-gradient-to-br from-accent/8 to-accent2/5">
            <p className="text-[0.62rem] font-bold tracking-widest uppercase text-accent mb-3">🤖 AI Writing Assistant (Gemini via Inngest)</p>
            {aiRequestId&&<p className="text-xs text-accent mb-3 animate-pulse">⏳ AI is processing your request…</p>}
            <div className="flex flex-wrap gap-2">
              {([['write','✨ Write for Me'],['fix','🔧 Fix Grammar'],['format','📐 Format'],['seo','📊 SEO Analysis']] as const).map(([t,l])=>(
                <button key={t} type="button" disabled={aiLoading||!!aiRequestId} onClick={()=>void runAI(t)} className="bg-surface2 border border-border text-white px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all hover:border-accent hover:text-accent disabled:opacity-50 font-body">{aiLoading?'⏳':l}</button>
              ))}
            </div>
          </div>

          {/* Content blocks */}
          <div className="admin-card p-4 sm:p-5">
            <p className="text-[0.62rem] font-bold tracking-widest uppercase text-muted mb-4">Content Blocks</p>
            <div className="space-y-3">
              {blocks.map(b=>b.type==='text'?(
                <div key={b.id}>
                  <textarea className="input-field resize-y text-sm leading-relaxed" rows={6} placeholder="Write content here…" value={b.content??''} onChange={e=>updateBlock(b.id,'content',e.target.value)}/>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    <button type="button" onClick={()=>addBlock('image',b.id)} className="text-xs text-muted border border-border px-2.5 py-1 rounded-md hover:border-accent hover:text-accent transition-all cursor-pointer bg-transparent font-body">+ Insert Image Below</button>
                    <button type="button" onClick={()=>removeBlock(b.id)} className="text-xs text-red-400 bg-transparent border-0 cursor-pointer font-body hover:text-red-300">✕ Remove</button>
                  </div>
                </div>
              ):(
                <div key={b.id} className="border-2 border-dashed border-border rounded-xl overflow-hidden">
                  {b.url?(
                    <>
                      <img src={`${b.url}?tr=w-800,q-auto,f-webp`} alt={b.caption??''} className="w-full max-h-72 object-cover"/>
                      <div className="flex gap-2 p-2.5 bg-surface2">
                        <input placeholder="Image caption…" className="input-field flex-1 text-xs italic" value={b.caption??''} onChange={e=>updateBlock(b.id,'caption',e.target.value)}/>
                        <button type="button" onClick={()=>removeBlock(b.id)} className="btn-danger py-1 px-2 text-xs">✕</button>
                      </div>
                    </>
                  ):(
                    <div className="p-6 text-center"><div className="text-2xl mb-2">🖼</div><p className="text-muted text-xs mb-3">Paste image URL</p>
                      <div className="flex gap-2 justify-center flex-wrap">
                        <input type="url" placeholder="https://…" className="input-field w-full sm:w-56 text-xs" onChange={e=>{if(e.target.value.startsWith('http'))updateBlock(b.id,'url',e.target.value);}}/>
                        <button type="button" onClick={()=>removeBlock(b.id)} className="btn-danger py-1 px-2 text-xs">✕</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              <button type="button" onClick={()=>addBlock('text')} className="btn-ghost text-xs px-3 py-1.5">+ Text Block</button>
              <button type="button" onClick={()=>addBlock('image')} className="btn-ghost text-xs px-3 py-1.5">🖼 Image Block</button>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-3">
          <div className="admin-card p-4"><label className="block text-[0.62rem] font-bold tracking-widest uppercase text-muted mb-2">Category</label><select className="input-field text-sm" value={category} onChange={e=>setCategory(e.target.value as BCat|'')}><option value="">Select…</option>{CATS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          <div className="admin-card p-4">
            <label className="block text-[0.62rem] font-bold tracking-widest uppercase text-muted mb-2">Tags</label>
            <div className="flex gap-2 mb-2"><input className="input-field flex-1 text-sm" placeholder="Add tag…" value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addTag();}}}/><button type="button" onClick={addTag} className="btn-ghost px-3 text-sm">+</button></div>
            <div className="flex flex-wrap gap-1.5">{tags.map(t=><span key={t} className="inline-flex items-center gap-1 bg-surface2 border border-border rounded-full px-2.5 py-0.5 text-xs text-white">{t}<button type="button" onClick={()=>setTags(tags.filter(x=>x!==t))} className="bg-transparent border-0 text-muted cursor-pointer leading-none hover:text-red-400 font-body">×</button></span>)}</div>
          </div>
          <div className="admin-card p-4"><label className="block text-[0.62rem] font-bold tracking-widest uppercase text-muted mb-2">Author</label><input className="input-field text-sm mb-2" placeholder="Author name" value={authorName} onChange={e=>setAuthor(e.target.value)}/><input className="input-field text-xs" placeholder="Author image URL" type="url"/></div>
          <div className="admin-card p-4"><label className="block text-[0.62rem] font-bold tracking-widest uppercase text-muted mb-2">Read Time</label><div className="flex items-center gap-2"><input type="number" min={1} max={60} value={minsRead} onChange={e=>setMins(Number(e.target.value))} className="input-field w-16 text-sm"/><span className="text-muted text-sm">minutes</span></div></div>

          {/* SEO */}
          {seoData&&(
            <div className="admin-card p-4 border-accent/20">
              <p className="text-[0.62rem] font-bold tracking-widest uppercase text-accent mb-3">📊 SEO Analysis</p>
              <div className="w-[72px] h-[72px] rounded-full border-4 border-accent flex items-center justify-center mx-auto mb-3"><span className="font-display font-bold text-xl text-white">{seoData.score}</span></div>
              {seoData.title_suggestion&&<div className="mb-3"><p className="text-[0.6rem] text-muted uppercase tracking-widest mb-1">Suggested Title</p><p className="text-xs text-white leading-relaxed">{seoData.title_suggestion}</p></div>}
              {(seoData.keywords?.length??0)>0&&<div className="mb-3"><p className="text-[0.6rem] text-muted uppercase tracking-widest mb-1.5">Keywords</p><div className="flex flex-wrap gap-1">{seoData.keywords!.map(k=><span key={k} className="px-2 py-0.5 rounded-full text-[0.6rem] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{k}</span>)}</div></div>}
              {(seoData.tips?.length??0)>0&&<div><p className="text-[0.6rem] text-muted uppercase tracking-widest mb-1.5">Tips</p>{seoData.tips!.map((t,i)=><p key={i} className="text-xs text-[#a8a6b8] mb-1">• {t}</p>)}</div>}
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary w-full py-3 text-sm disabled:opacity-60">{saving?'⏳ Saving…':status==='published'?'🚀 Publish Post':'💾 Save Draft'}</button>
        </div>
      </form>

      {/* AI Modal */}
      {aiModal&&(
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-lg text-white">{{write:'✨ Generated Content',fix:'🔧 Grammar Fix',format:'📐 Formatted'}[aiModal.type]??'AI Result'}</h3>
              <button onClick={()=>setAiModal(null)} className="text-muted hover:text-white transition-colors bg-transparent border-0 cursor-pointer text-xl leading-none font-body">✕</button>
            </div>
            <textarea className="input-field flex-1 resize-none text-sm leading-relaxed mb-4 overflow-y-auto" rows={14} value={aiModal.result} onChange={e=>setAiModal({...aiModal,result:e.target.value})}/>
            <div className="flex gap-2 flex-wrap"><button onClick={applyAI} className="btn-primary">✓ Apply to Editor</button><button onClick={()=>setAiModal(null)} className="btn-ghost">Discard</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
