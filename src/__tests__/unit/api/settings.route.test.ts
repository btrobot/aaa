import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { NotFoundError, BusinessRuleError, ServiceError } from '@/lib/services/errors';

const mockSettingsService = {
  getAll: vi.fn(),
  updateAll: vi.fn(),
  get: vi.fn(),
};

vi.mock('@/lib/services/settings.service', () => ({
  settingsService: mockSettingsService,
}));

vi.mock('@/lib/api-middleware', async () => {
  function getErrorResponse(error: unknown) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
  return {
    withAdmin: (handler: (req: NextRequest, ctx: Record<string, unknown>) => Promise<NextResponse> | NextResponse) => async (req: NextRequest, ctx: Record<string, unknown>) => {
      try { return await handler(req, ctx); } catch (error) { return getErrorResponse(error); }
    },
    withMiddleware: (handler: (req: NextRequest, ctx: Record<string, unknown>) => Promise<NextResponse> | NextResponse) => async (req: NextRequest, ctx: Record<string, unknown>) => {
      try { return await handler(req, ctx); } catch (error) { return getErrorResponse(error); }
    },
    cacheResponse: (res: NextResponse) => res,
  };
});

const { GET, PUT } = await import('@/app/api/v1/settings/route');

function makeRequest(url: string, method = 'GET', body?: unknown): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:9090'), {
    method,
    ...(body ? { body: JSON.stringify(body), headers: { 'content-type': 'application/json' } } : {}),
  });
}

describe('Settings API Route — ServiceError 回归测试', () => {
  beforeEach(() => vi.clearAllMocks());

  // ===========================================================================
  // GET /api/settings
  // ===========================================================================
  describe('GET /api/settings', () => {
    it('正常获取设置 → 200', async () => {
      mockSettingsService.getAll.mockResolvedValue({ store_name: 'NodeCoda' });
      const res = await GET(makeRequest('/api/settings'), { params: Promise.resolve<Record<string, string>>({}) });
      expect(res.status).toBe(200);
    });

    it('服务层抛出 BusinessRuleError → 422', async () => {
      mockSettingsService.getAll.mockRejectedValue(new BusinessRuleError('业务规则违反'));
      const res = await GET(makeRequest('/api/settings'), { params: Promise.resolve<Record<string, string>>({}) });
      expect(res.status).toBe(422);
    });
  });

  // ===========================================================================
  // PUT /api/settings
  // ===========================================================================
  describe('PUT /api/settings', () => {
    it('正常更新设置 → 200', async () => {
      mockSettingsService.updateAll.mockResolvedValue({ store_name: 'NewStore' });
      const res = await PUT(makeRequest('/api/settings', 'PUT', { settings: { store_name: 'NewStore' } }), { params: Promise.resolve<Record<string, string>>({}) });
      expect(res.status).toBe(200);
    });

    it('设置不存在 → 404', async () => {
      mockSettingsService.updateAll.mockRejectedValue(new NotFoundError('设置', 'missing_key'));
      const res = await PUT(makeRequest('/api/settings', 'PUT', { settings: { missing_key: 'val' } }), { params: Promise.resolve<Record<string, string>>({}) });
      expect(res.status).toBe(404);
    });

    it('参数格式错误 → 400', async () => {
      const res = await PUT(makeRequest('/api/settings', 'PUT', { settings: 'not_an_object' }), { params: Promise.resolve<Record<string, string>>({}) });
      expect(res.status).toBe(400);
    });

    it('设置数据为空 → 422', async () => {
      mockSettingsService.updateAll.mockRejectedValue(new BusinessRuleError('设置数据不能为空'));
      const res = await PUT(makeRequest('/api/settings', 'PUT', { settings: {} }), { params: Promise.resolve<Record<string, string>>({}) });
      expect(res.status).toBe(422);
    });

    it('未捕获错误 → 500', async () => {
      mockSettingsService.updateAll.mockRejectedValue(new Error('未知错误'));
      const res = await PUT(makeRequest('/api/settings', 'PUT', { settings: { key: 'val' } }), { params: Promise.resolve<Record<string, string>>({}) });
      expect(res.status).toBe(500);
    });
  });
});
