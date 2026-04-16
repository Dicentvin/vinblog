/**
 * router.ts — URL-based routing for SkyLimits
 *
 * URL scheme:
 *   /                       → home
 *   /#blogs                 → blogs page
 *   /#blog/{id}             → single blog post
 *   /?blog={id}             → single blog post (social share links from og.js)
 *   /#about                 → about page
 *   /#contact               → contact page
 *   /#admin                 → admin panel (dashboard)
 *   /#admin/blogs           → admin blogs
 *   /#admin/create          → admin create
 *   /#admin/comments        → admin comments
 */

import type { PublicPage, AdminPage } from './types';

export interface RouteState {
  isAdmin:   boolean;
  adminPage: AdminPage;
  page:      PublicPage;
  blogId:    string | null;
}

/** Read current URL (hash + query params) and return the matching route state */
export function parseRoute(): RouteState {
  // ── Check ?blog=ID query param first (used by social share / og.js links) ──
  const searchParams = new URLSearchParams(window.location.search);
  const queryBlogId  = searchParams.get('blog');

  if (queryBlogId) {
    // Rewrite the URL to the canonical hash format so the address bar
    // stays clean and refreshes keep working, without adding a history entry.
    window.history.replaceState(null, '', `/#blog/${queryBlogId}`);
    return { isAdmin: false, adminPage: 'dashboard', page: 'blog', blogId: queryBlogId };
  }

  // ── Hash-based routing ────────────────────────────────────────────────────
  const hash = window.location.hash.replace('#', '').toLowerCase();

  // Admin routes
  if (hash.startsWith('admin')) {
    const sub = hash.split('/')[1] as AdminPage | undefined;
    const adminPage: AdminPage =
      sub === 'blogs' || sub === 'create' || sub === 'comments'
        ? sub
        : 'dashboard';
    return { isAdmin: true, adminPage, page: 'home', blogId: null };
  }

  // Single blog post  /#blog/{id}
  if (hash.startsWith('blog/')) {
    const blogId = hash.replace('blog/', '');
    return { isAdmin: false, adminPage: 'dashboard', page: 'blog', blogId: blogId || null };
  }

  // Public pages
  const pageMap: Record<string, PublicPage> = {
    blogs:   'blogs',
    about:   'about',
    contact: 'contact',
    home:    'home',
    '':      'home',
  };

  const page = pageMap[hash] ?? 'home';
  return { isAdmin: false, adminPage: 'dashboard', page, blogId: null };
}

/** Push a new URL hash without reloading */
export function pushRoute(state: Partial<RouteState> & { page?: PublicPage; blogId?: string | null }): void {
  let hash = '';

  if (state.isAdmin) {
    const sub = state.adminPage ?? 'dashboard';
    hash = sub === 'dashboard' ? 'admin' : `admin/${sub}`;
  } else if (state.page === 'blog' && state.blogId) {
    hash = `blog/${state.blogId}`;
  } else if (state.page && state.page !== 'home') {
    hash = state.page;
  }

  const newHash = hash ? `#${hash}` : '/';
  if (window.location.hash !== `#${hash}`) {
    window.history.pushState(null, '', newHash);
  }
}

/** Replace current URL hash without adding to browser history */
export function replaceRoute(state: Partial<RouteState>): void {
  let hash = '';

  if (state.isAdmin) {
    const sub = state.adminPage ?? 'dashboard';
    hash = sub === 'dashboard' ? 'admin' : `admin/${sub}`;
  } else if (state.page === 'blog' && state.blogId) {
    hash = `blog/${state.blogId}`;
  } else if (state.page && state.page !== 'home') {
    hash = state.page;
  }

  window.history.replaceState(null, '', hash ? `#${hash}` : '/');
}
