'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/i18n/useTranslations';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { ShoppingCart, DollarSign, Users, Package, TrendingUp, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-gray-100 text-gray-800',
};

export default function AdminDashboard() {
  const { t } = useTranslations();
  const pathname = usePathname();
  const locale = pathname.startsWith('/en') ? 'en' : 'zh';
  const [stats, setStats] = useState({ orders: 0, revenue: 0, customers: 0, products: 0 });
  const [recentOrders, setRecentOrders] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [orders, customers, products] = await Promise.all([
          api.orders.getAll().catch(() => []),
          api.customers.getAll().catch(() => []),
          api.products.list({ locale: locale === 'en' ? 'en' : 'zh_cn', pageSize: 100 }).catch(() => []),
        ]);
        const totalRevenue = orders.reduce((sum: number, o: Record<string, unknown>) => sum + Number(o.total), 0);
        setStats({ orders: orders.length, revenue: totalRevenue, customers: customers.length || 0, products: Array.isArray(products) ? products.length : 0 });
        setRecentOrders(orders.slice(0, 5));
      } catch (_err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statsCards = [
    { label: 'admin.totalOrders', value: stats.orders.toLocaleString(), icon: ShoppingCart, change: '', color: 'bg-blue-500' },
    { label: 'admin.totalRevenue', value: `¥${stats.revenue.toLocaleString()}`, icon: DollarSign, change: '', color: 'bg-green-500' },
    { label: 'admin.totalCustomers', value: stats.customers.toLocaleString(), icon: Users, change: '', color: 'bg-purple-500' },
    { label: 'admin.totalProducts', value: stats.products.toLocaleString(), icon: Package, change: '', color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard')}</h1>
        <p className="text-gray-500 mt-1">{t('site.description')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-3">{loading ? '...' : card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{t(card.label)}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('admin.recentOrders')}</h2>
          <Link href={`/${locale}/admin/orders`} className="text-sm text-blue-600 hover:underline">{t('common.viewAll')}</Link>
        </div>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />))}</div>
        ) : recentOrders.length === 0 ? (
          <p className="text-gray-400 text-center py-8">暂无订单</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.number}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">¥{Number(order.total).toLocaleString()}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}