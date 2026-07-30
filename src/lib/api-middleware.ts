import { NextResponse } from 'next/server';
import { authenticate, requireAuth, type AuthPayload, AuthError } from './auth';
import { rateLimitMiddleware } from './rate-limit';

type Handler = (
  request: Request,
  context: { params: Promise<Record<string, string>>; user: AuthPayload | null }
) => Promise<NextResponse>;

interface MiddlewareConfig {
  /** 是否需要登录 */
  auth?: boolean;
  /** 允许的角色 (auth=true 时生效) */
  roles?: ('customer' | 'admin')[];
  /** 速率限制配置 */
  rateLimit?: { maxRequests: number; windowMs: number };
}

function getErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error('[API Error]', error);
  return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
}

/**
 * 高阶函数：为 API 路由添加统一的鉴权 + 速率限制
 *
 * 用法:
 *   export const GET = withMiddleware(handler, { auth: true, roles: ['admin'], rateLimit: { maxRequests: 30, windowMs: 60000 } });
 */
export function withMiddleware(
  handler: Handler,
  config: MiddlewareConfig = {}
): (request: Request, context: { params: Promise<Record<string, string>> }) => Promise<NextResponse> {
  return async (request, context) => {
    try {
      // 1. 速率限制
      if (config.rateLimit) {
        const result = rateLimitMiddleware(request, config.rateLimit);
        if (!result.allowed) {
          return NextResponse.json(
            { error: '请求过于频繁，请稍后再试' },
            {
              status: 429,
              headers: {
                'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
                'X-RateLimit-Remaining': '0',
              },
            }
          );
        }
      }

      // 2. 鉴权
      const user = await authenticate(request);
      if (config.auth) {
        requireAuth(user, config.roles);
      }

      // 3. 执行业务 handler
      return await handler(request, { ...context, user });
    } catch (error) {
      return getErrorResponse(error);
    }
  };
}

/**
 * 简化版：仅用于需要登录的 API
 */
export function withAuth(handler: Handler, roles?: ('customer' | 'admin')[]) {
  return withMiddleware(handler, { auth: true, roles });
}

/**
 * 简化版：带速率限制的公开 API
 */
export function withRateLimit(handler: Handler, config: { maxRequests: number; windowMs: number }) {
  return withMiddleware(handler, { rateLimit: config });
}