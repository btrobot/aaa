'use client';

import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Package, ChevronRight } from 'lucide-react';

const orders = [
  { id: 'ORD-2024-001', date: '2024-01-15', total: 8999, status: 'completed', items: [{ name: 'iPhone 15 Pro Max', qty: 1, price: 8999 }] },
  { id: 'ORD-2024-002', date: '2024-01-20', total: 2499, status: 'shipped', items: [{ name: 'Sony WH-1000XM5', qty: 1, price: 2499 }] },
  { id: 'ORD-2024-003', date: '2024-02-01', total: 1299, status: 'processing', items: [{ name: 'Nike Air Max 270', qty: 1, price: 1299 }] },
  { id: 'ORD-2024-004', date: '2024-02-10', total: 6498, status: 'cancelled', items: [{ name: 'Samsung Galaxy S24 Ultra', qty: 1, price: 6498 }] },
];

const statusLabels: Record<string, string> = { completed: '已完成', shipped: '已发货', processing: '处理中', cancelled: '已取消' };
const statusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-700', shipped: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700', cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const { locale, t } = useTranslations();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Package className="h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">{t('account.orders')}</h1>
          <span className="text-gray-400">({orders.length})</span>
        </div>
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="font-medium text-gray-900">{order.id}</span>
                    <span className="text-gray-400 ml-3 text-sm">{order.date}</span>
                  </div>
                  <Badge className={`border-0 ${statusColors[order.status]}`}>{statusLabels[order.status]}</Badge>
                </div>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name} × {item.qty}</span>
                      <span className="text-gray-900 font-medium">¥{item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">{t('account.total')}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-orange-600">¥{order.total.toLocaleString()}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}