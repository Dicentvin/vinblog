// src/store/uiSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PublicPage, AdminPage, BlogsFilter } from '../types';

interface UiState {
  currentPage:      PublicPage;
  currentBlogId:    string | null;
  isAdmin:          boolean;
  adminPage:        AdminPage;
  adminSidebarOpen: boolean;
  blogsFilter:      BlogsFilter;
  homeCategory:     string;
  editBlogId:       string | null;
}

// ── Parse current URL hash into app state ─────────────────────────────────────
function parseHash(): Pick<UiState, 'currentPage' | 'currentBlogId' | 'isAdmin' | 'adminPage'> {
  if (typeof window === 'undefined') {
    return { currentPage: 'home', currentBlogId: null, isAdmin: false, adminPage: 'dashboard' };
  }

  const raw  = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();

  // #admin  or  #admin/blogs  #admin/create  #admin/comments
  if (raw === 'admin' || raw.startsWith('admin/')) {
    const sub = raw.split('/')[1];
    const adminPage: AdminPage =
      sub === 'blogs' || sub === 'create' || sub === 'comments' ? sub : 'dashboard';
    return { currentPage: 'home', currentBlogId: null, isAdmin: true, adminPage };
  }

  // #blog/SOME-UUID
  if (raw.startsWith('blog/')) {
    const blogId = decodeURIComponent(raw.slice(5));
    if (blogId) return { currentPage: 'blog', currentBlogId: blogId, isAdmin: false, adminPage: 'dashboard' };
  }

  const map: Record<string, PublicPage> = {
    blogs: 'blogs', about: 'about', contact: 'contact', home: 'home', '': 'home',
  };
  return {
    currentPage:   map[raw] ?? 'home',
    currentBlogId: null,
    isAdmin:       false,
    adminPage:     'dashboard',
  };
}

function writeHash(hash: string): void {
  if (typeof window === 'undefined') return;
  const next = hash ? `#${hash}` : '/';
  if (window.location.hash !== `#${hash}` && !(hash === '' && window.location.hash === '')) {
    window.history.pushState(null, '', next);
  }
}

// Boot from URL so refresh works
const boot = parseHash();

const initialState: UiState = {
  currentPage:      boot.currentPage,
  currentBlogId:    boot.currentBlogId,
  isAdmin:          boot.isAdmin,
  adminPage:        boot.adminPage,
  adminSidebarOpen: false,
  blogsFilter:      { search: '', category: 'all', tag: null, sort: 'newest', page: 1 },
  homeCategory:     'all',
  editBlogId:       null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    navigate(state, action: PayloadAction<{ page: PublicPage; blogId?: string }>) {
      state.currentPage      = action.payload.page;
      state.isAdmin          = false;
      state.adminSidebarOpen = false;
      if (action.payload.blogId !== undefined) state.currentBlogId = action.payload.blogId;

      if (action.payload.page === 'blog' && action.payload.blogId) {
        writeHash(`blog/${action.payload.blogId}`);
      } else if (action.payload.page === 'home') {
        writeHash('');
      } else {
        writeHash(action.payload.page);
      }
    },

    setIsAdmin(state, action: PayloadAction<boolean>) {
      state.isAdmin = action.payload;
      if (!action.payload) {
        state.currentPage = 'home';
        state.adminPage   = 'dashboard';
        writeHash('');
      } else {
        writeHash('admin');
      }
    },

    setAdminPage(state, action: PayloadAction<AdminPage>) {
      state.adminPage        = action.payload;
      state.adminSidebarOpen = false;
      writeHash(action.payload === 'dashboard' ? 'admin' : `admin/${action.payload}`);
    },

    // Called on browser back / forward
  syncFromUrl: (state): void => {
  const r = parseHash();

  state.currentPage = r.currentPage;
  state.currentBlogId = r.currentBlogId;
  state.isAdmin = r.isAdmin;
  state.adminPage = r.adminPage;
},

    toggleAdminSidebar(state)                              { state.adminSidebarOpen = !state.adminSidebarOpen; },
    setAdminSidebarOpen(state, a: PayloadAction<boolean>)  { state.adminSidebarOpen = a.payload; },
    setBlogsSearch(state, a: PayloadAction<string>)        { state.blogsFilter.search   = a.payload; state.blogsFilter.page = 1; },
    setBlogsCategory(state, a: PayloadAction<string>)      { state.blogsFilter.category = a.payload; state.blogsFilter.page = 1; },
    setBlogsTag(state, a: PayloadAction<string>)           { state.blogsFilter.tag = state.blogsFilter.tag === a.payload ? null : a.payload; state.blogsFilter.page = 1; },
    setBlogsSort(state, a: PayloadAction<BlogsFilter['sort']>) { state.blogsFilter.sort = a.payload; state.blogsFilter.page = 1; },
    setBlogsPage(state, a: PayloadAction<number>)          { state.blogsFilter.page = a.payload; },
    resetBlogsFilter(state)                                { state.blogsFilter = { search: '', category: 'all', tag: null, sort: 'newest', page: 1 }; },
    setHomeCategory(state, a: PayloadAction<string>)       { state.homeCategory = a.payload; },
    setEditBlogId(state, a: PayloadAction<string | null>)  { state.editBlogId = a.payload; },
  },
});

export const {
  navigate, setIsAdmin, setAdminPage, syncFromUrl,
  toggleAdminSidebar, setAdminSidebarOpen,
  setBlogsSearch, setBlogsCategory, setBlogsTag, setBlogsSort, setBlogsPage,
  resetBlogsFilter, setHomeCategory, setEditBlogId,
} = uiSlice.actions;

export const selectCurrentPage   = (s: { ui: UiState }) => s.ui.currentPage;
export const selectCurrentBlogId = (s: { ui: UiState }) => s.ui.currentBlogId;
export const selectIsAdmin       = (s: { ui: UiState }) => s.ui.isAdmin;
export const selectAdminPage     = (s: { ui: UiState }) => s.ui.adminPage;
export const selectAdminSidebar  = (s: { ui: UiState }) => s.ui.adminSidebarOpen;
export const selectBlogsFilter   = (s: { ui: UiState }) => s.ui.blogsFilter;
export const selectHomeCategory  = (s: { ui: UiState }) => s.ui.homeCategory;
export const selectEditBlogId    = (s: { ui: UiState }) => s.ui.editBlogId;

export default uiSlice.reducer;
