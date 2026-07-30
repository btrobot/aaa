'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { api } from '@/lib/api';
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

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    completed: 'bg-green-100 text-green-700',
    shipped: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-yellow-100 text-yellow-700',
    pending: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
    returned: 'bg-purple-100 text-purple-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

function statusText(status: string) {
  const map: Record<string, string> = {
    pending: '待处理', confirmed: '已确认', shipped: '已发货',
    completed: '已完成', cancelled: '已取消', returned: '已退货',
  };
  return map[status] || status;
}

export default function AccountPage() {
  const { locale, t } = useTranslations();
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const stored = localStorage.getItem('customer');
        if (!stored) { setLoading(false); return; }
        const c = JSON.parse(stored);
        setCustomer(c);
        const orderData = await api.orders.list(c.id);
        setOrders(orderData.slice(0, 3));
      } catch (err) {
        console.error('Failed to load account:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50"><div className="max-w-7xl mx-auto px-4 py-6"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-100 rounded w-1/3" /><div className="h-40 bg-gray-100 rounded" /></div></div></div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center"><User className="w-16 h-16 mx-auto text-gray-300 mb-4" /><p className="text-gray-500 mb-4">请先登录</p><Link href={`/${locale}/auth/login`}><Button className="bg-blue-600 hover:bg-blue-700">登录</Button></Link></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">{t('account.myAccount')}</h1>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="text-center mb-4 pb-4 border-b">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                </div>
                <nav className="space-y-1">
                  {sidebarLinks.map((link) => (
                    <Link key={link.label} href={`/${locale}${link.href}`} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <link.icon className="w-4 h-4" />
                      <span>{t(link.label)}</span>
                    </Link>
                  ))}
                  <button
                    onClick={() => { localStorage.removeItem('customer'); window.location.href = `/${locale}`; }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>退出登录</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
                  <p className="text-sm text-gray-500">{t('account.orders')}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">0</p>
                  <p className="text-sm text-gray-500">收藏夹</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">0</p>
                  <p className="text-sm text-gray-500">地址</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">0</p>
                  <p className="text-sm text-gray-500">优惠券</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{t('account.recentOrders')}</h2>
                  <Link href={`/${locale}/account/orders`} className="text-sm text-blue-600 hover:underline">{t('common.viewAll')}</Link>
                </div>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">{t('account.noOrders')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.number}</p>
                          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">¥{Number(order.total).toLocaleString()}</p>
                          <Badge className={`${statusBadge(order.status)} text-xs`}>{statusText(order.status)}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Link href={`/${locale}/account/orders`} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">{t('account.myOrders')}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
              </Link>
              <Link href={`/${locale}/account/addresses`} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">{t('account.myAddresses')}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
              </Link>
              <Link href={`/${locale}/account/wishlist`} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
                <Heart className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">{t('account.myWishlist')}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}