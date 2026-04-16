/**
 * router.ts — URL-based routing for SkyLimits
 *
 * Maps URL hash/params → app state, and app state → URL.
 * This fixes the "refresh goes to home page" problem entirely.
 *
 * URL scheme:
 *   /                       → home
 *   /#blogs                 → blogs page
 *   /#blog/{id}             → single blog post
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

/** Read current URL hash and return the matching route state */
export function parseRoute(): RouteState {
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

  // Single blog
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

  const newHash = hash ? `#${hash}` : window.location.pathname;
  if (window.location.hash !== `#${hash}`) {
    window.history.pushState(null, '', newHash || '/');
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
