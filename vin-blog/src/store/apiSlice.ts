import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Blog, BlogsResponse, Comment, AdminStats,
  AiAssistRequest, AiAssistResponse, AiPollResponse,
  UploadResponse, SubscribeResponse, CreateBlogPayload,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export interface GetBlogsArgs {
  search?:   string;
  category?: string;
  page?:     number;
  limit?:    number;
  sort?:     string;
}

export interface AddCommentArgs {
  blogId:  string;
  author:  string;
  content: string;
}

export interface UpdateBlogArgs {
  id:           string;
  title?:       string;
  description?: string;
  category?:    string;
  tags?:        string[];
  minsRead?:    number;
  status?:      string;
  featured?:    boolean;
  image?:       string;
  imageFileId?: string;
  content?:     string;
}

export interface AdminLoginArgs {
  username: string;
  password: string;
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery:   fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes:    ['Blog', 'Comment', 'Stats', 'AiResult'] as const,

  endpoints: (builder) => ({

    // ── Blogs ──────────────────────────────────────────────────────────────────

    getBlogs: builder.query<BlogsResponse, GetBlogsArgs>({
      query: (args: GetBlogsArgs = {}) => {
        const { search = '', category = '', page = 1, limit = 8, sort = 'newest' } = args;
        const p = new URLSearchParams();
        if (search)   p.set('search',   search);
        if (category) p.set('category', category);
        p.set('sort',   sort);
        p.set('limit',  String(limit));
        p.set('offset', String((page - 1) * limit));
        return `/api/blogs?${p.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Blog' as const, id })),
              { type: 'Blog' as const, id: 'LIST' },
            ]
          : [{ type: 'Blog' as const, id: 'LIST' }],
    }),

    getBlogById: builder.query<Blog, string>({
      query:        (id: string) => `/api/blogs/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Blog' as const, id }],
    }),

    createBlog: builder.mutation<Blog, CreateBlogPayload>({
      query:           (body: CreateBlogPayload) => ({ url: '/api/blogs', method: 'POST', body }),
      invalidatesTags: [{ type: 'Blog' as const, id: 'LIST' }, 'Stats'],
    }),

    // updateBlog uses a dedicated interface — no inline destructuring
    updateBlog: builder.mutation<Blog, UpdateBlogArgs>({
      query: (args: UpdateBlogArgs) => {
        const { id, ...body } = args;
        return { url: `/api/blogs/${id}`, method: 'PATCH', body };
      },
      invalidatesTags: (_r, _e, args) => [
        { type: 'Blog' as const, id: args.id },
        { type: 'Blog' as const, id: 'LIST' },
      ],
    }),

    deleteBlog: builder.mutation<{ success: boolean }, string>({
      query:           (id: string) => ({ url: `/api/blogs/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Blog' as const, id: 'LIST' }, 'Stats'],
    }),

    likeBlog: builder.mutation<{ success: boolean }, string>({
      query:           (id: string) => ({ url: `/api/blogs/${id}/like`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Blog' as const, id }],
    }),

    trackView: builder.mutation<{ success: boolean }, string>({
      query: (id: string) => ({ url: `/api/blogs/${id}/view`, method: 'POST' }),
    }),

    // ── Comments ───────────────────────────────────────────────────────────────

    getAllComments: builder.query<Comment[], void>({
      query:        () => '/api/comments',
      providesTags: ['Comment'],
    }),

    addComment: builder.mutation<Comment, AddCommentArgs>({
      query: (args: AddCommentArgs) => ({
        url:    `/api/blogs/${args.blogId}/comments`,
        method: 'POST',
        body:   { author: args.author, content: args.content },
      }),
      invalidatesTags: (_r, _e, args) => [
        { type: 'Blog' as const, id: args.blogId },
        'Comment',
      ],
    }),

    deleteComment: builder.mutation<{ success: boolean }, string>({
      query:           (id: string) => ({ url: `/api/comments/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Comment', { type: 'Blog' as const, id: 'LIST' }],
    }),

    likeComment: builder.mutation<{ success: boolean }, string>({
      query:           (id: string) => ({ url: `/api/comments/${id}/like`, method: 'POST' }),
      invalidatesTags: ['Comment'],
    }),

    // ── Newsletter ─────────────────────────────────────────────────────────────

    subscribe: builder.mutation<SubscribeResponse, string>({
      query: (email: string) => ({
        url:    '/api/newsletter/subscribe',
        method: 'POST',
        body:   { email },
      }),
    }),

    // ── Image Upload ───────────────────────────────────────────────────────────

    uploadImage: builder.mutation<UploadResponse, FormData>({
      query: (formData: FormData) => ({
        url:    '/api/upload',
        method: 'POST',
        body:   formData,
      }),
    }),

    // ── AI (Gemini via Inngest) ────────────────────────────────────────────────

    aiAssist: builder.mutation<AiAssistResponse, AiAssistRequest>({
      query:           (body: AiAssistRequest) => ({ url: '/api/ai/assist', method: 'POST', body }),
      invalidatesTags: ['AiResult'],
    }),

    getAiResult: builder.query<AiPollResponse, string>({
      query:        (requestId: string) => `/api/ai/result/${requestId}`,
      providesTags: ['AiResult'],
    }),

    // ── Admin Stats ────────────────────────────────────────────────────────────

    getAdminStats: builder.query<AdminStats, void>({
      query:        () => '/api/admin/stats',
      providesTags: ['Stats'],
    }),

    // ── Admin Login ────────────────────────────────────────────────────────────

    adminLogin: builder.mutation<{ success: boolean; message: string }, AdminLoginArgs>({
      query: (body: AdminLoginArgs) => ({
        url:    '/api/admin/login',
        method: 'POST',
        body,
      }),
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
} = api;
