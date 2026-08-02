'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { api } from '@/lib/api';
import { toApiLocale } from '@/lib/locales';
import { Plus, Pencil, Trash2, ChevronDown, Loader2 } from 'lucide-react';

interface Category {
  id: number;
  parentId: number | null;
  name: string;
  status: boolean;
  children: Category[];
}

export default function AdminCategoriesPage() {
  const locale = useLocale();
  const apiLocale = toApiLocale(locale);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', parentId: 0, status: true });
  const [saving, setSaving] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.categories.list();
      setCategories(data as Category[]);
      setError(null);
    } catch {
      setError('加载分类失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const openCreate = (parentId = 0) => {
    setEditingCategory(null);
    setForm({ name: '', parentId, status: true });
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setForm({ name: cat.name, parentId: cat.parentId ?? 0, status: cat.status });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingCategory) {
        await api.categories.update(editingCategory.id, {
          name: form.name,
          locale: apiLocale,
          parentId: form.parentId || null,
          status: form.status,
        });
      } else {
        await api.categories.create({
          name: form.name,
          locale: apiLocale,
          parentId: form.parentId || null,
          status: form.status,
        });
      }
      setShowModal(false);
      await loadCategories();
    } catch {
      setError(editingCategory ? '更新分类失败' : '创建分类失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此分类吗？')) return;
    try {
      await api.categories.delete(id);
      await loadCategories();
    } catch {
      setError('删除分类失败');
    }
  };

  const renderTree = (cats: Category[], depth = 0) => {
    return cats.map((cat) => (
      <div key={cat.id}>
        <div
          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
          style={{ paddingLeft: `${16 + depth * 24}px` }}
        >
          <div className="flex items-center gap-2">
            {cat.children && cat.children.length > 0 ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <span className="w-4" />
            )}
            <span className="text-sm font-medium text-gray-900">{cat.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${cat.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {cat.status ? '启用' : '禁用'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {depth === 0 && (
              <button
                onClick={() => openCreate(cat.id)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="添加子分类"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => openEdit(cat)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="编辑"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(cat.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {cat.children && cat.children.length > 0 && renderTree(cat.children, depth + 1)}
      </div>
    ));
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
          <h1 className="text-2xl font-bold text-gray-900">分类管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理产品分类结构</p>
        </div>
        <button
          onClick={() => openCreate()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          新增分类
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">暂无分类数据</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {renderTree(categories)}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCategory ? '编辑分类' : '新增分类'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类名称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="请输入分类名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <label className="flex items-center gap-2">
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