'use client';

import { useState } from 'react';
import { useTranslations } from '@/i18n/useTranslations';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, MoreHorizontal } from 'lucide-react';

const mockProducts = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  sku: `SKU-${String(i + 1).padStart(4, '0')}`,
  price: (Math.random() * 500 + 10).toFixed(2),
  stock: Math.floor(Math.random() * 200),
  sales: Math.floor(Math.random() * 1000),
  status: Math.random() > 0.2 ? 'active' : 'inactive',
  createdAt: `2024-01-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')}`,
}));

export default function AdminProducts() {
  const { t } = useTranslations();
  const pathname = usePathname();
  const locale = pathname.startsWith('/en') ? 'en' : 'zh';
  const [search, setSearch] = useState('');

  const filtered = mockProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.products')}</h1>
          <p className="text-gray-500 mt-1">{mockProducts.length} {t('admin.totalProducts')}</p>
        </div>
        <Link
          href={`/${locale}/admin/products/new`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          {t('admin.add')}
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 bg-gray-50">
                <th className="px-5 py-3 font-medium">{t('admin.name')}</th>
                <th className="px-5 py-3 font-medium">SKU</th>
                <th className="px-5 py-3 font-medium">{t('admin.price')}</th>
                <th className="px-5 py-3 font-medium">{t('admin.stock')}</th>
                <th className="px-5 py-3 font-medium">{t('admin.sales')}</th>
                <th className="px-5 py-3 font-medium">{t('admin.status')}</th>
                <th className="px-5 py-3 font-medium">{t('admin.createdAt')}</th>
                <th className="px-5 py-3 font-medium">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filtered.map((product) => (
                <tr key={product.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <span className="font-medium text-gray-900">{product.name}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{product.sku}</td>
                  <td className="px-5 py-3 text-gray-900">${product.price}</td>
                  <td className="px-5 py-3">
                    <span className={product.stock > 10 ? 'text-gray-900' : 'text-red-600 font-medium'}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{product.sales}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      product.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {t(`admin.productStatus.${product.status}`)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{product.createdAt}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing 1-{filtered.length} of {mockProducts.length}
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">1</button>
            <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">2</button>
            <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">3</button>
          </div>
        </div>
      </div>
    </div>
  );
}