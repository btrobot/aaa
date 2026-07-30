const store = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  maxRequests: number;   // 最大请求数
  windowMs: number;      // 时间窗口 (毫秒)
}

const defaults: RateLimitConfig = {
  maxRequests: 60,
  windowMs: 60_000, // 1 minute
};

export function rateLimit(key: string, config: Partial<RateLimitConfig> = {}) {
  const { maxRequests, windowMs } = { ...defaults, ...config };
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60_000);
}

export function rateLimitMiddleware(request: Request, config?: Partial<RateLimitConfig>) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  const route = new URL(request.url).pathname;
  const key = `${ip}:${route}`;
  return rateLimit(key, config);
}