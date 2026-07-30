'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { products, categories } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Search, SlidersHorizontal, Grid3X3, List, ChevronDown } from 'lucide-react';

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; sort?: string }>;
}) {
  const { locale, t } = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const filtered = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brandName.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      );
    }

    // Price range
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'sold': result.sort((a, b) => b.soldCount - a.soldCount); break;
      case 'newest': result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      default: break;
    }
    return result;
  }, [selectedCategory, searchQuery, sortBy, priceRange]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('products.title')}</h1>
          <p className="text-gray-500 mt-1">{t('products.description')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('products.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px] bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">{t('products.sortDefault')}</SelectItem>
                <SelectItem value="price-asc">{t('products.sortPriceAsc')}</SelectItem>
                <SelectItem value="price-desc">{t('products.sortPriceDesc')}</SelectItem>
                <SelectItem value="rating">{t('products.sortRating')}</SelectItem>
                <SelectItem value="sold">{t('products.sortSold')}</SelectItem>
                <SelectItem value="newest">{t('products.sortNewest')}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="hidden sm:flex"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="bg-white rounded-xl border p-5 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">{t('products.categories')}</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === 'all' ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t('products.allCategories')}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat.id ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{cat.icon}</span>
                    {locale === 'zh' ? cat.name : cat.nameEn}
                    <span className="text-gray-400 ml-auto text-xs">({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-white p-5 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{t('products.categories')}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>关闭</Button>
                </div>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); setShowFilters(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                        selectedCategory === cat.id ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-2">{cat.icon}</span>
                      {locale === 'zh' ? cat.name : cat.nameEn}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Product Grid/List */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500">{t('products.noResults')}</h3>
                <p className="text-gray-400 mt-1">{t('products.noResultsDesc')}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                >
                  {t('products.clearFilters')}
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  {t('products.total')} {filtered.length} {t('products.products')}
                </p>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'
                      : 'space-y-4'
                  }
                >
                  {filtered.map((product) => (
                    <Link key={product.id} href={`/${locale}/products/${product.id}`} className="group">
                      <Card className={`overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}>
                        <div className={`relative bg-gray-100 overflow-hidden ${
                          viewMode === 'list' ? 'w-48 h-48 shrink-0' : 'aspect-square'
                        }`}>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          {product.isNew && <Badge className="absolute top-2 left-2 bg-blue-500 text-white border-0">{t('products.new')}</Badge>}
                          {product.isSale && <Badge className="absolute top-2 right-2 bg-red-500 text-white border-0">{t('products.sale')}</Badge>}
                        </div>
                        <CardContent className={`p-3 sm:p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-center' : ''}`}>
                          <p className="text-xs text-gray-500 mb-1">{product.brandName}</p>
                          <h3 className="font-medium text-sm sm:text-base text-gray-900 line-clamp-2 mb-1 group-hover:text-orange-600 transition-colors">
                            {product.name}
                          </h3>
                          {viewMode === 'list' && (
                            <p className="text-sm text-gray-500 line-clamp-2 mb-2">{product.description}</p>
                          )}
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-500">{product.rating}</span>
                            <span className="text-xs text-gray-400">({product.reviewCount})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-orange-600">¥{product.price.toLocaleString()}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-400 line-through">¥{product.originalPrice.toLocaleString()}</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}