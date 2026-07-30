'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/i18n/useTranslations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { THEME_PRESETS, type ThemePreset } from '@/lib/theme/presets';
import { Palette, Save, CheckCircle2, AlertCircle, Loader2, Sun, Moon, Eye } from 'lucide-react';

export default function ThemePage() {
  const { locale, t } = useTranslations();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>('light');
  const [customColors, setCustomColors] = useState({
    primary: '#2563eb',
    radius: '0.5',
  });
  const [previewHover, setPreviewHover] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.settings.getAll();
      setSelectedTheme(data.theme_active || 'light');
      setCustomColors({
        primary: data.theme_primary || '#2563eb',
        radius: data.theme_radius || '0.5',
      });
    } catch (_err) {
      console.error('Failed to load theme settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset: ThemePreset) => {
    setSelectedTheme(preset.id);
    setCustomColors({
      primary: preset.colors.primary,
      radius: preset.colors.radius,
    });
    // Apply preview
    applyTheme(preset.id, preset.colors.primary, preset.colors.radius);
  };

  const handleCustomColorChange = (field: string, value: string) => {
    setCustomColors((prev) => {
      const updated = { ...prev, [field]: value };
      applyTheme(selectedTheme, updated.primary, updated.radius);
      return updated;
    });
  };

  const applyTheme = (themeId: string, primary: string, radius: string) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', primary);
    root.style.setProperty('--radius', `${radius}rem`);
    if (themeId === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.settings.update({
        settings: {
          theme_active: selectedTheme,
          theme_primary: customColors.primary,
          theme_radius: customColors.radius,
        },
      });
      setMessage({ type: 'success', text: '主题设置已保存' });
    } catch (_err) {
      setMessage({ type: 'error', text: '保存失败，请重试' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Palette className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">主题管理</h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          保存主题
        </Button>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {message.text}
        </div>
      )}

      {/* 主题预设 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">主题预设</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {THEME_PRESETS.map((preset: ThemePreset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              onMouseEnter={() => setPreviewHover(preset.id)}
              onMouseLeave={() => setPreviewHover(null)}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                selectedTheme === preset.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* 主题色预览 */}
              <div className="flex gap-1 mb-3">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.colors.primary }} />
                <div className="w-6 h-6 rounded-full bg-gray-100" />
                <div className="w-6 h-6 rounded-full bg-gray-200" />
              </div>
              <p className="text-sm font-medium text-gray-900">{preset.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{preset.description}</p>
              {preset.id === 'dark' && (
                <Moon className="absolute top-2 right-2 h-4 w-4 text-gray-400" />
              )}
              {preset.id !== 'dark' && (
                <Sun className="absolute top-2 right-2 h-4 w-4 text-gray-400" />
              )}
              {selectedTheme === preset.id && (
                <div className="absolute top-2 left-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                </div>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* 自定义颜色 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">自定义配色</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>主色</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={customColors.primary}
                onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                value={customColors.primary}
                onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                className="flex-1 font-mono"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>圆角大小</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={customColors.radius}
                onChange={(e) => handleCustomColorChange('radius', e.target.value)}
                className="flex-1"
              />
              <span className="text-sm text-gray-500 w-10">{customColors.radius}rem</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 实时预览 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">实时预览</h2>
        </div>
        <div className="p-6 rounded-xl border" style={{ borderRadius: `${customColors.radius}rem` }}>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button style={{ backgroundColor: customColors.primary }} className="text-white">
                主要按钮
              </Button>
              <Button variant="outline">次要按钮</Button>
              <Button variant="ghost">幽灵按钮</Button>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 text-sm rounded-full text-white" style={{ backgroundColor: customColors.primary }}>
                标签
              </span>
              <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700">
                普通标签
              </span>
            </div>
            <div className="p-4 rounded-lg border" style={{ borderRadius: `calc(${customColors.radius}rem + 0.25rem)` }}>
              <p className="text-sm text-gray-700">这是一个卡片组件的预览效果，展示当前主题配置下的视觉风格。</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}