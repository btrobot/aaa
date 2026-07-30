'use client';

import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Package, MapPin, Heart, Settings, LogOut, ChevronRight, Clock, CreditCard } from 'lucide-react';

const sidebarLinks = [
  { icon: User, label: 'account.profile', href: '/account' },
  { icon: Package, label: 'account.orders', href: '/account/orders' },
  { icon: MapPin, label: 'account.addresses', href: '/account/addresses' },
  { icon: Heart, label: 'account.wishlist', href: '/account/wishlist' },
  { icon: Settings, label: 'account.settings', href: '#' },
];

export default function AccountPage() {
  const { locale, t } = useTranslations();

  const recentOrders = [
    { id: 'ORD-2024-001', date: '2024-01-15', total: 8999, status: 'completed', items: 1 },
    { id: 'ORD-2024-002', date: '2024-01-20', total: 2499, status: 'shipped', items: 2 },
    { id: 'ORD-2024-003', date: '2024-02-01', total: 1299, status: 'processing', items: 1 },
  ];

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-700',
      shipped: 'bg-blue-100 text-blue-700',
      processing: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">{t('account.title')}</h1>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 p-3 mb-2 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">张三</p>
                    <p className="text-xs text-gray-500">zhangsan@email.com</p>
                  </div>
                </div>
                <nav className="space-y-1">
                  {sidebarLinks.map((item) => (
                    <Link
                      key={item.label}
                      href={`/${locale}${item.href}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-orange-600 transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{t(item.label)}</span>
                    </Link>
                  ))}
                  <Separator />
                  <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors w-full">
                    <LogOut className="h-4 w-4" />
                    <span>{t('account.logout')}</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Package, label: t('account.totalOrders'), value: '12', color: 'text-blue-600', bg: 'bg-blue-50' },
                { icon: CreditCard, label: t('account.totalSpent'), value: '¥45,678', color: 'text-green-600', bg: 'bg-green-50' },
                { icon: MapPin, label: t('account.savedAddresses'), value: '3', color: 'text-purple-600', bg: 'bg-purple-50' },
                { icon: Heart, label: t('account.wishlistItems'), value: '5', color: 'text-red-600', bg: 'bg-red-50' },
              ].map((stat) => (
                <Card key={stat.label} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-3`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Orders */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{t('account.recentOrders')}</h2>
                  <Link href={`/${locale}/account/orders`} className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1">
                    {t('common.viewAll')} <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{order.id}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{order.date} · {order.items} {t('account.items')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">¥{order.total.toLocaleString()}</p>
                        <Badge className={`mt-1 border-0 ${statusBadge(order.status)}`}>
                          {t(`account.status_${order.status}`)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Separator() { return <div className="h-px bg-gray-100" />; }