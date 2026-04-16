import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Blog, Comment, BlogsResponse, AdminStats } from '../types';

// ── Base URL ──────────────────────────────────────────────────────────────────
// In production on Vercel: VITE_API_URL is empty → uses relative /api/...
// In development: set VITE_API_URL=http://localhost:3001 in frontend/.env
const BASE_URL = (import.meta.env.VITE_API_URL as string) || '';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface GetBlogsArgs {
  search?:   string;
  category?: string;
  page?:     number;
  limit?:    number;
  sort?:     'newest' | 'popular' | 'mostread';
  status?:   string;
}

export interface UpdateBlogArgs {
  id:           string;
  title?:       string;
  description?: string;
  content?:     string;
  image?:       string;
  imageFileId?: string;
  category?:    string;
  tags?:        string[];
  authorName?:  string;
  authorImage?: string;
  authorBio?:   string;
  minsRead?:    number;
  featured?:    boolean;
  status?:      'draft' | 'published';
}

export interface CreateBlogPayload {
  title:        string;
  description?: string;
  content?:     string;
  image?:       string;
  imageFileId?: string;
  category:     string;
  tags?:        string[];
  authorName?:  string;
  authorImage?: string;
  authorBio?:   string;
  minsRead?:    number;
  featured?:    boolean;
  status?:      'draft' | 'published';
}

// ── API slice ─────────────────────────────────────────────────────────────────
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery:   fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes:    ['Blog', 'Comment', 'Stats'],
  endpoints:   builder => ({

    // ── Blogs ───────────────────────────────────────────────────────────────
    getBlogs: builder.query<BlogsResponse, GetBlogsArgs>({
      query: ({ search = '', category = '', page = 1, limit = 8, sort = 'newest', status } = {}) => {
        const offset = (page - 1) * limit;
        const params = new URLSearchParams();
        if (search)   params.set('search',   search);
        if (category) params.set('category', category);
        if (sort)     params.set('sort',     sort);
        if (status)   params.set('status',   status);
        params.set('limit',  String(limit));
        params.set('offset', String(offset));
        return `/api/blogs?${params.toString()}`;
      },
      providesTags: ['Blog'],
    }),

    getBlogById: builder.query<Blog, string>({
      query: id => `/api/blogs/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Blog', id }],
    }),

    createBlog: builder.mutation<Blog, CreateBlogPayload>({
      query: body => ({ url: '/api/blogs', method: 'POST', body }),
      invalidatesTags: ['Blog', 'Stats'],
    }),

    updateBlog: builder.mutation<Blog, UpdateBlogArgs>({
      query: ({ id, ...body }) => ({ url: `/api/blogs/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Blog', id }, 'Blog'],
    }),

    deleteBlog: builder.mutation<{ success: boolean }, string>({
      query: id => ({ url: `/api/blogs/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Blog', 'Stats'],
    }),

    likeBlog: builder.mutation<{ success: boolean }, string>({
      query: id => ({ url: `/api/blogs/${id}/like`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Blog', id }],
    }),

    trackView: builder.mutation<{ success: boolean }, string>({
      query: id => ({ url: `/api/blogs/${id}/view`, method: 'POST' }),
    }),

    // ── Comments ─────────────────────────────────────────────────────────────
    getAllComments: builder.query<Comment[], void>({
      query: () => '/api/comments',
      providesTags: ['Comment'],
    }),

    addComment: builder.mutation<Comment, { blogId: string; author: string; content: string }>({
      query: ({ blogId, ...body }) => ({ url: `/api/blogs/${blogId}/comments`, method: 'POST', body }),
      invalidatesTags: ['Comment', 'Blog'],
    }),

    deleteComment: builder.mutation<{ success: boolean }, string>({
      query: id => ({ url: `/api/comments/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Comment'],
    }),

    likeComment: builder.mutation<{ success: boolean }, string>({
      query: id => ({ url: `/api/comments/${id}/like`, method: 'POST' }),
      invalidatesTags: ['Comment'],
    }),

    // ── Newsletter ────────────────────────────────────────────────────────────
    subscribe: builder.mutation<{ success: boolean }, string>({
      query: email => ({ url: '/api/newsletter/subscribe', method: 'POST', body: { email } }),
    }),

    // ── Image Upload ──────────────────────────────────────────────────────────
    uploadImage: builder.mutation<{ url: string; fileId: string; name: string }, FormData>({
      query: formData => ({
        url:  '/api/upload',
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type — browser sets it with boundary for multipart
        formData: true,
      }),
    }),

    // ── AI Assistant ──────────────────────────────────────────────────────────
    aiAssist: builder.mutation<{ requestId: string; status: string; result?: string }, { type: string; content?: string; title?: string }>({
      query: body => ({ url: '/api/ai/assist', method: 'POST', body }),
    }),

    getAiResult: builder.query<{ id: string; status: string; result?: string; type: string }, string>({
      query: requestId => `/api/ai/result/${requestId}`,
    }),

    // ── Admin ─────────────────────────────────────────────────────────────────
    getAdminStats: builder.query<AdminStats, void>({
      query: () => '/api/admin/stats',
      providesTags: ['Stats'],
    }),

    adminLogin: builder.mutation<{ success: boolean }, { username: string; password: string }>({
      query: body => ({ url: '/api/admin/login', method: 'POST', body }),
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetBlogByIdQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useLikeBlogMutation,
  useTrackViewMutation,
  useGetAllCommentsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useSubscribeMutation,
  useUploadImageMutation,
  useAiAssistMutation,
  useGetAiResultQuery,
  useGetAdminStatsQuery,
  useAdminLoginMutation,
} = apiSlice;
