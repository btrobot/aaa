export interface ThemePreset {
  id: string;
  name: string;
  labelZh: string;
  mode: 'light' | 'dark';
  description: string;
  colors: Record<string, string>;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'default',
    name: 'NodeCoda Blue',
    labelZh: 'NodeCoda 蓝',
    mode: 'light',
    description: 'Professional blue theme',
    colors: {
      '--primary': 'oklch(0.55 0.2 260)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.55 0.2 260)',
      '--chart-1': 'oklch(0.55 0.2 260)',
      '--sidebar-primary': 'oklch(0.55 0.2 260)',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Teal',
    labelZh: '海洋绿松',
    mode: 'light',
    description: 'Soothing ocean-inspired teal tones',
    colors: {
      '--background': 'oklch(0.98 0.01 190)',
      '--foreground': 'oklch(0.15 0.02 200)',
      '--primary': 'oklch(0.55 0.18 190)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.55 0.18 190)',
      '--chart-1': 'oklch(0.55 0.18 190)',
      '--chart-2': 'oklch(0.6 0.15 220)',
      '--sidebar-primary': 'oklch(0.55 0.18 190)',
    },
  },
  {
    id: 'forest',
    name: 'Forest Green',
    labelZh: '森林绿',
    mode: 'light',
    description: 'Natural green tones',
    colors: {
      '--primary': 'oklch(0.5 0.18 160)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.5 0.18 160)',
      '--chart-1': 'oklch(0.5 0.18 160)',
      '--chart-2': 'oklch(0.55 0.15 140)',
      '--sidebar-primary': 'oklch(0.5 0.18 160)',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Warm',
    labelZh: '日落暖橙',
    mode: 'light',
    description: 'Warm orange-coral tones',
    colors: {
      '--primary': 'oklch(0.6 0.2 35)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.6 0.2 35)',
      '--chart-1': 'oklch(0.6 0.2 35)',
      '--chart-2': 'oklch(0.55 0.18 50)',
      '--sidebar-primary': 'oklch(0.6 0.2 35)',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Dark',
    labelZh: '暗夜深蓝',
    mode: 'dark',
    description: 'Dark mode with deep blue tones',
    colors: {
      '--background': 'oklch(0.12 0.02 260)',
      '--foreground': 'oklch(0.93 0.01 260)',
      '--card': 'oklch(0.15 0.02 260)',
      '--card-foreground': 'oklch(0.93 0.01 260)',
      '--popover': 'oklch(0.15 0.02 260)',
      '--popover-foreground': 'oklch(0.93 0.01 260)',
      '--primary': 'oklch(0.6 0.2 260)',
      '--primary-foreground': 'oklch(0.12 0.02 260)',
      '--secondary': 'oklch(0.25 0.04 260)',
      '--secondary-foreground': 'oklch(0.93 0.01 260)',
      '--muted': 'oklch(0.22 0.03 260)',
      '--muted-foreground': 'oklch(0.7 0.02 260)',
      '--accent': 'oklch(0.25 0.04 260)',
      '--accent-foreground': 'oklch(0.93 0.01 260)',
      '--destructive': 'oklch(0.6 0.2 25)',
      '--border': 'oklch(0.25 0.04 260)',
      '--input': 'oklch(0.25 0.04 260)',
      '--ring': 'oklch(0.6 0.2 260)',
      '--chart-1': 'oklch(0.6 0.2 260)',
      '--chart-2': 'oklch(0.55 0.15 220)',
      '--chart-3': 'oklch(0.5 0.1 180)',
      '--chart-4': 'oklch(0.6 0.15 50)',
      '--chart-5': 'oklch(0.55 0.15 300)',
      '--sidebar': 'oklch(0.15 0.02 260)',
      '--sidebar-foreground': 'oklch(0.93 0.01 260)',
      '--sidebar-primary': 'oklch(0.6 0.2 260)',
      '--sidebar-primary-foreground': 'oklch(0.12 0.02 260)',
      '--sidebar-accent': 'oklch(0.25 0.04 260)',
      '--sidebar-accent-foreground': 'oklch(0.93 0.01 260)',
      '--sidebar-border': 'oklch(0.25 0.04 260)',
      '--sidebar-ring': 'oklch(0.6 0.2 260)',
    },
  },
  {
    id: 'dark-ocean',
    name: 'Dark Ocean',
    labelZh: '深海暗色',
    mode: 'dark',
    description: 'Dark mode with teal accents',
    colors: {
      '--background': 'oklch(0.12 0.02 200)',
      '--foreground': 'oklch(0.93 0.01 200)',
      '--card': 'oklch(0.15 0.02 200)',
      '--card-foreground': 'oklch(0.93 0.01 200)',
      '--popover': 'oklch(0.15 0.02 200)',
      '--popover-foreground': 'oklch(0.93 0.01 200)',
      '--primary': 'oklch(0.6 0.18 190)',
      '--primary-foreground': 'oklch(0.12 0.02 200)',
      '--secondary': 'oklch(0.25 0.04 200)',
      '--secondary-foreground': 'oklch(0.93 0.01 200)',
      '--muted': 'oklch(0.22 0.03 200)',
      '--muted-foreground': 'oklch(0.7 0.02 200)',
      '--accent': 'oklch(0.25 0.04 200)',
      '--accent-foreground': 'oklch(0.93 0.01 200)',
      '--border': 'oklch(0.25 0.04 200)',
      '--input': 'oklch(0.25 0.04 200)',
      '--ring': 'oklch(0.6 0.18 190)',
      '--chart-1': 'oklch(0.6 0.18 190)',
      '--chart-2': 'oklch(0.55 0.15 220)',
      '--sidebar': 'oklch(0.15 0.02 200)',
      '--sidebar-foreground': 'oklch(0.93 0.01 200)',
      '--sidebar-primary': 'oklch(0.6 0.18 190)',
      '--sidebar-primary-foreground': 'oklch(0.12 0.02 200)',
      '--sidebar-accent': 'oklch(0.25 0.04 200)',
      '--sidebar-border': 'oklch(0.25 0.04 200)',
      '--sidebar-ring': 'oklch(0.6 0.18 190)',
    },
  },
];

export function getThemeById(id: string): ThemePreset | undefined {
  return THEME_PRESETS.find((t) => t.id === id);
}

export function getDefaultTheme(): ThemePreset {
  return THEME_PRESETS[0];
}