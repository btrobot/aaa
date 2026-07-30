'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Percent } from 'lucide-react';

interface CustomerGroup {
  id: number;
  name: string;
  description: string | null;
  discount: string;
}

export default function CustomerGroupsPage() {
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CustomerGroup | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', discount: '0.00' });

  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch('/api/customer-groups');
      const data = await res.json();
      setGroups(data.items ?? []);
    } catch (_err) {
      toast.error('加载客户分组失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', discount: '0.00' });
    setDialogOpen(true);
  };

  const openEdit = (group: CustomerGroup) => {
    setEditing(group);
    setForm({
      name: group.name,
      description: group.description ?? '',
      discount: group.discount,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('请输入分组名称');
      return;
    }
    try {
      if (editing) {
        const res = await fetch(`/api/customer-groups/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Update failed');
        toast.success('分组已更新');
      } else {
        const res = await fetch('/api/customer-groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Create failed');
        toast.success('分组已创建');
      }
      setDialogOpen(false);
      fetchGroups();
    } catch {
      toast.error(editing ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该客户分组？')) return;
    try {
      const res = await fetch(`/api/customer-groups/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
      toast.success('分组已删除');
      fetchGroups();
    } catch (_err) {
      toast.error(err instanceof Error ? err.message : '删除失败');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">客户分组</h1>
          <p className="text-muted-foreground text-sm">管理客户分组与折扣率</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> 新建分组
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(group)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(group.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {group.description && (
                <p className="text-sm text-muted-foreground mb-2">{group.description}</p>
              )}
              <div className="flex items-center gap-1 text-sm font-medium text-primary">
                <Percent className="h-4 w-4" />
                {Number(group.discount) > 0 ? `${group.discount}% 折扣` : '无折扣'}
              </div>
            </CardContent>
          </Card>
        ))}
        {groups.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            暂无客户分组，点击上方按钮创建
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? '编辑客户分组' : '新建客户分组'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">分组名称 *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="如：VIP客户"
              />
            </div>
            <div>
              <label className="text-sm font-medium">描述</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="分组说明"
              />
            </div>
            <div>
              <label className="text-sm font-medium">折扣率 (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
              />
            </div>
            <Button onClick={handleSave} className="w-full">
              {editing ? '保存修改' : '创建分组'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}