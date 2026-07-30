'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/i18n/useTranslations';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { Search, Plus, Edit2, Trash2, Globe, CheckCircle, XCircle } from 'lucide-react';

function toApiLocale(locale: string) { return locale === 'en' ? 'en' : 'zh_cn'; }

export default function AdminPages() {
  const { t } = useTranslations();
  const pathname = usePathname();
  const locale = pathname.startsWith('/en') ? 'en' : 'zh';
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '', content: '', summary: '', status: true,
    titleEn: '', contentEn: '', summaryEn: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPages();
  }, [locale]);

  async function loadPages() {
    try {
      const data = await api.pages.list({ locale: toApiLocale(locale) });
      setPages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load pages:', err);
      setPages([]);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setFormData({ title: '', content: '', summary: '', status: true, titleEn: '', contentEn: '', summaryEn: '' });
    setShowModal(true);
  }

  function openEdit(page: any) {
    setEditing(page);
    setFormData({
      title: page.title || '',
      content: page.content || '',
      summary: page.summary || '',
      titleEn: '',
      contentEn: '',
      summaryEn: '',
      status: page.status,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!formData.title.trim()) return;
    setSaving(true);
    try {
      const descriptions: Record<string, any> = {
        zh_cn: { title: formData.title, content: formData.content || undefined, metaTitle: formData.title, metaDescription: formData.summary || undefined },
      };
      if (formData.titleEn.trim()) {
        descriptions.en = { title: formData.titleEn, content: formData.contentEn || undefined, metaTitle: formData.titleEn, metaDescription: formData.summaryEn || undefined };
      }
      if (editing) {
        await api.pages.update(editing.id, { descriptions, status: formData.status });
      } else {
        await api.pages.create({ descriptions, status: formData.status, sortOrder: 0 });
      }
      setShowModal(false);
      loadPages();
    } catch (err) {
      console.error('Failed to save page:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm(t('admin.confirmDelete') || '确认删除？')) return;
    try {
      await api.pages.delete(id);
      loadPages();
    } catch (err) {
      console.error('Failed to delete page:', err);
    }
  }

  async function toggleStatus(page: any) {
    try {
      await api.pages.update(page.id, { status: !page.status });
      loadPages();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  }

  const filtered = pages.filter((p: any) =>
    (p.title || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.pages')}</h1>
          <p className="text-gray-500 mt-1">{pages.length} {t('admin.totalProducts')}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> {t('admin.addProduct')}
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder={t('admin.search')} value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">语言</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((page: any) => (
                <tr key={page.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{page.title || '无标题'}</p>
                        {page.summary && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{page.summary}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">🇨🇳</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => toggleStatus(page)} className="inline-flex">
                      {page.status ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-gray-300" />}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(page)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button onClick={() => handleDelete(page.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">暂无文章</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? '编辑文章' : '新建文章'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">中文标题 *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">中文摘要</label>
                <textarea value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">中文内容</label>
                <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={6}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>
              <hr className="border-gray-100" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">English Title</label>
                <input type="text" value={formData.titleEn} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">English Summary</label>
                <textarea value={formData.summaryEn} onChange={(e) => setFormData({ ...formData, summaryEn: e.target.value })} rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">English Content</label>
                <textarea value={formData.contentEn} onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })} rows={6}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">状态：</label>
                <button onClick={() => setFormData({ ...formData, status: !formData.status })}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${formData.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {formData.status ? '已发布' : '草稿'}
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
              <button onClick={handleSave} disabled={saving || !formData.title.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}