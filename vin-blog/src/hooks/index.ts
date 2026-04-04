import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import type { AdminPage, BlogsFilter } from '../types';
import {
  navigate as navAction, setIsAdmin, setAdminPage,
  toggleAdminSidebar, setAdminSidebarOpen,
  setBlogsSearch, setBlogsCategory, setBlogsTag,
  setBlogsSort, setBlogsPage, resetBlogsFilter,
  setHomeCategory, setEditBlogId,
  selectCurrentPage, selectCurrentBlogId,
  selectIsAdmin, selectAdminPage, selectAdminSidebar,
  selectBlogsFilter, selectHomeCategory, selectEditBlogId,
} from '../store/uiSlice';

export const useAppDispatch: () => AppDispatch                     = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState>       = useSelector;

export function useNav() {
  const dispatch      = useAppDispatch();
  const currentPage   = useAppSelector(selectCurrentPage);
  const currentBlogId = useAppSelector(selectCurrentBlogId);
  const isAdmin       = useAppSelector(selectIsAdmin);
  const adminPage     = useAppSelector(selectAdminPage);

  const navigate = (page: Parameters<typeof navAction>[0]['page'], blogId?: string): void => {
    dispatch(navAction({ page, blogId }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goAdmin = (page: AdminPage = 'dashboard'): void => {
    dispatch(setIsAdmin(true));
    dispatch(setAdminPage(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const exitAdmin       = (): void => { dispatch(setIsAdmin(false)); navigate('home'); };
  const switchAdminPage = (page: AdminPage): void => { dispatch(setAdminPage(page)); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return { navigate, goAdmin, exitAdmin, switchAdminPage, currentPage, currentBlogId, isAdmin, adminPage };
}

export function useAdminSidebar() {
  const dispatch = useAppDispatch();
  const open     = useAppSelector(selectAdminSidebar);
  return {
    open,
    toggle: (): void => { dispatch(toggleAdminSidebar()); },
    close:  (): void => { dispatch(setAdminSidebarOpen(false)); },
    show:   (): void => { dispatch(setAdminSidebarOpen(true)); },
  };
}

export function useBlogsFilter() {
  const dispatch = useAppDispatch();
  const filter   = useAppSelector(selectBlogsFilter);
  return {
    filter,
    setSearch:   (v: string): void               => { dispatch(setBlogsSearch(v));   },
    setCategory: (v: string): void               => { dispatch(setBlogsCategory(v)); },
    toggleTag:   (v: string): void               => { dispatch(setBlogsTag(v));      },
    setSort:     (v: BlogsFilter['sort']): void  => { dispatch(setBlogsSort(v));     },
    setPage:     (v: number): void               => { dispatch(setBlogsPage(v));     },
    reset:       (): void                        => { dispatch(resetBlogsFilter());  },
  };
}

export function useHomeCategory() {
  const dispatch     = useAppDispatch();
  const homeCategory = useAppSelector(selectHomeCategory);
  return {
    homeCategory,
    setHomeCategory: (v: string): void => { dispatch(setHomeCategory(v)); },
  };
}

export function useEditBlog() {
  const dispatch   = useAppDispatch();
  const editBlogId = useAppSelector(selectEditBlogId);
  return {
    editBlogId,
    setEditBlogId: (id: string | null): void => { dispatch(setEditBlogId(id)); },
  };
}
