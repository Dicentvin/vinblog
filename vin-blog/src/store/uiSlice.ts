import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PublicPage, AdminPage, BlogsFilter } from '../types';

interface UiState {
  currentPage:       PublicPage;
  currentBlogId:     string | null;
  isAdmin:           boolean;
  adminPage:         AdminPage;
  adminSidebarOpen:  boolean;
  blogsFilter:       BlogsFilter;
  homeCategory:      string;
  editBlogId:        string | null;
}

const initialState: UiState = {
  currentPage:      'home',
  currentBlogId:    null,
  isAdmin:          false,
  adminPage:        'dashboard',
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
      state.currentPage = action.payload.page;
      if (action.payload.blogId !== undefined) state.currentBlogId = action.payload.blogId;
      state.adminSidebarOpen = false;
    },
    setIsAdmin(state, action: PayloadAction<boolean>) {
      state.isAdmin = action.payload;
      if (!action.payload) { state.currentPage = 'home'; state.adminPage = 'dashboard'; }
    },
    setAdminPage(state, action: PayloadAction<AdminPage>) {
      state.adminPage        = action.payload;
      state.adminSidebarOpen = false;
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
  navigate, setIsAdmin, setAdminPage,
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
