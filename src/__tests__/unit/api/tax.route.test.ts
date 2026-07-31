import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { NotFoundError, BusinessRuleError, ServiceError } from '@/lib/services/errors';

const mockTaxService = {
  listTaxClasses: vi.fn(),
  createTaxClass: vi.fn(),
  createTaxRate: vi.fn(),
  createTaxRule: vi.fn(),
  calculateTax: vi.fn(),
};

vi.mock('@/lib/services/tax.service', () => ({
  TaxService: mockTaxService,
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

const { GET: GET_CLASSES, POST: POST_CLASS } = await import('@/app/api/tax-classes/route');
const { POST: POST_RATE } = await import('@/app/api/tax-rates/route');
const { POST: POST_RULE } = await import('@/app/api/tax-rules/route');

function makeRequest(url: string, method = 'GET', body?: unknown): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:9090'), {
    method,
    ...(body ? { body: JSON.stringify(body), headers: { 'content-type': 'application/json' } } : {}),
  });
}

describe('Tax API Route — ServiceError 回归测试', () => {
  beforeEach(() => vi.clearAllMocks());

  // ===========================================================================
  // GET /api/tax-classes
  // ===========================================================================
  describe('GET /api/tax-classes', () => {
    it('正常获取税率类列表 → 200', async () => {
      mockTaxService.listTaxClasses.mockResolvedValue([
        { id: 1, title: '标准税率', rates: [] },
      ]);
      const res = await GET_CLASSES(makeRequest('/api/tax-classes'));
      expect(res.status).toBe(200);
    });
  });

  // ===========================================================================
  // POST /api/tax-classes
  // ===========================================================================
  describe('POST /api/tax-classes', () => {
    it('正常创建税率类 → 201', async () => {
      mockTaxService.createTaxClass.mockResolvedValue({ id: 1, title: '标准税率' });
      const res = await POST_CLASS(makeRequest('/api/tax-classes', 'POST', {
        title: '标准税率',
      }));
      expect(res.status).toBe(201);
    });

    it('缺少 title → 400', async () => {
      const res = await POST_CLASS(makeRequest('/api/tax-classes', 'POST', {
        description: '无标题',
      }));
      expect(res.status).toBe(400);
    });
  });

  // ===========================================================================
  // POST /api/tax-rates
  // ===========================================================================
  describe('POST /api/tax-rates', () => {
    it('正常创建税率 → 201', async () => {
      mockTaxService.createTaxRate.mockResolvedValue({
        id: 1, taxClassId: 1, name: '增值税', rate: '0.1300', type: 'percentage',
      });
      const res = await POST_RATE(makeRequest('/api/tax-rates', 'POST', {
        taxClassId: 1, name: '增值税', rate: '0.1300',
      }));
      expect(res.status).toBe(201);
    });

    it('税率类不存在 → 404', async () => {
      mockTaxService.createTaxRate.mockRejectedValue(new NotFoundError('税率类', 999));
      const res = await POST_RATE(makeRequest('/api/tax-rates', 'POST', {
        taxClassId: 999, name: '增值税', rate: '0.1300',
      }));
      expect(res.status).toBe(404);
    });

    it('缺少必填字段 → 400', async () => {
      const res = await POST_RATE(makeRequest('/api/tax-rates', 'POST', {
        name: '增值税',
      }));
      expect(res.status).toBe(400);
    });
  });

  // ===========================================================================
  // POST /api/tax-rules
  // ===========================================================================
  describe('POST /api/tax-rules', () => {
    it('正常创建税务规则 → 201', async () => {
      mockTaxService.createTaxRule.mockResolvedValue({
        id: 1, taxClassId: 1, taxRateId: 1, basedOn: 'store_address', priority: 1, customerGroupId: null,
      });
      const res = await POST_RULE(makeRequest('/api/tax-rules', 'POST', {
        taxClassId: 1, taxRateId: 1,
      }));
      expect(res.status).toBe(201);
    });

    it('税率类不存在 → 404', async () => {
      mockTaxService.createTaxRule.mockRejectedValue(new NotFoundError('税率类', 999));
      const res = await POST_RULE(makeRequest('/api/tax-rules', 'POST', {
        taxClassId: 999, taxRateId: 1,
      }));
      expect(res.status).toBe(404);
    });

    it('税率不属于同一类 → 422', async () => {
      mockTaxService.createTaxRule.mockRejectedValue(new BusinessRuleError('税率和规则必须属于同一税率类'));
      const res = await POST_RULE(makeRequest('/api/tax-rules', 'POST', {
        taxClassId: 1, taxRateId: 10,
      }));
      expect(res.status).toBe(422);
    });

    it('缺少必填字段 → 400', async () => {
      const res = await POST_RULE(makeRequest('/api/tax-rules', 'POST', {
        basedOn: 'shipping',
      }));
      expect(res.status).toBe(400);
    });

    it('未捕获错误 → 500', async () => {
      mockTaxService.createTaxRule.mockRejectedValue(new Error('未知错误'));
      const res = await POST_RULE(makeRequest('/api/tax-rules', 'POST', {
        taxClassId: 1, taxRateId: 1,
      }));
      expect(res.status).toBe(500);
    });
  });
});
