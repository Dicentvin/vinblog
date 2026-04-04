import { useState } from 'react';
import { useAppSelector } from './hooks';
import { selectCurrentPage, selectIsAdmin, selectAdminPage, selectCurrentBlogId } from './store/uiSlice';
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
  const currentPage   = useAppSelector(selectCurrentPage);
  const isAdmin       = useAppSelector(selectIsAdmin);
  const adminPage     = useAppSelector(selectAdminPage);
  const currentBlogId = useAppSelector(selectCurrentBlogId);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => sessionStorage.getItem('bytescribe_admin') === 'true'
  );

  // ── Admin section ─────────────────────────────────────────────────────────
  if (isAdmin) {
    if (!isAuthenticated) {
      return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
    }
    return (
      <AdminLayout>
        {adminPage === 'dashboard' && <AdminDashboard />}
        {adminPage === 'blogs'     && <AdminBlogs />}
        {adminPage === 'create'    && <AdminCreateBlog />}
        {adminPage === 'comments'  && <AdminComments />}
      </AdminLayout>
    );
  }

  // ── Public section ────────────────────────────────────────────────────────
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
