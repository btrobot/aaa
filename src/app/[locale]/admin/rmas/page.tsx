'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle, XCircle, Clock, RefreshCw, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

interface Rma {
  id: number;
  orderId: number;
  customerId: number;
  customerName: string;
  orderProductId: number;
  type: 'refund' | 'exchange' | 'return';
  reason: string;
  quantity: number;
  comment: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  adminNote: string | null;
  createdAt: string;
}

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

export default function AdminRmasPage() {
  const [rmas, setRmas] = useState<Rma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRma, setSelectedRma] = useState<Rma | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadRmas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ pageSize: '100' });
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/rmas?${params}`);
      const data = await res.json();
      setRmas(data.items || []);
    } catch (e: Record<string, unknown>) {
      setError('加载退换货单失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRmas(); }, [statusFilter]);

  const openDialog = (rma: Rma) => {
    setSelectedRma(rma);
    setNewStatus(rma.status);
    setAdminNote(rma.adminNote || '');
    setDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedRma) return;
    try {
      await fetch(`/api/rmas/${selectedRma.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminNote }),
      });
      setDialogOpen(false);
      loadRmas();
    } catch (e: Record<string, unknown>) {
      setError('更新失败');
    }
  };

  const filtered = rmas.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.customerName.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">退换货管理</h1>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">全部状态</SelectItem>
              <SelectItem value="pending">待处理</SelectItem>
              <SelectItem value="approved">已通过</SelectItem>
              <SelectItem value="rejected">已拒绝</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
              <SelectItem value="cancelled">已取消</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索用户/原因..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">暂无退换货记录</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(rma => (
            <Card key={rma.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openDialog(rma)}>
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
                    <p className="text-sm text-gray-600">
                      <span className="text-gray-400">客户:</span> {rma.customerName} | 
                      <span className="text-gray-400"> 订单:</span> #{rma.orderId} | 
                      <span className="text-gray-400"> 数量:</span> {rma.quantity}
                    </p>
                    <p className="text-sm text-gray-500">原因: {rma.reason}</p>
                    <p className="text-xs text-gray-400">{new Date(rma.createdAt).toLocaleString('zh-CN')}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    {rma.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                    {rma.status === 'approved' && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                    {rma.status === 'rejected' && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                    {rma.status === 'completed' && <RefreshCw className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>退换货单 #{selectedRma?.id}</DialogTitle>
          </DialogHeader>
          {selectedRma && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-400">客户:</span> {selectedRma.customerName}</div>
                <div><span className="text-gray-400">订单:</span> #{selectedRma.orderId}</div>
                <div><span className="text-gray-400">类型:</span> {typeMap[selectedRma.type]}</div>
                <div><span className="text-gray-400">数量:</span> {selectedRma.quantity}</div>
                <div className="col-span-2"><span className="text-gray-400">原因:</span> {selectedRma.reason}</div>
                {selectedRma.comment && (
                  <div className="col-span-2"><span className="text-gray-400">备注:</span> {selectedRma.comment}</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">处理状态</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">待处理</SelectItem>
                    <SelectItem value="approved">已通过</SelectItem>
                    <SelectItem value="rejected">已拒绝</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                    <SelectItem value="cancelled">已取消</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">管理员备注</label>
                <Textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  placeholder="处理备注..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleUpdate}>更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}