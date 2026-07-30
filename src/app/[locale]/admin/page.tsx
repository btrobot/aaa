'use client';

import { useTranslations } from '@/i18n/useTranslations';
import { ShoppingCart, DollarSign, Users, Package, TrendingUp, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const statsCards = [
  { label: 'admin.totalOrders', value: '1,284', icon: ShoppingCart, change: '+12.5%', color: 'bg-blue-500' },
  { label: 'admin.totalRevenue', value: '$48,290', icon: DollarSign, change: '+8.2%', color: 'bg-green-500' },
  { label: 'admin.totalCustomers', value: '3,642', icon: Users, change: '+15.3%', color: 'bg-purple-500' },
  { label: 'admin.totalProducts', value: '856', icon: Package, change: '+5.7%', color: 'bg-orange-500' },
];

const recentOrders = [
  { id: '#ORD-2024-0001', customer: '张三', total: '$1,280', status: 'completed', date: '2024-01-15' },
  { id: '#ORD-2024-0002', customer: 'John Smith', total: '$850', status: 'shipped', date: '2024-01-14' },
  { id: '#ORD-2024-0003', customer: '李四', total: '$2,150', status: 'pending', date: '2024-01-13' },
  { id: '#ORD-2024-0004', customer: 'Emma Wilson', total: '$430', status: 'confirmed', date: '2024-01-12' },
  { id: '#ORD-2024-0005', customer: '王五', total: '$3,600', status: 'completed', date: '2024-01-11' },
];

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard')}</h1>
        <p className="text-gray-500 mt-1">{t('site.description')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                  <TrendingUp className="w-3 h-3" />
                  {card.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{t(card.label)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{t('admin.recentOrders')}</h2>
          <Link
            href={`/${locale}/admin/orders`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            {t('admin.viewAll')}
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500">
                <th className="px-5 py-3 font-medium">{t('admin.orderId')}</th>
                <th className="px-5 py-3 font-medium">{t('admin.customer')}</th>
                <th className="px-5 py-3 font-medium">{t('admin.total')}</th>
                <th className="px-5 py-3 font-medium">{t('admin.status')}</th>
                <th className="px-5 py-3 font-medium">{t('admin.createdAt')}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{order.id}</td>
                  <td className="px-5 py-3 text-gray-600">{order.customer}</td>
                  <td className="px-5 py-3 text-gray-900">{order.total}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {t(`admin.orderStatus.${order.status}`)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}