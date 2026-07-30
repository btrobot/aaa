'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from '@/i18n/useTranslations';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

interface Brand {
  id: number;
  name: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  sortOrder: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBrandsPage() {
  const { t } = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || 'zh';

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [form, setForm] = useState({ name: '', description: '', website: '', sortOrder: 0, status: true });
  const [saving, setSaving] = useState(false);

  const loadBrands = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.brands.list();
      setBrands(data as Brand[]);
      setError(null);
    } catch (err) {
      setError('加载品牌失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBrands(); }, [loadBrands]);

  const openCreate = () => {
    setEditingBrand(null);
    setForm({ name: '', description: '', website: '', sortOrder: 0, status: true });
    setShowModal(true);
  };

  const openEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setForm({
      name: brand.name,
      description: brand.description || '',
      website: brand.website || '',
      sortOrder: brand.sortOrder,
      status: brand.status,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const data = {
        name: form.name,
        description: form.description || null,
        website: form.website || null,
        sortOrder: form.sortOrder,
        status: form.status,
      };
      if (editingBrand) {
        await api.brands.update(editingBrand.id, data);
      } else {
        await api.brands.create(data);
      }
      setShowModal(false);
      await loadBrands();
    } catch (err) {
      setError(editingBrand ? '更新品牌失败' : '创建品牌失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此品牌吗？')) return;
    try {
      await api.brands.delete(id);
      await loadBrands();
    } catch (err) {
      setError('删除品牌失败');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">品牌管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理产品品牌</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          新增品牌
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {brands.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">暂无品牌数据</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">排序</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">{brand.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500 truncate block max-w-[300px]">
                      {brand.description || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500">{brand.sortOrder}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${brand.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {brand.status ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(brand)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingBrand ? '编辑品牌' : '新增品牌'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">品牌名称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="请输入品牌名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="品牌描述（可选）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">网站</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="https://（可选）"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-600">启用</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim() || saving}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}