export interface ReactionOption {
  emoji: string;
  label: string;
  score: number;
}

export const reactionOptions: ReactionOption[] = [
  { emoji: '😭', label: 'Muito ruim', score: -2 },
  { emoji: '😕', label: 'Ruim', score: -1 },
  { emoji: '😐', label: 'Ok', score: 0 },
  { emoji: '😊', label: 'Bom', score: 1 },
  { emoji: '🤩', label: 'Excelente', score: 2 },
];

export function getReactionByEmoji(emoji: string) {
  return reactionOptions.find((reaction) => reaction.emoji === emoji) ?? null;
}

export function getAppBasePath(pathname = window.location.pathname) {
  return pathname.startsWith('/kitty-chat') ? '/kitty-chat' : '';
}

export function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (fromEnv) {
    return fromEnv;
  }

  return `${getAppBasePath()}/api`;
}

export function getPublicAppUrl() {
  const fromEnv = import.meta.env.VITE_PUBLIC_APP_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  return `${window.location.origin}${getAppBasePath()}`.replace(/\/$/, '');
}

export function getPageContext(postId?: string) {
  return {
    postUrl: window.location.href,
    postPath: window.location.pathname,
    postTitle: document.title,
    postId: postId?.trim() || undefined,
  };
}
