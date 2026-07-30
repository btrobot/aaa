import { SignJWT, jwtVerify, errors as JoseErrors, type JWTPayload } from 'jose';

// ─── JWT Secret ────────────────────────────────────────────────
// 生产环境必须配置 JWT_SECRET 环境变量，否则拒绝启动
const JWT_SECRET_VALUE = process.env.JWT_SECRET;

if (!JWT_SECRET_VALUE && process.env.NODE_ENV === 'production') {
  throw new Error(
    '[FATAL] JWT_SECRET 环境变量未配置。生产环境禁止使用默认密钥，请设置一个强随机字符串。'
  );
}

const SECRET = new TextEncoder().encode(
  JWT_SECRET_VALUE || 'nodecoda-dev-only-jwt-secret-not-for-production'
);

export const TOKEN_NAME = 'nodecoda_token';

export interface AuthPayload extends JWTPayload {
  id: number;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}

export async function signToken(payload: Omit<AuthPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<AuthPayload> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as AuthPayload;
  } catch (error) {
    if (error instanceof JoseErrors.JWTExpired) {
      throw new AuthError('登录已过期, 请重新登录', 401);
    }
    throw new AuthError('无效的登录凭证', 401);
  }
}

export function getTokenFromRequest(request: Request): string | null {
  // 1. Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  // 2. Check cookie (for SSR/API routes from same domain)
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${TOKEN_NAME}=([^;]*)`));
    if (match) return match[1];
  }
  return null;
}

export async function authenticate(request: Request): Promise<AuthPayload> {
  const token = getTokenFromRequest(request);
  if (!token) {
    throw new AuthError('请先登录', 401);
  }
  return verifyToken(token);
}

export function requireAuth(user: AuthPayload, allowedRoles?: ('customer' | 'admin')[]): void {
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new AuthError('权限不足', 403);
  }
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number = 401) {
    super(message);
    this.status = status;
    this.name = 'AuthError';
  }
}

// Client-side helpers
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_NAME);
}

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_NAME, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_NAME);
}
