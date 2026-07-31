// ============================================================
// Rate Limit 存储接口
// 支持内存和 Redis 两种存储后端
// ============================================================

interface RateLimitStore {
  get(key: string): Promise<{ count: number; resetAt: number } | null>;
  set(key: string, value: { count: number; resetAt: number }, ttlMs: number): Promise<void>;
  cleanup(): Promise<void>;
}

// ============================================================
// 内存存储实现（开发环境/单实例部署）
// ============================================================
class MemoryStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetAt: number }>();

  async get(key: string): Promise<{ count: number; resetAt: number } | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, value: { count: number; resetAt: number }, _ttlMs: number): Promise<void> {
    this.store.set(key, value);
  }

  async cleanup(): Promise<void> {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.resetAt) {
        this.store.delete(key);
      }
    }
  }
}

// ============================================================
// Redis 存储实现（生产环境/多实例部署）
// ============================================================
class RedisStore implements RateLimitStore {
  private client: any;

  constructor(redisUrl?: string) {
    // 延迟加载 Redis 客户端，避免在不需要时引入依赖
    if (typeof require !== 'undefined') {
      try {
        // 使用动态导入，支持 CommonJS 和 ES Module
        const Redis = require('ioredis');
        this.client = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379');
      } catch (err) {
        console.warn('[RateLimit] Redis not available, falling back to memory store');
        throw err;
      }
    }
  }

  async get(key: string): Promise<{ count: number; resetAt: number } | null> {
    const data = await this.client.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async set(key: string, value: { count: number; resetAt: number }, ttlMs: number): Promise<void> {
    const ttlSeconds = Math.ceil(ttlMs / 1000);
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async cleanup(): Promise<void> {
    // Redis 自动处理过期，无需手动清理
  }
}

// ============================================================
// 存储工厂
// ============================================================
function createStore(): RateLimitStore {
  const storeType = process.env.RATE_LIMIT_STORE || 'memory';

  if (storeType === 'redis') {
    try {
      return new RedisStore();
    } catch {
      console.warn('[RateLimit] Failed to initialize Redis, using memory store');
      return new MemoryStore();
    }
  }

  return new MemoryStore();
}

// 单例存储实例
const store = createStore();

// ============================================================
// Rate Limit 核心逻辑
// ============================================================
interface RateLimitConfig {
  maxRequests: number;   // 最大请求数
  windowMs: number;      // 时间窗口 (毫秒)
}

const defaults: RateLimitConfig = {
  maxRequests: 60,
  windowMs: 60_000, // 1 minute
};

export async function rateLimit(key: string, config: Partial<RateLimitConfig> = {}) {
  const { maxRequests, windowMs } = { ...defaults, ...config };
  const now = Date.now();
  const entry = await store.get(key);

  if (!entry || now > entry.resetAt) {
    const newEntry = { count: 1, resetAt: now + windowMs };
    await store.set(key, newEntry, windowMs);
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  await store.set(key, entry, windowMs - (now - (entry.resetAt - windowMs)));
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

// 定期清理过期条目（仅内存存储需要）
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    store.cleanup().catch(console.error);
  }, 5 * 60_000);
}

export async function rateLimitMiddleware(request: Request, config?: Partial<RateLimitConfig>) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  const route = new URL(request.url).pathname;
  const key = `${ip}:${route}`;
  return rateLimit(key, config);
}
