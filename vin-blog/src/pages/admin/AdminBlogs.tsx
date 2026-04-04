import { useState, useMemo, useEffect } from 'react';
import { useGetBlogsQuery, useDeleteBlogMutation, useUpdateBlogMutation } from '../../store/apiSlice';
import type { UpdateBlogArgs } from '../../store/apiSlice';
import { useNav } from '../../hooks';
import type { Blog } from '../../types';

// ── Constants ─────────────────────────────────────────────────────────────────
const PER_PAGE = 10;
const CATS     = ['Fullstack','Politics','Gynaecologic Oncology','Self Development','Data Analysis','Business','Female Reproductive Health','AI & ML'];

const fd = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function pgNums(cur: number, tot: number): (number | '…')[] {
  if (tot <= 5) return Array.from({ length: tot }, (_, i) => i + 1);
  if (cur <= 3) return [1, 2, 3, '…', tot];
  if (cur >= tot - 2) return [1, '…', tot - 2, tot - 1, tot];
  return [1, '…', cur - 1, cur, cur + 1, '…', tot];
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
interface EditModalProps {
  blog:    Blog;
  onClose: () => void;
}

function EditModal({ blog, onClose }: EditModalProps): JSX.Element {
  const [updateBlog, { isLoading }] = useUpdateBlogMutation();

  const [title,    setTitle]    = useState(blog.title ?? '');
  const [desc,     setDesc]     = useState(blog.description ?? '');
  const [category, setCategory] = useState(blog.category ?? '');
  const [minsRead, setMinsRead] = useState(blog.minsRead ?? 5);
  const [status,   setStatus]   = useState<'draft' | 'published'>(
    (blog.status as 'draft' | 'published') ?? 'published'
  );
  const [featured, setFeatured] = useState(blog.featured ?? false);
  const [tags,     setTags]     = useState<string[]>(blog.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const addTag = (): void => {
    const v = tagInput.trim();
    if (v && !tags.includes(v)) { setTags(prev => [...prev, v]); setTagInput(''); }
  };

  const handleSave = async (): Promise<void> => {
    setError('');
    const args: UpdateBlogArgs = {
      id:          blog.id,
      title,
      description: desc,
      category,
      minsRead,
      status,
      featured,
      tags,
    };
    try {
      await updateBlog(args).unwrap();
      setSuccess(true);
      setTimeout(() => { onClose(); }, 1500);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { error?: string } }).data?.error ?? 'Update failed'
          : 'Update failed. Make sure the backend is running.';
      setError(msg);
    }
  };

  return (
    // Full-screen backdrop — click outside to close
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      className="flex items-center justify-center p-4"
    >
      {/* Dark overlay */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 0 }}
        onClick={onClose}
      />

      {/* Modal box */}
      <div
        style={{ position: 'relative', zIndex: 1 }}
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-surface border border-border rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="min-w-0">
            <p className="text-[0.58rem] text-muted tracking-widest uppercase mb-0.5">Editing Post</p>
            <h2 className="font-display font-bold text-lg text-white truncate">{blog.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-surface2 border border-border text-muted hover:text-white hover:border-accent transition-all cursor-pointer font-body flex items-center justify-center text-xl leading-none flex-shrink-0 ml-4"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Cover image preview */}
          {blog.image && (
            <div className="rounded-xl overflow-hidden h-44">
              <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-[0.62rem] font-bold tracking-widest uppercase text-muted mb-2">Title</label>
            <input
              className="input-field text-sm"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Post title…"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[0.62rem] font-bold tracking-widest uppercase text-muted mb-2">Description</label>
            <textarea
              className="input-field text-sm resize-y"
              rows={3}
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Short description…"
            />
          </div>

          {/* Category + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.62rem] font-bold tracking-widest uppercase text-muted mb-2">Category</label>
              <select className="input-field text-sm" value={category} onChange={e => setCategory(e.target.value)}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[0.62rem] font-bold tracking-widest uppercase text-muted mb-2">Status</label>
              <select
                className="input-field text-sm"
                value={status}
                onChange={e => setStatus(e.target.value as 'draft' | 'published')}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Read time + Featured */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.62rem] font-bold tracking-widest uppercase text-muted mb-2">Read Time (mins)</label>
              <input
                type="number"
                min={1}
                max={60}
                className="input-field text-sm"
                value={minsRead}
                onChange={e => setMinsRead(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-[0.62rem] font-bold tracking-widest uppercase text-muted mb-2">Featured</label>
              <button
                type="button"
                onClick={() => setFeatured(f => !f)}
                className={`w-full py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer font-body ${featured ? 'bg-accent/15 border-accent text-accent' : 'bg-transparent border-border text-muted hover:border-accent hover:text-accent'}`}
              >
                {featured ? '★ Featured' : '☆ Not Featured'}
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[0.62rem] font-bold tracking-widest uppercase text-muted mb-2">Tags</label>
            <div className="flex gap-2 mb-2.5">
              <input
                className="input-field flex-1 text-sm"
                placeholder="Type tag and press Enter or +"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              />
              <button type="button" onClick={addTag} className="btn-ghost px-3 text-sm flex-shrink-0">+</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map(t => (
                <span key={t} className="inline-flex items-center gap-1 bg-surface2 border border-border rounded-full px-2.5 py-0.5 text-xs text-white">
                  {t}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter(x => x !== t))}
                    className="bg-transparent border-0 text-muted cursor-pointer leading-none hover:text-red-400 font-body text-sm"
                  >×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2.5">
              <span className="text-red-400 flex-shrink-0 mt-0.5">⚠</span>
              <p className="text-red-400 text-xs leading-relaxed">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 bg-emerald-900/20 border border-emerald-500/30 rounded-lg px-3 py-2.5">
              <span className="text-emerald-400">✓</span>
              <p className="text-emerald-400 text-xs">Post updated successfully! Closing…</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button
            onClick={() => void handleSave()}
            disabled={isLoading || success || !title.trim()}
            className="btn-primary disabled:opacity-60"
          >
            {isLoading ? '⏳ Saving…' : success ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main AdminBlogs Page ──────────────────────────────────────────────────────
export default function AdminBlogs(): JSX.Element {
  const { switchAdminPage } = useNav();

  const [search,    setSearch]    = useState('');
  const [cat,       setCat]       = useState('all');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editBlog,  setEditBlog]  = useState<Blog | null>(null);
  const [page,      setPage]      = useState(1);

  const { data, isLoading }  = useGetBlogsQuery({ limit: 200 });
  const [deleteBlog]         = useDeleteBlogMutation();

  const blogs = data?.data ?? [];
  const cats  = ['all', ...Array.from(new Set(blogs.map(b => b.category)))];

  const filtered = useMemo(() =>
    blogs.filter(b => {
      const matchSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = cat === 'all' || b.category === cat;
      return matchSearch && matchCat;
    }),
    [blogs, search, cat]
  );

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleSearch = (v: string): void => { setSearch(v); setPage(1); };
  const handleCat    = (v: string): void => { setCat(v);    setPage(1); };
  const goPage       = (p: number): void => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string): Promise<void> => {
    try { await deleteBlog(id).unwrap(); } catch { /* handled */ }
    setConfirmId(null);
  };

  return (
    <>
      {/* Render modal outside normal flow using a portal-like approach */}
      {editBlog !== null && (
        <EditModal
          blog={editBlog}
          onClose={() => setEditBlog(null)}
        />
      )}

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="text-[0.62rem] text-muted tracking-widest uppercase mb-1.5">Content</p>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">All Blogs</h1>
          </div>
          <button onClick={() => switchAdminPage('create')} className="btn-primary">✚ New Post</button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">⌕</span>
            <input
              className="input-field pl-9 text-sm w-full"
              placeholder="Search by title or author…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <select className="input-field w-full sm:w-44 text-sm" value={cat} onChange={e => handleCat(e.target.value)}>
            {cats.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
          </select>
        </div>

        {/* Results + page info */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p className="text-xs text-muted">
            <strong className="text-white">{filtered.length}</strong> post{filtered.length !== 1 ? 's' : ''}
            {cat !== 'all' && <> in <span className="text-accent2">{cat}</span></>}
            {search && <> · matching &ldquo;<span className="text-white">{search}</span>&rdquo;</>}
          </p>
          {totalPages > 1 && (
            <p className="text-xs text-muted">Page {currentPage} of {totalPages}</p>
          )}
        </div>

        {/* Table */}
        <div className="admin-card overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 680 }}>
            <thead>
              <tr>
                {['Post','Category','Author','Published','Views','Cmts','Status','Actions'].map(h => (
                  <th key={h} className="text-[0.6rem] font-bold tracking-widest uppercase text-muted text-left py-3 px-3.5 border-b border-border whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: PER_PAGE }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="py-2.5 px-3.5">
                        <div className="h-10 bg-surface2 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : paginated.map(b => (
                    <tr key={b.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Post */}
                      <td className="py-3 px-3.5 border-b border-border">
                        <div className="flex items-center gap-3">
                          <img src={b.image} alt={b.title} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                          <div>
                            <div className="text-xs font-semibold text-white truncate max-w-[190px]">{b.title}</div>
                            <div className="text-[0.62rem] text-muted mt-0.5">{b.minsRead} min read</div>
                          </div>
                        </div>
                      </td>
                      {/* Category */}
                      <td className="py-3 px-3.5 border-b border-border">
                        <span className="text-[0.68rem] text-accent2 bg-accent2/10 px-2 py-0.5 rounded-full border border-accent2/20 whitespace-nowrap">
                          {b.category}
                        </span>
                      </td>
                      {/* Author */}
                      <td className="py-3 px-3.5 border-b border-border">
                        <div className="flex items-center gap-1.5">
                          <img src={b.author.image} alt={b.author.name} className="w-6 h-6 rounded-full flex-shrink-0" />
                          <span className="text-xs text-[#e8e6f0] truncate max-w-[90px]">{b.author.name}</span>
                        </div>
                      </td>
                      {/* Published */}
                      <td className="py-3 px-3.5 border-b border-border text-xs text-muted whitespace-nowrap">
                        {fd(b.publishedAt)}
                      </td>
                      {/* Views */}
                      <td className="py-3 px-3.5 border-b border-border text-xs text-muted">
                        {b.views.toLocaleString()}
                      </td>
                      {/* Comments */}
                      <td className="py-3 px-3.5 border-b border-border text-xs text-muted">
                        💬 {b.comments?.length ?? 0}
                      </td>
                      {/* Status */}
                      <td className="py-3 px-3.5 border-b border-border">
                        <span className={b.featured ? 'pill-feat' : 'pill-pub'}>
                          {b.featured ? 'Featured' : 'Published'}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="py-3 px-3.5 border-b border-border">
                        <div className="flex gap-1.5">
                          <button
                            className="btn-ghost py-1 px-2.5 text-[0.68rem]"
                            onClick={() => setEditBlog(b)}
                          >
                            ✏ Edit
                          </button>
                          {confirmId === b.id ? (
                            <div className="flex gap-1">
                              <button
                                className="btn-danger py-1 px-2 text-[0.68rem]"
                                onClick={() => void handleDelete(b.id)}
                              >
                                Confirm
                              </button>
                              <button
                                className="btn-ghost py-1 px-2 text-[0.68rem]"
                                onClick={() => setConfirmId(null)}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn-danger py-1 px-2.5 text-[0.68rem]"
                              onClick={() => setConfirmId(b.id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="text-3xl mb-3">🔍</div>
              <p className="text-muted text-sm">No posts match your search.</p>
              <button
                onClick={() => { setSearch(''); setCat('all'); setPage(1); }}
                className="btn-ghost mt-3 text-xs px-3 py-1.5"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && !isLoading && (
          <div className="mt-6">
            <div className="flex justify-center items-center gap-1.5 flex-wrap">
              {/* Prev */}
              <button
                disabled={currentPage === 1}
                onClick={() => goPage(currentPage - 1)}
                className="w-9 h-9 rounded-lg border border-border bg-transparent text-muted flex items-center justify-center transition-all text-sm cursor-pointer font-body disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:border-accent hover:enabled:text-accent"
              >←</button>

              {/* Page numbers */}
              {pgNums(currentPage, totalPages).map((p, i) =>
                p === '…' ? (
                  <span key={`ellipsis-${i}`} className="text-muted text-sm w-6 text-center">…</span>
                ) : (
                  <button
                    key={`page-${p}`}
                    onClick={() => goPage(p as number)}
                    className={`w-9 h-9 rounded-lg border text-sm flex items-center justify-center transition-all cursor-pointer font-body ${p === currentPage ? 'bg-accent border-accent text-ink font-bold' : 'border-border bg-transparent text-muted hover:border-accent hover:text-accent'}`}
                  >
                    {p}
                  </button>
                )
              )}

              {/* Next */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => goPage(currentPage + 1)}
                className="w-9 h-9 rounded-lg border border-border bg-transparent text-muted flex items-center justify-center transition-all text-sm cursor-pointer font-body disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:border-accent hover:enabled:text-accent"
              >→</button>
            </div>

            {/* Page info */}
            <p className="text-center text-xs text-muted mt-2.5">
              Showing {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)} of {filtered.length} posts
            </p>
          </div>
        )}

        {/* Total count */}
        <p className="mt-4 text-xs text-muted">
          Total in database: {blogs.length} post{blogs.length !== 1 ? 's' : ''}
        </p>
      </div>
    </>
  );
}
