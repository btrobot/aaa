'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/i18n/useTranslations';
import { api } from '@/lib/api';
import { Search, Building2, Edit2, Trash2 } from 'lucide-react';

export default function AdminBrands() {
  const { t } = useTranslations();
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.brands.list();
        setBrands(data);
      } catch (err) {
        console.error('Failed to load brands:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = brands.filter((b) => b.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.brands')}</h1>
          <p className="text-gray-500 mt-1">{brands.length} 个品牌</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder={t('admin.search')} value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('admin.name')}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">描述</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('admin.status')}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">排序</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((brand) => (
                <tr key={brand.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-900">{brand.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{brand.description || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${brand.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {brand.status ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{brand.sortOrder}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">暂无品牌</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}