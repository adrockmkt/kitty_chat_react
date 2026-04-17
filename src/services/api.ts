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

export async function getPosts(search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return request<{ posts: PostStatsItem[] }>(`/stats/posts${query}`);
}

export async function getPostDetail(params: { url?: string; path?: string }) {
  const searchParams = new URLSearchParams();
  if (params.url) {
    searchParams.set('url', params.url);
  }
  if (params.path) {
    searchParams.set('path', params.path);
  }

  return request<PostDetailResponse>(`/stats/post?${searchParams.toString()}`);
}
