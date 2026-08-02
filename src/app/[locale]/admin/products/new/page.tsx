'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { api, type Brand, type CategoryTreeNode } from '@/lib/api';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toApiLocale } from '@/lib/locales';

export default function AdminNewProduct() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string)?.startsWith('en') ? 'en' : 'zh';

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [brandId, setBrandId] = useState<number | ''>('');

  const [nameZh, setNameZh] = useState('');
  const [descZh, setDescZh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descEn, setDescEn] = useState('');

  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Brand[]>([]);

  const loadOptions = useCallback(async () => {
    try {
      const [brandsList, categoriesTree] = await Promise.all([
        api.brands.list(),
        api.categories.list(toApiLocale(locale)),
      ]);
      setBrands(Array.isArray(brandsList.items) ? brandsList.items : []);
      setCategories(Array.isArray(categoriesTree) ? categoriesTree : []);
    } catch (err) {
      console.error('加载选项失败:', err);
    }
  }, [locale]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  function toggleCategory(catId: number) {
    setCategoryIds(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  }

  function renderCategoryOptions(cats: CategoryTreeNode[], depth = 0): React.ReactNode[] {
    return cats.flatMap((cat: CategoryTreeNode) => [
      <label key={cat.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded cursor-pointer">
        <input
          type="checkbox"
          checked={categoryIds.includes(cat.id)}
          onChange={() => toggleCategory(cat.id)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
        />
        <span className="text-sm" style={{ paddingLeft: depth * 16 }}>{cat.name}</span>
      </label>,
      ...(cat.children?.length ? renderCategoryOptions(cat.children, depth + 1) : []),
    ]);
  }

  async function handleSave() {
    if (!sku.trim()) { setError('SKU 不能为空'); return; }
    if (!price.trim()) { setError('价格不能为空'); return; }
    if (!nameZh.trim() && !nameEn.trim()) { setError('至少填写一个语言的产品名称'); return; }

    setSaving(true);
    setError('');

    const descriptions: Record<string, Record<string, string | undefined>> = {};
    if (nameZh) descriptions.zh_cn = { name: nameZh, description: descZh || undefined };
    if (nameEn) descriptions.en = { name: nameEn, description: descEn || undefined };

    try {
      await api.products.create({
        sku: sku.trim(),
        price: price.trim(),
        quantity: Number(quantity) || 0,
        brandId: brandId || undefined,
        status: true,
        descriptions,
        categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
      });
      router.push(`/${params.locale}/admin/products`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.products')}</h1>
            <p className="text-gray-500 mt-1">{t('admin.add')}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {t('admin.save')}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">{t('admin.general')}</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU *</label>
                <input
                  type="text" value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例如: RIDE-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.price')} *</label>
                <input
                  type="text" value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例如: 999.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.stock')}</label>
                <input
                  type="number" value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.brand')}</label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value ? Number(e.target.value) : '' )}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">无品牌</option>
                  {brands.map((b: Brand) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.category')}</label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-0.5">
                {categories.length > 0 ? renderCategoryOptions(categories) : (
                  <p className="text-sm text-gray-400 p-2">暂无分类</p>
                )}
              </div>
            </div>
          </div>

          {/* 多语言描述 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">多语言描述</h2>

            <div className="space-y-3 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
              <h3 className="text-sm font-medium text-blue-800">中文 (zh_cn)</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.name')} *</label>
                <input
                  type="text" value={nameZh}
                  onChange={(e) => setNameZh(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="商品名称（中文）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.description')}</label>
                <textarea
                  rows={3} value={descZh}
                  onChange={(e) => setDescZh(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="商品描述（中文）"
                />
              </div>
            </div>

            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-800">English (en)</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.name')} *</label>
                <input
                  type="text" value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Product name (English)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.description')}</label>
                <textarea
                  rows={3} value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Product description (English)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 右侧栏 */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('admin.status')}</h2>
            <p className="text-sm text-gray-500">新建产品默认上架</p>
          </div>
        </div>
      </div>
    </div>
  );
}