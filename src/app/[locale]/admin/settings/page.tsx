'use client';

import { useState } from 'react';
import { useTranslations } from '@/i18n/useTranslations';
import { Save } from 'lucide-react';

export default function AdminSettings() {
  const { t } = useTranslations();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.settings')}</h1>
          <p className="text-gray-500 mt-1">{t('admin.settings')}</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : t('admin.save')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">{t('admin.general')}</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.name')}</label>
            <input
              type="text"
              defaultValue="BeikeShop"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              defaultValue="admin@beikeshop.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.description')}</label>
            <textarea
              rows={3}
              defaultValue="Open-source e-commerce platform"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">{t('admin.currency')}</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.defaultCurrency')}</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>USD - US Dollar</option>
              <option>EUR - Euro</option>
              <option>CNY - Chinese Yuan</option>
              <option>JPY - Japanese Yen</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.defaultLanguage')}</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>English</option>
              <option>中文</option>
              <option>日本語</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.timezone')}</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>UTC+8 (Asia/Shanghai)</option>
              <option>UTC+0 (UTC)</option>
              <option>UTC-5 (Eastern Time)</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">{t('admin.payment')}</h2>

          <div className="space-y-3">
            {['Stripe', 'PayPal', 'WeChat Pay'].map((method) => (
              <label key={method} className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                <span className="text-sm text-gray-700">{method}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">{t('admin.shipping')}</h2>

          <div className="space-y-3">
            {['Flat Rate', 'Free Shipping', 'Express'].map((method) => (
              <label key={method} className="flex items-center gap-3">
                <input type="checkbox" defaultChecked={method !== 'Express'} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                <span className="text-sm text-gray-700">{method}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}