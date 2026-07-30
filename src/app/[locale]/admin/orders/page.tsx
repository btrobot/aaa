'use client';

import { useState } from 'react';
import { useTranslations } from '@/i18n/useTranslations';
import { usePathname } from 'next/navigation';
import { Search, Eye, ChevronDown } from 'lucide-react';

const mockOrders = Array.from({ length: 15 }, (_, i) => ({
  id: `#ORD-2024-${String(i + 1).padStart(4, '0')}`,
  customer: ['张三', 'John Smith', '李四', 'Emma Wilson', '王五'][i % 5],
  total: `$${(Math.random() * 5000 + 100).toFixed(2)}`,
  status: ['pending', 'confirmed', 'shipped', 'completed', 'cancelled', 'returned'][i % 6],
  items: Math.floor(Math.random() * 5) + 1,
  date: `2024-01-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')}`,
}));

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-gray-100 text-gray-800',
};

export default function AdminOrders() {
  const { t } = useTranslations();
  const pathname = usePathname();
  const locale = pathname.startsWith('/en') ? 'en' : 'zh';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = mockOrders.filter((o) => {
    const matchSearch = o.id.includes(search) || o.customer.includes(search);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.orders')}</h1>
        <p className="text-gray-500 mt-1">{mockOrders.length} {t('admin.totalOrders')}</p>
      </div>

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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">{t('admin.status')}</option>
          {['pending', 'confirmed', 'shipped', 'completed', 'cancelled', 'returned'].map((s) => (
            <option key={s} value={s}>{t(`admin.orderStatus.${s}`)}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 bg-gray-50">
                <th className="px-5 py-3 font-medium">{t('admin.orderId')}</th>
                <th className="px-5 py-3 font-medium">{t('admin.customer')}</th>
                <th className="px-5 py-3 font-medium">{t('admin.total')}</th>
                <th className="px-5 py-3 font-medium">{t('admin.status')}</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">{t('admin.createdAt')}</th>
                <th className="px-5 py-3 font-medium">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filtered.map((order) => (
                <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{order.id}</td>
                  <td className="px-5 py-3 text-gray-600">{order.customer}</td>
                  <td className="px-5 py-3 text-gray-900">{order.total}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {t(`admin.orderStatus.${order.status}`)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{order.items}</td>
                  <td className="px-5 py-3 text-gray-500">{order.date}</td>
                  <td className="px-5 py-3">
                    <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <Eye className="w-3 h-3" />
                      {t('admin.edit')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}