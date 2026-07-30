import { z } from 'zod';
import { BusinessRuleError } from './errors';
import { settingsService } from './settings.service';

// ─── Preset Definition ─────────────────────────────────────────

export interface ThemePreset {
  name: string;
  label: string;
  mode: 'light' | 'dark';
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    accent: string;
    muted: string;
    background: string;
    foreground: string;
    card: string;
    border: string;
  };
  radius: string;
}

const BUILTIN_PRESETS: Record<string, ThemePreset> = {
  light: {
    name: 'light',
    label: 'Light',
    mode: 'light',
    colors: {
      primary: '0.585 0.233 277',
      primaryForeground: '0.97 0 0',
      secondary: '0.97 0 0',
      accent: '0.585 0.233 277',
      muted: '0.97 0 0',
      background: '0.97 0 0',
      foreground: '0.145 0 0',
      card: '0.97 0 0',
      border: '0.92 0 0',
    },
    radius: '0.5rem',
  },
  dark: {
    name: 'dark',
    label: 'Dark',
    mode: 'dark',
    colors: {
      primary: '0.7 0.2 277',
      primaryForeground: '0.145 0 0',
      secondary: '0.145 0 0',
      accent: '0.7 0.2 277',
      muted: '0.145 0 0',
      background: '0.145 0 0',
      foreground: '0.97 0 0',
      card: '0.145 0 0',
      border: '0.25 0 0',
    },
    radius: '0.5rem',
  },
  ocean: {
    name: 'ocean',
    label: 'Ocean',
    mode: 'light',
    colors: {
      primary: '0.5 0.15 240',
      primaryForeground: '0.97 0 0',
      secondary: '0.97 0.01 240',
      accent: '0.5 0.15 240',
      muted: '0.97 0.01 240',
      background: '0.97 0.01 240',
      foreground: '0.145 0 0',
      card: '0.97 0 0',
      border: '0.92 0.01 240',
    },
    radius: '0.5rem',
  },
  forest: {
    name: 'forest',
    label: 'Forest',
    mode: 'light',
    colors: {
      primary: '0.5 0.15 160',
      primaryForeground: '0.97 0 0',
      secondary: '0.97 0.01 160',
      accent: '0.5 0.15 160',
      muted: '0.97 0.01 160',
      background: '0.97 0.01 160',
      foreground: '0.145 0 0',
      card: '0.97 0 0',
      border: '0.92 0.01 160',
    },
    radius: '0.5rem',
  },
  sunset: {
    name: 'sunset',
    label: 'Sunset',
    mode: 'light',
    colors: {
      primary: '0.6 0.2 30',
      primaryForeground: '0.97 0 0',
      secondary: '0.97 0 0',
      accent: '0.6 0.2 30',
      muted: '0.97 0 0',
      background: '0.97 0 0',
      foreground: '0.145 0 0',
      card: '0.97 0 0',
      border: '0.92 0 0',
    },
    radius: '0.5rem',
  },
  midnight: {
    name: 'midnight',
    label: 'Midnight',
    mode: 'dark',
    colors: {
      primary: '0.7 0.15 277',
      primaryForeground: '0.95 0 0',
      secondary: '0.1 0.02 260',
      accent: '0.7 0.15 277',
      muted: '0.1 0.02 260',
      background: '0.1 0.02 260',
      foreground: '0.95 0 0',
      card: '0.1 0.02 260',
      border: '0.2 0.02 260',
    },
    radius: '0.5rem',
  },
};

export const PRESET_NAMES = Object.keys(BUILTIN_PRESETS);

// ─── Theme Config (stored in settings table, key=active_theme) ─

export interface ThemeConfig {
  activePreset: string;
  customColors: Record<string, string> | null;
  radius: string;
  darkMode: boolean;
}

const SETTINGS_KEY = 'active_theme';

const DEFAULT_CONFIG: ThemeConfig = {
  activePreset: 'light',
  customColors: null,
  radius: '0.5rem',
  darkMode: false,
};

// ─── Validation Schemas ────────────────────────────────────────

export const applyPresetSchema = z.object({
  preset: z.enum(PRESET_NAMES as [string, ...string[]]),
  radius: z
    .string()
    .regex(/^\d+(\.\d+)?rem$/)
    .refine(
      (v) => {
        const num = parseFloat(v);
        return num >= 0 && num <= 2 && Math.round(num * 1000) % 125 === 0;
      },
      { message: 'radius 必须在 0rem ~ 2rem 之间，步长 0.125rem' },
    )
    .optional(),
  darkMode: z.boolean().optional(),
});

export const customizeThemeSchema = z.object({
  colors: z.record(z.string(), z.string()).refine((c) => Object.keys(c).length > 0, {
    message: '至少需要提供一个颜色变量',
  }),
  radius: z
    .string()
    .regex(/^\d+(\.\d+)?rem$/)
    .refine(
      (v) => {
        const num = parseFloat(v);
        return num >= 0 && num <= 2 && Math.round(num * 1000) % 125 === 0;
      },
      { message: 'radius 必须在 0rem ~ 2rem 之间，步长 0.125rem' },
    ),
});

export type ApplyPresetInput = z.infer<typeof applyPresetSchema>;
export type CustomizeThemeInput = z.infer<typeof customizeThemeSchema>;

// ─── Service ───────────────────────────────────────────────────

export class ThemeService {
  /**
   * 返回内置的 6 套预设, 不查数据库
   */
  static listPresets(): ThemePreset[] {
    return Object.values(BUILTIN_PRESETS);
  }

  /**
   * 从 settings 表读取 active_theme 配置
   * 若不存在则返回默认配置
   */
  static async getCurrentTheme(): Promise<ThemeConfig> {
    const raw = await settingsService.get(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };

    try {
      const parsed = JSON.parse(raw) as Partial<ThemeConfig>;
      return {
        activePreset: parsed.activePreset ?? DEFAULT_CONFIG.activePreset,
        customColors: parsed.customColors ?? null,
        radius: parsed.radius ?? DEFAULT_CONFIG.radius,
        darkMode: parsed.darkMode ?? DEFAULT_CONFIG.darkMode,
      };
    } catch {
      return { ...DEFAULT_CONFIG };
    }
  }

  /**
   * 应用预设主题
   * pre: preset 必须是预设名称之一
   */
  static async applyPreset(input: ApplyPresetInput): Promise<ThemeConfig> {
    const validated = applyPresetSchema.parse(input);

    const preset = BUILTIN_PRESETS[validated.preset];
    if (!preset) {
      throw new BusinessRuleError(`预设 "${validated.preset}" 不存在`);
    }

    const config: ThemeConfig = {
      activePreset: validated.preset,
      customColors: null,
      radius: validated.radius ?? preset.radius,
      darkMode: validated.darkMode ?? preset.mode === 'dark',
    };

    await settingsService.updateAll({
      [SETTINGS_KEY]: JSON.stringify(config),
    });

    return config;
  }

  /**
   * 自定义主题颜色
   * 保存自定义颜色到 settings, 覆盖预设对应变量
   */
  static async customizeTheme(input: CustomizeThemeInput): Promise<ThemeConfig> {
    const validated = customizeThemeSchema.parse(input);

    const current = await ThemeService.getCurrentTheme();

    const config: ThemeConfig = {
      activePreset: current.activePreset,
      customColors: { ...current.customColors, ...validated.colors },
      radius: validated.radius,
      darkMode: current.darkMode,
    };

    await settingsService.updateAll({
      [SETTINGS_KEY]: JSON.stringify(config),
    });

    return config;
  }
}
