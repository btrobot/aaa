import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authenticate, requireAuth, type AuthPayload, AuthError } from './auth';
import { ServiceError } from './services/errors';
import { rateLimitMiddleware } from './rate-limit';

// ─── Handler Types ─────────────────────────────────────────────

/** Admin handler: user is always non-null */
type AdminHandler<TParams extends Record<string, string> = Record<string, string>> = (
  request: NextRequest,
  context: { params: Promise<TParams>; user: AuthPayload }
) => Promise<NextResponse | Response>;

/** Mixed handler: user may be null (public access) or non-null (authenticated) */
type MixedHandler<TParams extends Record<string, string> = Record<string, string>> = (
  request: NextRequest,
  context: { params: Promise<TParams>; user: AuthPayload | null }
) => Promise<NextResponse | Response>;

interface MiddlewareConfig {
  /** 是否需要登录 */
  auth?: boolean;
  /** 允许的角色 (auth=true 时生效) */
  roles?: ('customer' | 'admin')[];
  /** 速率限制配置 */
  rateLimit?: { maxRequests: number; windowMs: number };
}

// ─── Error Handling ────────────────────────────────────────────

function getErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ServiceError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }
  console.error('[API Error]', error);
  return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
}

// ─── Core Middleware ───────────────────────────────────────────

/**
 * 高阶函数：为 API 路由添加统一的鉴权 + 速率限制
 *
 * 用法:
 *   export const GET = withMiddleware(handler, { auth: true, roles: ['admin'] });
 */
export function withMiddleware<TParams extends Record<string, string> = Record<string, string>>(
  handler: MixedHandler<TParams>,
  config: MiddlewareConfig = {}
): (request: NextRequest, context: { params: Promise<TParams> }) => Promise<NextResponse | Response> {
  return async (request, context) => {
    try {
      // 1. 速率限制
      if (config.rateLimit) {
        const result = await rateLimitMiddleware(request, config.rateLimit);
        if (!result.allowed) {
          const resetAt = result.resetAt;
          return NextResponse.json(
            { error: '请求过于频繁，请稍后再试' },
            {
              status: 429,
              headers: {
                'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
                'X-RateLimit-Remaining': '0',
              },
            }
          );
        }
      }

      // 2. 鉴权
      let user: AuthPayload | null = null;
      if (config.auth) {
        // 必须认证：authenticate 抛错时直接传播
        user = await authenticate(request);
        if (config.roles) {
          requireAuth(user, config.roles);
        }
      } else {
        // 公开路由：尝试认证，失败则 user 为 null
        try {
          user = await authenticate(request);
        } catch {
          user = null;
        }
      }

      // 3. 执行业务 handler
      return await handler(request, { ...context, user });
    } catch (error) {
      return getErrorResponse(error);
    }
  };
}

// ─── Convenience Wrappers ──────────────────────────────────────

/**
 * 需要登录（customer 或 admin 均可）
 */
export function withAuth<TParams extends Record<string, string> = Record<string, string>>(
  handler: AdminHandler<TParams>
): (request: NextRequest, context: { params: Promise<TParams> }) => Promise<NextResponse | Response> {
  return withMiddleware(
    handler as MixedHandler<TParams>,
    { auth: true }
  );
}

/**
 * 需要管理员权限
 */
export function withAdmin<TParams extends Record<string, string> = Record<string, string>>(
  handler: AdminHandler<TParams>
): (request: NextRequest, context: { params: Promise<TParams> }) => Promise<NextResponse | Response> {
  return withMiddleware(
    handler as MixedHandler<TParams>,
    { auth: true, roles: ['admin'] }
  );
}

/**
 * 带速率限制的公开 API（无需登录）
 */
export function withRateLimit<TParams extends Record<string, string> = Record<string, string>>(
  handler: MixedHandler<TParams>,
  config: { maxRequests: number; windowMs: number }
): (request: NextRequest, context: { params: Promise<TParams> }) => Promise<NextResponse | Response> {
  return withMiddleware(handler, { rateLimit: config });
}

// Re-export cache utility for convenience
export { cacheResponse } from './utils';
