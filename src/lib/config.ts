const normalizeBaseUrl = (url: string) => url.replace(/\/$/, '');

const DEFAULT_BACKEND_URL = 'http://127.0.0.1:3002';

export const SOCKET_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_SOCKET_URL || DEFAULT_BACKEND_URL
);

export const API_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_URL || SOCKET_URL
);
