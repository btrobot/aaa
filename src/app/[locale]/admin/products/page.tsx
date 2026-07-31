'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { usePathname } from 'next/navigation';
import { api, type Product } from '@/lib/api';
import { Search, Plus, Edit2, Eye, Star } from 'lucide-react';

function toApiLocale(locale: string) { return locale === 'en' ? 'en' : 'zh_cn'; }

export default function AdminProducts() {
  const { t } = useTranslations();
  const pathname = usePathname();
  const locale = pathname.startsWith('/en') ? 'en' : 'zh';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.products.list({ locale: toApiLocale(locale), pageSize: 100 });
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [locale]);

  const filtered = products.filter((p: Product) =>
    (p.description?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.products')}</h1>
          <p className="text-gray-500 mt-1">{products.length} {t('admin.totalProducts')}</p>
        </div>
        <Link href={`/${locale}/admin/products/new`} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> {t('admin.addProduct')}
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder={t('admin.search')} value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('admin.product')}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('admin.price')}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('admin.quantity')}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('admin.status')}</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product: Product) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        {product.images?.[0]?.image ? <img src={product.images[0].image} alt="" className="w-5 h-5 object-contain" /> : <Star className="w-5 h-5" />}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{product.description?.name || product.sku}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{product.sku}</td>
                  <td className="px-4 py-3 text-sm font-medium">¥{Number(product.price).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{product.quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${product.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {product.status ? '上架' : '下架'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/${locale}/admin/products/${product.id}`} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </Link>
                      <Link href={`/${locale}/products/${product.id}`} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <Eye className="w-4 h-4 text-gray-400" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">暂无产品</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}