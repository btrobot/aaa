import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { ServiceError, BusinessRuleError } from '@/lib/services/errors';

// ─── Mock ThemeService ─────────────────────────────────────────

const mockThemeService = {
  listPresets: vi.fn(),
  getCurrentTheme: vi.fn(),
  applyPreset: vi.fn(),
  customizeTheme: vi.fn(),
};

vi.mock('@/lib/services/theme.service', () => ({
  ThemeService: mockThemeService,
  PRESET_NAMES: ['light', 'dark', 'ocean', 'forest', 'sunset', 'midnight'],
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

const { GET: GET_PRESETS } = await import('@/app/api/theme/presets/route');
const { GET: GET_THEME, PUT: PUT_THEME } = await import('@/app/api/theme/route');
const { PUT: PUT_CUSTOMIZE } = await import('@/app/api/theme/customize/route');

function makeRequest(url: string, method = 'GET', body?: unknown): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:9090'), {
    method,
    ...(body ? { body: JSON.stringify(body), headers: { 'content-type': 'application/json' } } : {}),
  });
}

describe('Theme API Route — Spec 回归测试', () => {
  beforeEach(() => vi.clearAllMocks());

  // ===========================================================================
  // GET /api/theme/presets
  // ===========================================================================
  describe('GET /api/theme/presets', () => {
    it('应返回 6 套预设 → 200', async () => {
      const mockPresets = [
        { name: 'light', label: 'Light', mode: 'light', colors: {}, radius: '0.5rem' },
        { name: 'dark', label: 'Dark', mode: 'dark', colors: {}, radius: '0.5rem' },
        { name: 'ocean', label: 'Ocean', mode: 'light', colors: {}, radius: '0.5rem' },
        { name: 'forest', label: 'Forest', mode: 'light', colors: {}, radius: '0.5rem' },
        { name: 'sunset', label: 'Sunset', mode: 'light', colors: {}, radius: '0.5rem' },
        { name: 'midnight', label: 'Midnight', mode: 'dark', colors: {}, radius: '0.5rem' },
      ];
      mockThemeService.listPresets.mockReturnValue(mockPresets);

      const res = await GET_PRESETS(makeRequest('/api/theme/presets'), { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.presets).toHaveLength(6);
    });
  });

  // ===========================================================================
  // GET /api/theme
  // ===========================================================================
  describe('GET /api/theme', () => {
    it('应返回当前主题配置 → 200', async () => {
      mockThemeService.getCurrentTheme.mockResolvedValue({
        activePreset: 'light',
        customColors: null,
        radius: '0.5rem',
        darkMode: false,
      });

      const res = await GET_THEME(makeRequest('/api/theme'), { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.theme.activePreset).toBe('light');
    });
  });

  // ===========================================================================
  // PUT /api/theme (applyPreset)
  // ===========================================================================
  describe('PUT /api/theme', () => {
    it('应能应用预设 → 200', async () => {
      mockThemeService.applyPreset.mockResolvedValue({
        activePreset: 'ocean',
        customColors: null,
        radius: '0.5rem',
        darkMode: false,
      });

      const res = await PUT_THEME(
        makeRequest('/api/theme', 'PUT', { preset: 'ocean' }),
        { params: Promise.resolve({}) },
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.theme.activePreset).toBe('ocean');
    });

    it('无效预设名称 → 422', async () => {
      mockThemeService.applyPreset.mockRejectedValue(
        new BusinessRuleError('预设 "invalid" 不存在'),
      );

      const res = await PUT_THEME(
        makeRequest('/api/theme', 'PUT', { preset: 'invalid' }),
        { params: Promise.resolve({}) },
      );
      expect(res.status).toBe(422);
    });
  });

  // ===========================================================================
  // PUT /api/theme/customize
  // ===========================================================================
  describe('PUT /api/theme/customize', () => {
    it('应能自定义主题颜色 → 200', async () => {
      mockThemeService.customizeTheme.mockResolvedValue({
        activePreset: 'light',
        customColors: { primary: '0.8 0.1 200' },
        radius: '1rem',
        darkMode: false,
      });

      const res = await PUT_CUSTOMIZE(
        makeRequest('/api/theme/customize', 'PUT', {
          colors: { primary: '0.8 0.1 200' },
          radius: '1rem',
        }),
        { params: Promise.resolve({}) },
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.theme.customColors).toEqual({ primary: '0.8 0.1 200' });
    });

    it('colors 为空时应返回错误', async () => {
      mockThemeService.customizeTheme.mockRejectedValue(
        new BusinessRuleError('至少需要提供一个颜色变量'),
      );

      const res = await PUT_CUSTOMIZE(
        makeRequest('/api/theme/customize', 'PUT', {
          colors: {},
          radius: '0.5rem',
        }),
        { params: Promise.resolve({}) },
      );
      expect(res.status).toBe(422);
    });

    it('未知错误 → 500', async () => {
      mockThemeService.customizeTheme.mockRejectedValue(new Error('boom'));

      const res = await PUT_CUSTOMIZE(
        makeRequest('/api/theme/customize', 'PUT', {
          colors: { primary: '0.8 0.1 200' },
          radius: '0.5rem',
        }),
        { params: Promise.resolve({}) },
      );
      expect(res.status).toBe(500);
    });
  });
});
