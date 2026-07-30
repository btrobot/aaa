import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock settingsService ──────────────────────────────────────

let storedSettings: Record<string, string> = {};

const mockSettingsService = {
  get: vi.fn(async (key: string) => storedSettings[key] ?? null),
  updateAll: vi.fn(async (data: Record<string, string | null>) => {
    for (const [k, v] of Object.entries(data)) {
      if (v === null) {
        delete storedSettings[k];
      } else {
        storedSettings[k] = v;
      }
    }
    return storedSettings;
  }),
  getAll: vi.fn(async () => storedSettings),
};

vi.mock('@/lib/services/settings.service', () => ({
  settingsService: mockSettingsService,
}));

const { ThemeService, PRESET_NAMES } = await import('@/lib/services/theme.service');
const { BusinessRuleError } = await import('@/lib/services/errors');

describe('ThemeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storedSettings = {};
  });

  // ===========================================================================
  // listPresets
  // ===========================================================================
  describe('listPresets', () => {
    it('应返回 6 套内置预设（happy path）', () => {
      const presets = ThemeService.listPresets();
      expect(presets).toHaveLength(6);
      const names = presets.map((p) => p.name);
      expect(names).toEqual(
        expect.arrayContaining(['light', 'dark', 'ocean', 'forest', 'sunset', 'midnight']),
      );
    });

    it('每套预设应包含完整的颜色字段', () => {
      const presets = ThemeService.listPresets();
      for (const preset of presets) {
        expect(preset.colors).toHaveProperty('primary');
        expect(preset.colors).toHaveProperty('background');
        expect(preset.colors).toHaveProperty('foreground');
        expect(preset).toHaveProperty('mode');
        expect(preset).toHaveProperty('radius');
      }
    });
  });

  // ===========================================================================
  // getCurrentTheme
  // ===========================================================================
  describe('getCurrentTheme', () => {
    it('settings 中无主题配置时应返回默认配置（happy path）', async () => {
      const theme = await ThemeService.getCurrentTheme();
      expect(theme).toEqual({
        activePreset: 'light',
        customColors: null,
        radius: '0.5rem',
        darkMode: false,
      });
    });

    it('settings 中有主题配置时应正确解析（happy path）', async () => {
      storedSettings['active_theme'] = JSON.stringify({
        activePreset: 'dark',
        customColors: { primary: '0.8 0.1 200' },
        radius: '1rem',
        darkMode: true,
      });

      const theme = await ThemeService.getCurrentTheme();
      expect(theme.activePreset).toBe('dark');
      expect(theme.customColors).toEqual({ primary: '0.8 0.1 200' });
      expect(theme.radius).toBe('1rem');
      expect(theme.darkMode).toBe(true);
    });

    it('settings 中 JSON 格式损坏时应返回默认配置（pre 违反）', async () => {
      storedSettings['active_theme'] = 'not-json';

      const theme = await ThemeService.getCurrentTheme();
      expect(theme.activePreset).toBe('light');
      expect(theme.customColors).toBeNull();
    });
  });

  // ===========================================================================
  // applyPreset
  // ===========================================================================
  describe('applyPreset', () => {
    it('应能应用有效预设（happy path）', async () => {
      const result = await ThemeService.applyPreset({ preset: 'ocean' });
      expect(result.activePreset).toBe('ocean');
      expect(result.customColors).toBeNull();
      expect(mockSettingsService.updateAll).toHaveBeenCalled();
    });

    it('应支持自定义 radius 和 darkMode', async () => {
      const result = await ThemeService.applyPreset({
        preset: 'dark',
        radius: '1rem',
        darkMode: true,
      });
      expect(result.radius).toBe('1rem');
      expect(result.darkMode).toBe(true);
    });

    it('使用无效预设名称时应抛出 BusinessRuleError（pre 违反）', async () => {
      await expect(
        ThemeService.applyPreset({ preset: 'nonexistent' } as { preset: string }),
      ).rejects.toThrow();
    });

    it('radius 超出范围时应抛出错误（pre 违反）', async () => {
      await expect(
        ThemeService.applyPreset({ preset: 'light', radius: '3rem' }),
      ).rejects.toThrow();
    });

    it('radius 步长不符合 0.125rem 时应抛出错误（pre 违反）', async () => {
      await expect(
        ThemeService.applyPreset({ preset: 'light', radius: '0.3rem' }),
      ).rejects.toThrow();
    });

    it('应用 dark 预设时 darkMode 应为 true', async () => {
      const result = await ThemeService.applyPreset({ preset: 'dark' });
      expect(result.darkMode).toBe(true);
    });

    it('应用 light 预设时 darkMode 应为 false', async () => {
      const result = await ThemeService.applyPreset({ preset: 'light' });
      expect(result.darkMode).toBe(false);
    });
  });

  // ===========================================================================
  // customizeTheme
  // ===========================================================================
  describe('customizeTheme', () => {
    it('应能保存自定义颜色（happy path）', async () => {
      const result = await ThemeService.customizeTheme({
        colors: { primary: '0.8 0.1 200' },
        radius: '0.75rem',
      });
      expect(result.customColors).toEqual({ primary: '0.8 0.1 200' });
      expect(result.radius).toBe('0.75rem');
      expect(mockSettingsService.updateAll).toHaveBeenCalled();
    });

    it('应合并已有自定义颜色', async () => {
      storedSettings['active_theme'] = JSON.stringify({
        activePreset: 'light',
        customColors: { accent: '0.5 0.1 100' },
        radius: '0.5rem',
        darkMode: false,
      });

      const result = await ThemeService.customizeTheme({
        colors: { primary: '0.8 0.1 200' },
        radius: '1rem',
      });
      expect(result.customColors).toEqual({
        accent: '0.5 0.1 100',
        primary: '0.8 0.1 200',
      });
    });

    it('colors 为空对象时应抛出错误（pre 违反）', async () => {
      await expect(
        ThemeService.customizeTheme({ colors: {}, radius: '0.5rem' }),
      ).rejects.toThrow();
    });

    it('radius 超出范围时应抛出错误（pre 违反）', async () => {
      await expect(
        ThemeService.customizeTheme({
          colors: { primary: '0.8 0.1 200' },
          radius: '5rem',
        }),
      ).rejects.toThrow();
    });
  });
});
