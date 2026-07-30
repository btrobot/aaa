'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/i18n/useTranslations';
import { api } from '@/lib/api';
import { Search } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  pending: '待处理', confirmed: '已确认', shipped: '已发货',
  completed: '已完成', cancelled: '已取消', returned: '已退货',
};

export default function AdminOrders() {
  const { t, locale } = useTranslations();
  const [orders, setOrders] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.orders.getAll();
        setOrders(data);
      } catch (_err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch = o.number?.includes(search) || String(o.id).includes(search);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.orders')}</h1>
        <p className="text-gray-500 mt-1">{orders.length} {t('admin.totalOrders')}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder={t('admin.search')} value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">全部状态</option>
          {Object.keys(statusLabels).map((s) => (<option key={s} value={s}>{statusLabels[s]}</option>))}
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">订单号</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('admin.date')}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('admin.total')}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('admin.status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/${locale}/admin/orders/${order.id}`}>
                  <td className="px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800">{order.number}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm font-medium">¥{Number(order.total).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">暂无订单</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}