import { getApiBaseUrl, getPageContext, getReactionByEmoji } from '../lib/reactions';

export interface SessionUser {
  username: string;
}

export interface EmojiBreakdownItem {
  emoji: string;
  emotionLabel: string;
  sentimentScore: number;
  count: number;
  percentage?: number;
}

export interface TimelinePoint {
  day: string;
  count: number;
  averageSentiment: number;
}

export interface PostStatsItem {
  postUrl: string;
  postPath: string;
  postTitle: string;
  postId?: string | null;
  totalReactions: number;
  averageSentiment: number;
  positiveReactions: number;
  neutralReactions: number;
  negativeReactions: number;
  lastReactionAt: string;
}

export interface OverviewResponse {
  summary: {
    totalReactions: number;
    trackedPosts: number;
    averageSentiment: number;
    positiveRate: number;
  };
  emojiBreakdown: EmojiBreakdownItem[];
  timeline: TimelinePoint[];
  topPosts: PostStatsItem[];
  bestPosts: PostStatsItem[];
  worstPosts: PostStatsItem[];
}

export interface PostDetailResponse {
  summary: PostStatsItem;
  emojiBreakdown: EmojiBreakdownItem[];
  timeline: TimelinePoint[];
}

export interface DateRangeFilters {
  dateFrom?: string;
  dateTo?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || 'Falha na requisicao.');
  }

  return response.json() as Promise<T>;
}

export async function submitReaction(emoji: string, postId?: string) {
  const reaction = getReactionByEmoji(emoji);
  if (!reaction) {
    throw new Error('Emoji invalido.');
  }

  return request<{ success: boolean }>('/reactions', {
    method: 'POST',
    body: JSON.stringify({
      emoji: reaction.emoji,
      emotionLabel: reaction.label,
      sentimentScore: reaction.score,
      ...getPageContext(postId),
    }),
  });
}

export async function login(username: string, password: string) {
  return request<{ success: boolean; user: SessionUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function logout() {
  return request<{ success: boolean }>('/auth/logout', {
    method: 'POST',
  });
}

export async function getSession() {
  return request<{ authenticated: boolean; user: SessionUser }>('/auth/session');
}

export async function getOverview() {
  return request<OverviewResponse>('/stats/overview');
}

export async function getOverviewWithFilters(filters: DateRangeFilters = {}) {
  const searchParams = new URLSearchParams();
  if (filters.dateFrom) {
    searchParams.set('dateFrom', filters.dateFrom);
  }
  if (filters.dateTo) {
    searchParams.set('dateTo', filters.dateTo);
  }

  const query = searchParams.toString();
  return request<OverviewResponse>(`/stats/overview${query ? `?${query}` : ''}`);
}

export async function getPosts(search = '', filters: DateRangeFilters = {}) {
  const searchParams = new URLSearchParams();
  if (search) {
    searchParams.set('search', search);
  }
  if (filters.dateFrom) {
    searchParams.set('dateFrom', filters.dateFrom);
  }
  if (filters.dateTo) {
    searchParams.set('dateTo', filters.dateTo);
  }

  const query = searchParams.toString();
  return request<{ posts: PostStatsItem[] }>(`/stats/posts${query ? `?${query}` : ''}`);
}

export async function getPostDetail(params: { url?: string; path?: string } & DateRangeFilters) {
  const searchParams = new URLSearchParams();
  if (params.url) {
    searchParams.set('url', params.url);
  }
  if (params.path) {
    searchParams.set('path', params.path);
  }
  if (params.dateFrom) {
    searchParams.set('dateFrom', params.dateFrom);
  }
  if (params.dateTo) {
    searchParams.set('dateTo', params.dateTo);
  }

  return request<PostDetailResponse>(`/stats/post?${searchParams.toString()}`);
}

function escapeCsvValue(value: string | number | null | undefined) {
  const normalized = String(value ?? '');
  return `"${normalized.replaceAll('"', '""')}"`;
}

export function downloadPostsCsv(posts: PostStatsItem[], filename = 'kitty-chat-posts.csv') {
  const header = [
    'titulo',
    'path',
    'url',
    'reacoes',
    'sentimento_medio',
    'positivas',
    'neutras',
    'negativas',
    'ultima_reacao',
  ];

  const rows = posts.map((post) =>
    [
      post.postTitle,
      post.postPath,
      post.postUrl,
      post.totalReactions,
      post.averageSentiment.toFixed(2),
      post.positiveReactions,
      post.neutralReactions,
      post.negativeReactions,
      post.lastReactionAt,
    ]
      .map(escapeCsvValue)
      .join(',')
  );

  const blob = new Blob([[header.join(','), ...rows].join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
