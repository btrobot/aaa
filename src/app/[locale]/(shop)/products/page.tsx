'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { api } from '@/lib/api';
import type { Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Search, SlidersHorizontal, Grid3X3, List, Cog, Mail, Ruler, Weight, Package } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { toApiLocale } from '@/lib/locales';
import type { CategoryData } from '@/lib/types';
import { InquiryModal } from '@/components/InquiryModal';

export default function ProductsPage() {
  const locale = useLocale();
  const t = useTranslations();
  const [products, setProducts] = useState<Product[]>([]);
  
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [inquiryProduct, setInquiryProduct] = useState<{ id: number; name: string; sku: string } | null>(null);

  const apiLocale = toApiLocale(locale);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [prods, cats] = await Promise.all([
          api.products.list({ locale: apiLocale, pageSize: 50 }),
          api.categories.list(apiLocale),
        ]);
        setProducts(prods);
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [apiLocale]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'all') {
      const catId = Number(selectedCategory);
      result = result.filter((p) => p.categoryIds.includes(catId));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const name = p.description?.name?.toLowerCase() || '';
        const sku = p.sku?.toLowerCase() || '';
        return name.includes(q) || sku.includes(q);
      });
    }

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case 'price-desc': result.sort((a, b) => Number(b.price) - Number(a.price)); break;
      case 'sold': result.sort((a, b) => b.sales - a.sales); break;
      case 'newest': result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      default: break;
    }
    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={[{ label: t('nav.products') }]} />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('products.title')}</h1>
            <p className="text-gray-500 text-sm mt-1">{t('products.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="w-4 h-4 mr-1" />
              {t('products.filter')}
            </Button>
            <div className="hidden sm:flex items-center border rounded-lg bg-white">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className={`w-64 shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-xl border p-5 space-y-6 sticky top-24">
              {/* Search */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">{t('nav.search')}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={t('nav.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">{t('products.category')}</label>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                      selectedCategory === 'all' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {t('products.title')}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(String(cat.id))}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                        selectedCategory === String(cat.id) ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">{t('products.sortBy')}</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">{t('products.sortDefault')}</SelectItem>
                    <SelectItem value="price-asc">{t('products.sortPriceAsc')}</SelectItem>
                    <SelectItem value="price-desc">{t('products.sortPriceDesc')}</SelectItem>
                    <SelectItem value="newest">{t('products.sortNewest')}</SelectItem>
                    <SelectItem value="sold">{t('products.sortPopular')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {loading ? t('common.loading') : `${t('products.searchResults')} (${filtered.length})`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden border-0 shadow-sm">
                    <div className="aspect-square bg-gray-100 animate-pulse" />
                    <CardContent className="p-3 sm:p-4 space-y-2">
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
                      <div className="h-5 bg-gray-100 rounded animate-pulse w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <Cog className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">{t('products.noProducts')}</h3>
                <p className="text-gray-500 mt-1">{t('products.noProductsHint')}</p>
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6'
                : 'space-y-4'
              }>
                {filtered.map((product) => {
                  const name = product.description?.name || `Product #${product.id}`;
                  const descText = product.description?.description || '';

                  if (viewMode === 'list') {
                    return (
                      <div key={product.id}>
                        <Card className="overflow-hidden hover:shadow-lg transition-all">
                          <div className="flex gap-4 p-4">
                            <Link href={`/${locale}/products/${product.id}`} className="shrink-0">
                              <div style={{ position: "relative" }} className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                  <Image
                                    src={product.images[0].image}
                                    alt={name}
                                    fill
                                    sizes="128px"
                                    className="object-cover hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Cog className="w-10 h-10" />
                                  </div>
                                )}
                              </div>
                            </Link>
                            <div className="flex-1 min-w-0">
                              <Link href={`/${locale}/products/${product.id}`}>
                                {product.brand && (
                                  <p className="text-xs text-gray-500 mb-1">{product.brand.name}</p>
                                )}
                                <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors">{name}</h3>
                              </Link>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{descText.replace(/[#*`]/g, '').slice(0, 100)}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-lg font-bold text-blue-600">¥{Number(product.price).toLocaleString()}</span>
                                <span className="text-xs text-gray-400">SKU: {product.sku}</span>
                              </div>
                              <div className="mt-3">
                                <Button
                                  size="sm"
                                  className="bg-orange-500 hover:bg-orange-600 text-white"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setInquiryProduct({ id: product.id, name, sku: product.sku });
                                  }}
                                >
                                  <Mail className="w-3.5 h-3.5 mr-1.5" />
                                  {t('products.sendInquiry')}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    );
                  }

                  return (
                    <div key={product.id} className="group relative">
                      <Link href={`/${locale}/products/${product.id}`}>
                        <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                          <div style={{ position: "relative" }} className="aspect-square bg-gray-100 overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                              <Image
                                src={product.images[0].image}
                                alt={name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Cog className="w-16 h-16" />
                              </div>
                            )}

                            {/* Hover Overlay with Specs */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                              <div className="space-y-1.5 text-white text-xs">
                                <div className="flex items-center gap-1.5">
                                  <Package className="w-3 h-3 text-blue-300" />
                                  <span className="text-white/90">SKU: {product.sku}</span>
                                </div>
                                {product.brand && (
                                  <div className="flex items-center gap-1.5">
                                    <Ruler className="w-3 h-3 text-blue-300" />
                                    <span className="text-white/90">{product.brand.name}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                  <Weight className="w-3 h-3 text-blue-300" />
                                  <span className="text-white/90">{product.weight}kg</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-blue-300 font-bold">¥</span>
                                  <span className="text-white/90 font-semibold">{Number(product.price).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <CardContent className="p-3 sm:p-4">
                            {product.brand && (
                              <p className="text-xs text-gray-500 mb-1">{product.brand.name}</p>
                            )}
                            <h3 className="font-medium text-sm sm:text-base text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                              {name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-blue-600">¥{Number(product.price).toLocaleString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>

                      {/* Inquiry Button on hover (absolute positioned at bottom) */}
                      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
                        <Button
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg whitespace-nowrap"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setInquiryProduct({ id: product.id, name, sku: product.sku });
                          }}
                        >
                          <Mail className="w-3.5 h-3.5 mr-1.5" />
                          {t('products.sendInquiry')}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      {inquiryProduct && (
        <InquiryModal
          open={!!inquiryProduct}
          onOpenChange={(open) => { if (!open) setInquiryProduct(null); }}
          productName={inquiryProduct.name}
          productSku={inquiryProduct.sku}
          productId={inquiryProduct.id}
        />
      )}
    </div>
  );
}