'use client';

import { useState } from 'react';
import { useTranslations } from '@/i18n/useTranslations';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';

const mockCategories = [
  { id: 1, name: 'Electronics', slug: 'electronics', products: 48, children: [
    { id: 11, name: 'Smartphones', slug: 'smartphones', products: 24, parentId: 1 },
    { id: 12, name: 'Laptops', slug: 'laptops', products: 15, parentId: 1 },
    { id: 13, name: 'Accessories', slug: 'accessories', products: 9, parentId: 1 },
  ]},
  { id: 2, name: 'Clothing', slug: 'clothing', products: 156, children: [
    { id: 21, name: "Men's", slug: 'mens', products: 78, parentId: 2 },
    { id: 22, name: "Women's", slug: 'womens', products: 62, parentId: 2 },
    { id: 23, name: "Kids'", slug: 'kids', products: 16, parentId: 2 },
  ]},
  { id: 3, name: 'Home & Living', slug: 'home-living', products: 89, children: [
    { id: 31, name: 'Furniture', slug: 'furniture', products: 45, parentId: 3 },
    { id: 32, name: 'Decor', slug: 'decor', products: 28, parentId: 3 },
    { id: 33, name: 'Kitchen', slug: 'kitchen', products: 16, parentId: 3 },
  ]},
  { id: 4, name: 'Sports', slug: 'sports', products: 67, children: [] },
  { id: 5, name: 'Beauty', slug: 'beauty', products: 73, children: [] },
];

function CategoryRow({ category, depth = 0 }: { category: any; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const { t } = useTranslations();
  const hasChildren = category.children && category.children.length > 0;

  return (
    <>
      <tr className="border-t border-gray-100 hover:bg-gray-50">
        <td className="px-5 py-3">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 24}px` }}>
            {hasChildren && (
              <button onClick={() => setExpanded(!expanded)} className="text-gray-400">
                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
            {!hasChildren && <span className="w-4" />}
            <span className="font-medium text-gray-900">{category.name}</span>
          </div>
        </td>
        <td className="px-5 py-3 text-gray-500">{category.slug}</td>
        <td className="px-5 py-3 text-gray-600">{category.products}</td>
        <td className="px-5 py-3">
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
      {hasChildren && expanded && category.children.map((child: any) => (
        <CategoryRow key={child.id} category={child} depth={depth + 1} />
      ))}
    </>
  );
}

export default function AdminCategories() {
  const { t } = useTranslations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.categories')}</h1>
          <p className="text-gray-500 mt-1">{mockCategories.length} {t('admin.categories')}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" />
          {t('admin.add')}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 bg-gray-50">
              <th className="px-5 py-3 font-medium">{t('admin.name')}</th>
              <th className="px-5 py-3 font-medium">Slug</th>
              <th className="px-5 py-3 font-medium">{t('admin.products')}</th>
              <th className="px-5 py-3 font-medium">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {mockCategories.map((cat) => (
              <CategoryRow key={cat.id} category={cat} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}