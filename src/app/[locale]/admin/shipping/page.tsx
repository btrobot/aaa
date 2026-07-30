'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/i18n/useTranslations';
import { api, request } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Truck, Package } from 'lucide-react';

interface ShippingMethod {
  id: number;
  code: string;
  name: string;
  description: string | null;
  baseFee: string;
  freeShippingThreshold: string | null;
  estimatedDays: string | null;
  status: boolean;
  sortOrder: number;
}

export default function AdminShippingPage() {
  const { t, locale } = useTranslations();
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name_zh: '',
    name_en: '',
    description_zh: '',
    description_en: '',
    baseFee: '',
    freeShippingThreshold: '',
    estimatedDays: '',
    sortOrder: '0',
  });

  const loadMethods = async () => {
    try {
      const data = await api.shipping.list();
      setMethods(data);
    } catch (err) {
      console.error('Failed to load shipping methods:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMethods(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setFormData({
      code: '', name_zh: '', name_en: '',
      description_zh: '', description_en: '',
      baseFee: '', freeShippingThreshold: '',
      estimatedDays: '', sortOrder: '0',
    });
    setShowForm(true);
  };

  const openEdit = (method: ShippingMethod) => {
    setEditingId(method.id);
    setFormData({
      code: method.code,
      name_zh: method.name,
      name_en: '',
      description_zh: method.description || '',
      description_en: '',
      baseFee: method.baseFee,
      freeShippingThreshold: method.freeShippingThreshold || '',
      estimatedDays: method.estimatedDays || '',
      sortOrder: String(method.sortOrder),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const descriptions: Record<string, { name: string; description?: string }> = {};
      if (formData.name_zh) descriptions.zh_cn = { name: formData.name_zh, description: formData.description_zh || undefined };
      if (formData.name_en) descriptions.en = { name: formData.name_en, description: formData.description_en || undefined };

      const payload = {
        code: formData.code,
        baseFee: formData.baseFee,
        freeShippingThreshold: formData.freeShippingThreshold || undefined,
        estimatedDays: formData.estimatedDays || undefined,
        sortOrder: parseInt(formData.sortOrder) || 0,
        descriptions,
      };

      if (editingId) {
        await request(`/api/shipping-methods/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await request('/api/shipping-methods', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setShowForm(false);
      setEditingId(null);
      await loadMethods();
    } catch (err) {
      console.error('Failed to save shipping method:', err);
      alert('保存失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除此配送方式？')) return;
    try {
      await request(`/api/shipping-methods/${id}`, { method: 'DELETE' });
      await loadMethods();
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('删除失败');
    }
  };

  const toLocale = locale === 'en' ? 'en' : 'zh_cn';

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-1/4" />
        <div className="h-20 bg-gray-100 rounded" />
        <div className="h-20 bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Truck className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">配送方式管理</h1>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-1" /> 新增配送方式
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? '编辑配送方式' : '新增配送方式'}
            </h2>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>标识代码</Label>
                  <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="standard" />
                </div>
                <div className="space-y-2">
                  <Label>排序</Label>
                  <Input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>名称 (中文)</Label>
                  <Input value={formData.name_zh} onChange={(e) => setFormData({ ...formData, name_zh: e.target.value })} placeholder="标准配送" />
                </div>
                <div className="space-y-2">
                  <Label>名称 (英文)</Label>
                  <Input value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} placeholder="Standard Shipping" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>描述 (中文)</Label>
                  <Input value={formData.description_zh} onChange={(e) => setFormData({ ...formData, description_zh: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>描述 (英文)</Label>
                  <Input value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>基础运费</Label>
                  <Input value={formData.baseFee} onChange={(e) => setFormData({ ...formData, baseFee: e.target.value })} placeholder="30" />
                </div>
                <div className="space-y-2">
                  <Label>免运费门槛</Label>
                  <Input value={formData.freeShippingThreshold} onChange={(e) => setFormData({ ...formData, freeShippingThreshold: e.target.value })} placeholder="500" />
                </div>
                <div className="space-y-2">
                  <Label>预计天数</Label>
                  <Input value={formData.estimatedDays} onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })} placeholder="5-7" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowForm(false)}>取消</Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={!formData.code || !formData.baseFee}>
                {editingId ? '更新' : '创建'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Methods List */}
      <div className="space-y-4">
        {methods.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500">暂无配送方式，点击上方按钮添加</p>
            </CardContent>
          </Card>
        ) : (
          methods.map((method) => (
            <Card key={method.id}>
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{method.name}</span>
                      <Badge variant="outline" className="text-xs">{method.code}</Badge>
                      {method.estimatedDays && (
                        <span className="text-xs text-gray-500">约 {method.estimatedDays} 天</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>基础运费: ¥{method.baseFee}</span>
                      {method.freeShippingThreshold && (
                        <span>满 ¥{method.freeShippingThreshold} 免运费</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(method)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(method.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}