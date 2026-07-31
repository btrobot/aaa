'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/i18n/useTranslations';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

const statusLabels: Record<string, string> = {
  pending: '待处理', confirmed: '已确认', shipped: '已发货',
  completed: '已完成', cancelled: '已取消', returned: '已退货',
};
const statusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-700', shipped: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-yellow-100 text-yellow-700', pending: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700', returned: 'bg-purple-100 text-purple-700',
};

export default function OrdersPage() {
  const { t } = useTranslations();
  const { user } = useAuth();
  
interface OrderData {
  id: number;
  number: string;
  status: string;
  total: string;
  createdAt: string;
}

const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) { setLoading(false); return; }
      try {
        const data = await api.orders.list();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Package className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">{t('account.orders')}</h1>
          <span className="text-gray-400">({orders.length})</span>
        </div>

        {loading ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />))}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('account.noOrders')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="border-0 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="font-medium text-gray-900">{order.number}</span>
                      <span className="text-gray-400 ml-3 text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <Badge className={`${statusColors[order.status]} text-xs`}>{statusLabels[order.status]}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">共 1 件商品</span>
                    <span className="font-semibold text-gray-900">¥{Number(order.total).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}