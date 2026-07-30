'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { api } from '@/lib/api';
import type { Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Heart, Minus, Plus, Cog, ChevronRight } from 'lucide-react';

function toApiLocale(locale: string) {
  return locale === 'en' ? 'en' : 'zh_cn';
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { locale, t } = useTranslations();
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const prod = await api.products.get(Number(id));
        setProduct(prod);
        // Load related products from same category
        const all = await api.products.list({
          locale: toApiLocale(locale),
          pageSize: 5,
          category: String(prod.categoryIds[0] || ''),
        });
        setRelated(all.filter((p) => p.id !== prod.id).slice(0, 4));
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, locale]);

  const handleAddToCart = async () => {
    // In a real app, get customerId from auth context
    const customerId = 1;
    setAddingToCart(true);
    try {
      await api.cart.add(customerId, Number(id), quantity);
      alert(t('products.addedToCart'));
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert('添加失败，请先登录');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse" />
              <div className="h-8 bg-gray-100 rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-gray-100 rounded w-1/3 animate-pulse" />
              <div className="h-20 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Cog className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">{t('products.notFound')}</h2>
          <p className="text-gray-500 mt-2">{t('products.notFoundDesc')}</p>
          <Link href={`/${locale}/products`}>
            <Button className="mt-4">{t('products.backToProducts')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const name = product.description?.name || `Product #${product.id}`;
  const desc = product.description?.description || '';
  const images = product.images && product.images.length > 0 ? product.images : [{ image: '', sortOrder: 0 }];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href={`/${locale}`} className="hover:text-blue-600">{t('home.title')}</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/${locale}/products`} className="hover:text-blue-600">{t('products.title')}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900">{name}</span>
        </nav>

        {/* Product Main */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden border">
              {images[0].image ? (
                <img
                  src={images[selectedImage]?.image || images[0].image}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <Cog className="w-32 h-32" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img.image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {product.brand && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-0">
                {product.brand.name}
              </Badge>
            )}

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{name}</h1>
              <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-blue-600">¥{Number(product.price).toLocaleString()}</span>
              {product.costPrice && (
                <span className="text-lg text-gray-400 line-through">¥{Number(product.costPrice).toLocaleString()}</span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>已售 {product.sales}</span>
              <span>库存 {product.quantity}</span>
              <span>重量 {product.weight}kg</span>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">{t('products.quantity')}</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm font-medium min-w-[40px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(99, quantity + 1))}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {addingToCart ? t('common.loading') : t('products.addToCart')}
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="w-4 h-4" />
              </Button>
            </div>

            {/* Specs */}
            {desc && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{t('products.specs')}</h3>
                <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                  {desc.replace(/[*#`]/g, '')}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Details Tabs */}
        <Card className="mb-12">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
              <TabsTrigger value="description" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                {t('product.description')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="p-6">
              <div className="prose max-w-none text-gray-600 whitespace-pre-line leading-relaxed">
                {desc.replace(/[*#`]/g, '') || t('product.noDescription')}
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Related Products */}
        {related.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t('products.relatedProducts')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((rp) => {
                const rpName = rp.description?.name || `Product #${rp.id}`;
                return (
                  <Link key={rp.id} href={`/${locale}/products/${rp.id}`} className="group">
                    <Card className="overflow-hidden hover:shadow-lg transition-all">
                      <div className="aspect-square bg-gray-100 overflow-hidden">
                        {rp.images && rp.images.length > 0 ? (
                          <img
                            src={rp.images[0].image}
                            alt={rpName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Cog className="w-12 h-12" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {rpName}
                        </h3>
                        <p className="text-sm font-bold text-blue-600 mt-1">¥{Number(rp.price).toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}