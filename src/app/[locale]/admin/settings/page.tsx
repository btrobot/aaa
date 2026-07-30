'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from '@/i18n/useTranslations';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Settings as SettingsIcon, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const { locale, t } = useTranslations();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [settingsLang, setSettingsLang] = useState<string>('zh_cn');
  const [seoLang, setSeoLang] = useState(locale);

  const LANG_LABELS: Record<string, string> = {
    zh_cn: '中文', en: 'English', ja: '日本語', ko: '한국어',
    es: 'Español', fr: 'Français', de: 'Deutsch', ru: 'Русский',
    pt: 'Português', ar: 'العربية', th: 'ไทย',
  };
  const LANGUAGES = Object.entries(LANG_LABELS).map(([code, name]) => ({ code, name }));
  type Settings = Record<string, string>;

  useEffect(() => {
    loadSettings();
  }, [settingsLang]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.settings.getAll(settingsLang === 'zh_cn' ? undefined : settingsLang);
      setSettings(data || {});
    } catch (_err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      await api.settings.update({
        settings,
        locale: settingsLang === 'zh_cn' ? undefined : settingsLang,
      });
      setMessage({ type: 'success', text: '设置已保存' });
      setTimeout(() => setMessage(null), 3000);
    } catch (_err) {
      setMessage({ type: 'error', text: '保存失败，请重试' });
    } finally {
      setSaving(false);
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
          <SettingsIcon className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">系统设置</h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          保存设置
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

      {/* 商店信息 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">商店信息</h2>
        {/* 语言标签 */}
        <div className="flex gap-2 mb-4">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setSettingsLang(l.code)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                settingsLang === l.code ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>商店名称 ({settingsLang === 'zh_cn' ? '中文' : settingsLang === 'en' ? 'English' : '日本語'})</Label>
            <Input value={settings[`store_name_${settingsLang}` as keyof Settings] as string || ''} onChange={(e) => handleChange(`store_name_${settingsLang}`, e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>商店邮箱</Label>
            <Input type="email" value={settings.store_email || ''} onChange={(e) => handleChange('store_email', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>联系电话</Label>
            <Input value={settings.store_phone || ''} onChange={(e) => handleChange('store_phone', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>地址 ({settingsLang === 'zh_cn' ? '中文' : settingsLang === 'en' ? 'English' : '日本語'})</Label>
            <Input value={settings[`store_address_${settingsLang}` as keyof Settings] as string || ''} onChange={(e) => handleChange(`store_address_${settingsLang}`, e.target.value)} />
          </div>
        </div>
      </Card>

      {/* 货币与语言 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">货币与语言</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>默认货币</Label>
            <select
              className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              value={settings.default_currency || 'CNY'}
              onChange={(e) => handleChange('default_currency', e.target.value)}
            >
              <option value="CNY">CNY (¥)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="KRW">KRW (₩)</option>
              <option value="THB">THB (฿)</option>
              <option value="SGD">SGD (S$)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="AED">AED (د.إ)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>支持货币</Label>
            <Input value={settings.supported_currencies || ''} onChange={(e) => handleChange('supported_currencies', e.target.value)} placeholder="CNY,USD,EUR" />
          </div>
          <div className="space-y-2">
            <Label>默认语言</Label>
            <select
              className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              value={settings.default_language || 'zh_cn'}
              onChange={(e) => handleChange('default_language', e.target.value)}
            >
              <option value="zh_cn">中文</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ru">Русский</option>
              <option value="pt">Português</option>
              <option value="ar">العربية</option>
              <option value="th">ไทย</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>支持语言</Label>
            <Input value={settings.supported_languages || ''} onChange={(e) => handleChange('supported_languages', e.target.value)} placeholder="zh_cn,en" />
          </div>
        </div>
      </Card>

      {/* 订单设置 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">订单设置</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>自动取消订单（天）</Label>
            <Input type="number" value={settings.order_auto_cancel_days || '7'} onChange={(e) => handleChange('order_auto_cancel_days', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>自动完成订单（天）</Label>
            <Input type="number" value={settings.order_auto_complete_days || '30'} onChange={(e) => handleChange('order_auto_complete_days', e.target.value)} />
          </div>
        </div>
      </Card>

      {/* 税务与发票 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">税务与发票</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4">
            <Switch
              checked={settings.tax_enabled === 'true'}
              onCheckedChange={(v) => handleChange('tax_enabled', v ? 'true' : 'false')}
            />
            <Label>启用税</Label>
          </div>
          <div className="space-y-2">
            <Label>税率 (%)</Label>
            <Input type="number" step="0.1" value={settings.tax_rate || '0'} onChange={(e) => handleChange('tax_rate', e.target.value)} />
          </div>
          <div className="flex items-center gap-4">
            <Switch
              checked={settings.invoice_enabled === 'true'}
              onCheckedChange={(v) => handleChange('invoice_enabled', v ? 'true' : 'false')}
            />
            <Label>启用发票</Label>
          </div>
        </div>
      </Card>

      {/* SEO 设置 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO 设置</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label>SEO 标题</Label>
            <Input value={settings.seo_title || ''} onChange={(e) => handleChange('seo_title', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>SEO 描述</Label>
            <textarea
              className="flex h-20 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm resize-none"
              value={settings.seo_description || ''}
              onChange={(e) => handleChange('seo_description', e.target.value)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}