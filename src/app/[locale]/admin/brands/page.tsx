'use client';

import { useState } from 'react';
import { useTranslations } from '@/i18n/useTranslations';
import { Search, Edit, Trash2, Plus } from 'lucide-react';

const mockBrands = [
  { id: 1, name: 'TechPro', logo: 'TP', products: 128, status: 'active' },
  { id: 2, name: 'StyleWear', logo: 'SW', products: 96, status: 'active' },
  { id: 3, name: 'HomeCraft', logo: 'HC', products: 73, status: 'active' },
  { id: 4, name: 'SportFlex', logo: 'SF', products: 52, status: 'active' },
  { id: 5, name: 'BeautyGlow', logo: 'BG', products: 41, status: 'inactive' },
  { id: 6, name: 'EcoLiving', logo: 'EL', products: 35, status: 'active' },
  { id: 7, name: 'SmartGadget', logo: 'SG', products: 28, status: 'active' },
  { id: 8, name: 'OutdoorPro', logo: 'OP', products: 19, status: 'inactive' },
];

export default function AdminBrands() {
  const { t } = useTranslations();
  const [search, setSearch] = useState('');

  const filtered = mockBrands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.brands')}</h1>
          <p className="text-gray-500 mt-1">{mockBrands.length} {t('admin.brands')}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" />
          {t('admin.add')}
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={t('admin.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((brand) => (
          <div key={brand.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                {brand.logo}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{brand.name}</h3>
                <p className="text-xs text-gray-500">{brand.products} {t('admin.products')}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                brand.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {brand.status === 'active' ? 'Active' : 'Inactive'}
              </span>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}