import { useState, useMemo } from 'react';
import { useGetBlogsQuery, useDeleteBlogMutation } from '../../store/apiSlice';
import { useNav } from '../../hooks';

const PER_PAGE = 8;
const fd = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function pgNums(cur: number, tot: number): (number | '…')[] {
  if (tot <= 5) return Array.from({ length: tot }, (_, i) => i + 1);
  if (cur <= 3) return [1, 2, 3, '…', tot];
  if (cur >= tot - 2) return [1, '…', tot - 2, tot - 1, tot];
  return [1, '…', cur - 1, cur, cur + 1, '…', tot];
}

export default function AdminBlogs(): JSX.Element {
  const { switchAdminPage } = useNav();
  const [search,    setSearch]    = useState('');
  const [cat,       setCat]       = useState('all');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [page,      setPage]      = useState(1);

  const { data, isLoading } = useGetBlogsQuery({ limit: 100 });
  const [deleteBlog]        = useDeleteBlogMutation();

  const blogs = data?.data ?? [];
  const cats  = ['all', ...Array.from(new Set(blogs.map(b => b.category)))];

  // Filter first, then paginate
  const filtered = useMemo(() => {
    return blogs.filter(b => {
      const ms = b.title.toLowerCase().includes(search.toLowerCase())
              || b.author.name.toLowerCase().includes(search.toLowerCase());
      const mc = cat === 'all' || b.category === cat;
      return ms && mc;
    });
  }, [blogs, search, cat]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // Reset to page 1 when filters change
  const handleSearch = (v: string): void => { setSearch(v); setPage(1); };
  const handleCat    = (v: string): void => { setCat(v);    setPage(1); };
  const goPage       = (p: number): void => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handleDelete = async (id: string): Promise<void> => {
    try { await deleteBlog(id).unwrap(); } catch { /* handled */ }
    setConfirmId(null);
  };

  return (
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
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">⌕</span>
          <input
            className="input-field pl-9 text-sm w-full"
            placeholder="Search posts…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-full sm:w-44 text-sm"
          value={cat}
          onChange={e => handleCat(e.target.value)}
        >
          {cats.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
        </select>
      </div>

      {/* Results info */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="text-xs text-muted">
          Showing <strong className="text-white">{filtered.length}</strong> post{filtered.length !== 1 ? 's' : ''}
          {cat !== 'all' && <> in <span className="text-accent2">{cat}</span></>}
          {search && <> matching &quot;<span className="text-white">{search}</span>&quot;</>}
        </p>
        {totalPages > 1 && (
          <p className="text-xs text-muted">Page {currentPage} of {totalPages}</p>
        )}
      </div>

      {/* Table */}
      <div className="admin-card overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: 700 }}>
          <thead>
            <tr>
              {['Post', 'Category', 'Author', 'Published', 'Views', 'Cmts', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-[0.6rem] font-bold tracking-widest uppercase text-muted text-left py-3 px-3.5 border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: PER_PAGE }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="py-3 px-3.5">
                      <div className="h-10 bg-surface2 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              : paginated.map(b => (
                  <tr key={b.id} className="hover:bg-white/[0.016] transition-colors">
                    <td className="py-3 px-3.5 border-b border-border">
                      <div className="flex items-center gap-3">
                        <img src={b.image} alt={b.title} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-white truncate max-w-[200px]">{b.title}</div>
                          <div className="text-[0.62rem] text-muted">{b.minsRead} min</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 border-b border-border">
                      <span className="text-[0.68rem] text-accent2 bg-accent2/10 px-2 py-0.5 rounded-full border border-accent2/20">{b.category}</span>
                    </td>
                    <td className="py-3 px-3.5 border-b border-border">
                      <div className="flex items-center gap-1.5">
                        <img src={b.author.image} alt={b.author.name} className="w-6 h-6 rounded-full" />
                        <span className="text-xs text-[#e8e6f0] truncate max-w-[100px]">{b.author.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 border-b border-border text-xs text-muted whitespace-nowrap">{fd(b.publishedAt)}</td>
                    <td className="py-3 px-3.5 border-b border-border text-xs text-muted">{b.views.toLocaleString()}</td>
                    <td className="py-3 px-3.5 border-b border-border">
                      <span className="text-xs text-muted">💬 {b.comments?.length ?? 0}</span>
                    </td>
                    <td className="py-3 px-3.5 border-b border-border">
                      <span className={b.featured ? 'pill-feat' : 'pill-pub'}>{b.featured ? 'Featured' : 'Published'}</span>
                    </td>
                    <td className="py-3 px-3.5 border-b border-border">
                      <div className="flex gap-1.5">
                        <button className="btn-ghost py-1 px-2.5 text-[0.68rem]" onClick={() => switchAdminPage('create')}>Edit</button>
                        {confirmId === b.id ? (
                          <div className="flex gap-1">
                            <button className="btn-danger py-1 px-2 text-[0.68rem]" onClick={() => void handleDelete(b.id)}>Confirm</button>
                            <button className="btn-ghost py-1 px-2 text-[0.68rem]" onClick={() => setConfirmId(null)}>✕</button>
                          </div>
                        ) : (
                          <button className="btn-danger py-1 px-2.5 text-[0.68rem]" onClick={() => setConfirmId(b.id)}>Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-14">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-muted text-sm">No posts match your search.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <>
          <div className="flex justify-center items-center gap-1.5 mt-6 flex-wrap">
            <button
              disabled={currentPage === 1}
              onClick={() => goPage(currentPage - 1)}
              className="w-9 h-9 rounded-lg border border-border bg-transparent text-muted flex items-center justify-center transition-all disabled:text-border disabled:cursor-not-allowed hover:enabled:border-accent hover:enabled:text-accent cursor-pointer font-body text-sm"
            >←</button>

            {pgNums(currentPage, totalPages).map((p, i) =>
              p === '…' ? (
                <span key={`e${i}`} className="text-muted text-sm px-1">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => goPage(p)}
                  className={`w-9 h-9 rounded-lg border text-sm flex items-center justify-center transition-all cursor-pointer font-body ${p === currentPage ? 'bg-accent border-accent text-ink font-bold' : 'border-border bg-transparent text-muted hover:border-accent hover:text-accent'}`}
                >{p}</button>
              )
            )}

            <button
              disabled={currentPage === totalPages}
              onClick={() => goPage(currentPage + 1)}
              className="w-9 h-9 rounded-lg border border-border bg-transparent text-muted flex items-center justify-center transition-all disabled:text-border disabled:cursor-not-allowed hover:enabled:border-accent hover:enabled:text-accent cursor-pointer font-body text-sm"
            >→</button>
          </div>

          <p className="text-center text-xs text-muted mt-2">
            Showing {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)} of {filtered.length} posts
          </p>
        </>
      )}

      <p className="mt-3 text-xs text-muted">
        Total: {blogs.length} post{blogs.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
