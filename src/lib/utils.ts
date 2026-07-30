import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 为 GET 响应添加缓存控制头 */
export function cacheResponse(
  response: Response,
  options: { public?: boolean; maxAge?: number; staleWhileRevalidate?: number } = {}
): Response {
  const { public: isPublic = true, maxAge = 60, staleWhileRevalidate = 300 } = options;
  const headers = new Headers(response.headers);
  headers.set(
    'Cache-Control',
    `${isPublic ? 'public' : 'private'}, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}