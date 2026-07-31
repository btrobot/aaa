'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { RotateCcw, Loader2, Plus, Package, User, MapPin, Heart, Settings } from 'lucide-react';

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: '待处理', variant: 'secondary' },
  approved: { label: '已通过', variant: 'default' },
  rejected: { label: '已拒绝', variant: 'destructive' },
  completed: { label: '已完成', variant: 'outline' },
  cancelled: { label: '已取消', variant: 'secondary' },
};

const typeMap: Record<string, string> = {
  refund: '退款',
  exchange: '换货',
  return: '退货',
};

const sidebarLinks = [
  { icon: User, label: 'account.profile', href: '/account' },
  { icon: Package, label: 'account.orders', href: '/account/orders' },
  { icon: RotateCcw, label: '退换货', href: '/account/rmas' },
  { icon: MapPin, label: 'account.addresses', href: '/account/addresses' },
  { icon: Heart, label: 'account.wishlist', href: '/account/wishlist' },
  { icon: Settings, label: 'account.settings', href: '#' },
];


interface RmaItem {
  id: number;
  orderId: number;
  customerId: number;
  type: string;
  status: string;
  reason: string;
  adminNote?: string;
  createdAt: string;
}

interface CustomerInfo {
  id: number;
  name?: string;
  email?: string;
}

interface OrderItem {
  id: number;
  status: string;
  total: string;
}
export default function CustomerRmasPage({ params: _params }: { params: { locale: string } }) {
  const { locale, t } = useTranslations();
  const [rmas, setRmas] = useState<RmaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [form, setForm] = useState({
    orderId: '',
    orderProductId: '',
    type: 'refund' as 'refund' | 'exchange' | 'return',
    reason: '',
    quantity: '1',
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('customer');
    if (!stored) return;
    const c = JSON.parse(stored);
    setCustomer(c);
    Promise.all([
      fetch(`/api/rmas?customerId=${c.id}`).then(r => r.json()),
      fetch(`/api/orders?customerId=${c.id}`).then(r => r.json()),
    ]).then(([rmasData, ordersData]) => {
      setRmas(rmasData.items || []);
      setOrders(ordersData.items || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!customer || !form.orderId || !form.reason) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/rmas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: parseInt(form.orderId),
          customerId: customer.id,
          orderProductId: parseInt(form.orderProductId) || 0,
          type: form.type,
          reason: form.reason,
          quantity: parseInt(form.quantity) || 1,
          comment: form.comment || undefined,
        }),
      });
      if (!res.ok) throw new Error('提交失败');
      setDialogOpen(false);
      setForm({ orderId: '', orderProductId: '', type: 'refund', reason: '', quantity: '1', comment: '' });
      const data = await fetch(`/api/rmas?customerId=${customer.id}`).then(r => r.json());
      setRmas(data.items || []);
    } catch (e: unknown) {
      alert('提交失败: ' + (e instanceof Error ? e.message : '未知错误'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-56 shrink-0 hidden md:block">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-0.5 p-2">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={`/${locale}${link.href}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      link.href === '/account/rmas' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {(link.label.startsWith('account.') ? t(link.label) : link.label)}
                  </Link>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">退换货申请</h1>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  申请退换货
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>申请退换货</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">订单</label>
                    <Select value={form.orderId} onValueChange={v => setForm(f => ({ ...f, orderId: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择订单" />
                      </SelectTrigger>
                      <SelectContent>
                        {orders.filter((o) => o.status === 'completed' || o.status === 'shipped').map((o) => (
                          <SelectItem key={o.id} value={String(o.id)}>
                            订单 #{o.id} - ¥{o.total}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">类型</label>
                    <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as 'refund' | 'exchange' | 'return' }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="refund">退款</SelectItem>
                        <SelectItem value="exchange">换货</SelectItem>
                        <SelectItem value="return">退货</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">数量</label>
                    <select
                      value={form.quantity}
                      onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    >
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">原因 *</label>
                    <Textarea
                      value={form.reason}
                      onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                      placeholder="请描述退换货原因..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">备注</label>
                    <Textarea
                      value={form.comment}
                      onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                      placeholder="其他说明..."
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? '提交中...' : '提交申请'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : rmas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-400">
                <RotateCcw className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                <p>暂无退换货记录</p>
                <p className="text-sm mt-1">已完成或已发货的订单可申请退换货</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {rmas.map((rma) => (
                <Card key={rma.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">#{rma.id}</span>
                          <Badge variant={statusMap[rma.status]?.variant}>
                            {statusMap[rma.status]?.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {typeMap[rma.type] || rma.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">原因: {rma.reason}</p>
                        {rma.adminNote && (
                          <p className="text-sm text-blue-600">管理员回复: {rma.adminNote}</p>
                        )}
                        <p className="text-xs text-gray-400">{new Date(rma.createdAt).toLocaleString('zh-CN')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}