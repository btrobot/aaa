'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  pending: '待处理',
  confirmed: '已确认',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
  returned: '已退货',
};

const validTransitions: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled', 'returned'],
  shipped: ['completed', 'returned'],
  completed: ['returned'],
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    if (id) {
      fetchOrder(Number(id));
    }
  }, [params.id]);

  const fetchOrder = async (id: number) => {
    try {
      setLoading(true);
      const data = await api.orders.getById(id);
      setOrder(data);
    } catch (err) {
      setError('获取订单失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    try {
      setUpdating(true);
      await api.orders.updateStatus(order.id, newStatus);
      await fetchOrder(order.id);
    } catch (err) {
      setError('更新状态失败');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">订单不存在</div>
      </div>
    );
  }

  const transitions = validTransitions[order.status] || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">订单详情</h1>
        <span className="text-gray-500">#{order.number}</span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
      )}

      {/* 订单信息 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="font-semibold text-lg mb-4">订单信息</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-gray-500">订单编号</label>
            <p className="font-medium">{order.number}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">客户ID</label>
            <p className="font-medium">{order.customerId}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">订单状态</label>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
              {statusLabels[order.status] || order.status}
            </span>
          </div>
          <div>
            <label className="text-sm text-gray-500">创建时间</label>
            <p className="font-medium">{new Date(order.createdAt).toLocaleString('zh-CN')}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">小计</label>
            <p className="font-medium">¥{Number(order.subtotal).toFixed(2)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">运费</label>
            <p className="font-medium">¥{Number(order.shippingFee).toFixed(2)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">折扣</label>
            <p className="font-medium">-¥{Number(order.discount).toFixed(2)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">总计</label>
            <p className="font-bold text-lg text-blue-600">¥{Number(order.total).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* 商品列表 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="font-semibold text-lg mb-4">商品列表</h2>
        {order.items && order.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-gray-500">商品名称</th>
                  <th className="pb-3 font-medium text-gray-500">SKU</th>
                  <th className="pb-3 font-medium text-gray-500">单价</th>
                  <th className="pb-3 font-medium text-gray-500">数量</th>
                  <th className="pb-3 font-medium text-gray-500">小计</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any, i: number) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3">{item.name}</td>
                    <td className="py-3 text-gray-500">{item.sku || '-'}</td>
                    <td className="py-3">¥{Number(item.price).toFixed(2)}</td>
                    <td className="py-3">{item.quantity}</td>
                    <td className="py-3 font-medium">¥{Number(item.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">暂无商品信息</p>
        )}
      </div>

      {/* 状态操作 */}
      {transitions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="font-semibold text-lg mb-4">状态操作</h2>
          <div className="flex flex-wrap gap-3">
            {transitions.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
              >
                {updating ? '处理中...' : `标记为「${statusLabels[status] || status}」`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}