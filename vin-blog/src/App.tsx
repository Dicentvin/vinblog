import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './hooks';
import {
  selectCurrentPage, selectIsAdmin, selectAdminPage,
  selectCurrentBlogId, syncFromUrl,
} from './store/uiSlice';
import BlogLayout      from './components/layout/BlogLayout';
import AdminLayout     from './components/layout/AdminLayout';
import AdminLogin      from './components/auth/AdminLogin';
import HomePage        from './pages/HomePage';
import BlogsPage       from './pages/BlogsPage';
import BlogPostPage    from './pages/BlogPostPage';
import AboutPage       from './pages/AboutPage';
import ContactPage     from './pages/ContactPage';
import AdminDashboard  from './pages/admin/AdminDashboard';
import AdminBlogs      from './pages/admin/AdminBlogs';
import AdminCreateBlog from './pages/admin/AdminCreateBlog';
import AdminComments   from './pages/admin/AdminComments';

export default function App(): JSX.Element {
  const dispatch      = useAppDispatch();
  const currentPage   = useAppSelector(selectCurrentPage);
  const isAdmin       = useAppSelector(selectIsAdmin);
  const adminPage     = useAppSelector(selectAdminPage);
  const currentBlogId = useAppSelector(selectCurrentBlogId);

  // localStorage persists across F5 refresh — sessionStorage does NOT
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => localStorage.getItem('skylimits_admin') === 'true'
  );

  // Sync Redux state on browser back/forward
  useEffect(() => {
    const onPop = (): void => dispatch(syncFromUrl());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [dispatch]);

  const handleSuccess = (): void => {
    localStorage.setItem('skylimits_admin', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = (): void => {
    localStorage.removeItem('skylimits_admin');
    setIsAuthenticated(false);
  };

  // ── Admin ──────────────────────────────────────────────────────────────────
  if (isAdmin) {
    if (!isAuthenticated) {
      return <AdminLogin onSuccess={handleSuccess} />;
    }
    return (
      <AdminLayout onLogout={handleLogout}>
        {adminPage === 'dashboard' && <AdminDashboard />}
        {adminPage === 'blogs'     && <AdminBlogs />}
        {adminPage === 'create'    && <AdminCreateBlog />}
        {adminPage === 'comments'  && <AdminComments />}
      </AdminLayout>
    );
  }

  // ── Public ─────────────────────────────────────────────────────────────────
  return (
    <BlogLayout>
      {currentPage === 'home'    && <HomePage />}
      {currentPage === 'blogs'   && <BlogsPage />}
      {currentPage === 'blog'    && <BlogPostPage blogId={currentBlogId ?? ''} />}
      {currentPage === 'about'   && <AboutPage />}
      {currentPage === 'contact' && <ContactPage />}
    </BlogLayout>
  );
}
