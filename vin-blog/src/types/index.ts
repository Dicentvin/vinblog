// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface Author {
  name:  string;
  image: string;
  bio:   string;
}

export interface Comment {
  id:        string;
  blogId?:   string;
  author:    string;
  avatar?:   string;
  content:   string;
  createdAt: string;
  likes:     number;
}

export interface ContentBlock {
  id:       string;
  type:     'text' | 'image';
  content?: string;
  url?:     string;
  caption?: string;
}

export interface Blog {
  id:            string;
  title:         string;
  description:   string;
  image:         string;
  imageFileId?:  string;
  content:       string;
  contentBlocks?: ContentBlock[];
  category:      string;
  tags:          string[];
  author:        Author;
  authorName?:   string;
  authorImage?:  string;
  authorBio?:    string;
  minsRead:      number;
  publishedAt:   string;
  featured:      boolean;
  views:         number;
  likes:         number;
  status?:       'draft' | 'published';
  comments:      Comment[];
}

export interface BlogsResponse {
  data:  Blog[];
  total: number;
}

export interface AdminStats {
  totalBlogs:       number;
  totalViews:       number;
  totalComments:    number;
  totalSubscribers: number;
}

export interface AiAssistRequest {
  type:     'write' | 'fix' | 'format' | 'seo';
  content?: string;
  title?:   string;
}

export interface SeoResult {
  score:             number;
  title_suggestion?: string;
  meta_description?: string;
  keywords?:         string[];
  tips?:             string[];
}

export interface AiAssistResponse {
  requestId: string;
  status:    'processing' | 'done' | 'failed';
  result?:   string;
}

export interface AiPollResponse {
  id:     string;
  type:   string;
  status: 'pending' | 'done' | 'failed';
  result: string | null;
}

export interface UploadResponse {
  url:    string;
  fileId: string;
  name:   string;
}

export interface SubscribeResponse {
  success:     boolean;
  message?:    string;
  subscriber?: { email: string };
}

// ─── UI Types ─────────────────────────────────────────────────────────────────

export type PublicPage = 'home' | 'blogs' | 'blog';
export type AdminPage  = 'dashboard' | 'blogs' | 'create' | 'comments';

export interface BlogsFilter {
  search:   string;
  category: string;
  tag:      string | null;
  sort:     'newest' | 'popular' | 'mostread';
  page:     number;
}

export interface Category {
  id:     string;
  name:   string;
  color:  string;
  count?: number;
}

export interface CreateBlogPayload {
  title:         string;
  description:   string;
  image:         string;
  imageFileId?:  string;
  content:       string;
  contentBlocks?: ContentBlock[];
  category:      string;
  tags:          string[];
  authorName:    string;
  authorImage?:  string;
  authorBio?:    string;
  minsRead:      number;
  status:        'draft' | 'published';
}
