'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { products, getProductById } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ShoppingCart, Heart, Share2, Minus, Plus, Check, Truck, Shield, RotateCcw } from 'lucide-react';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { locale, t } = useTranslations();
  const { id } = use(params);
  const product = getProductById(Number(id));
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">{t('products.notFound')}</h2>
          <p className="text-gray-500 mt-2">{t('products.notFoundDesc')}</p>
          <Link href={`/${locale}/products`}>
            <Button className="mt-4">{t('products.backToProducts')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    // Will integrate with cart service later
    alert(t('products.addedToCart'));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href={`/${locale}`} className="hover:text-orange-600">{t('home.title')}</Link>
          <span>/</span>
          <Link href={`/${locale}/products`} className="hover:text-orange-600">{t('products.title')}</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Product Main Section */}
        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-orange-500' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                {product.brandName}
              </Badge>
              {product.isNew && <Badge className="bg-blue-500 text-white border-0">{t('products.new')}</Badge>}
              {product.isSale && <Badge className="bg-red-500 text-white border-0">{t('products.sale')}</Badge>}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-900">{product.rating}</span>
                <span className="text-gray-400">({product.reviewCount} {t('products.reviews')})</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">{t('products.sold')} {product.soldCount}</span>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-orange-600">¥{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">¥{product.originalPrice.toLocaleString()}</span>
                    <Badge className="bg-red-50 text-red-600 border-0">
                      -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

            {/* Options */}
            {product.options?.map((option) => (
              <div key={option.name} className="mb-4">
                <label className="text-sm font-medium text-gray-900 mb-2 block">{option.name}</label>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedOptions({ ...selectedOptions, [option.name]: value })}
                      className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                        selectedOptions[option.name] === value
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-900 mb-2 block">{t('products.quantity')}</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="h-4 w-4 text-gray-600" />
                  </button>
                  <span className="px-6 py-2 font-medium text-gray-900 min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(99, quantity + 1))}
                    className="p-2 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {t('products.stock')}: {product.inStock ? '充足' : t('products.outOfStock')}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Button
                size="lg"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-base h-12"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {t('products.addToCart')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12"
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
              {[
                { icon: Truck, text: t('home.feature2Title') },
                { icon: Shield, text: t('home.feature1Title') },
                { icon: RotateCcw, text: '7天退换' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-sm text-gray-600">
                  <item.icon className="h-4 w-4 text-orange-500" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-8 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border">
          <Tabs defaultValue="specs">
            <TabsList>
              <TabsTrigger value="specs">{t('products.specs')}</TabsTrigger>
              <TabsTrigger value="description">{t('products.description')}</TabsTrigger>
              <TabsTrigger value="reviews">{t('products.reviews')} ({product.reviewCount})</TabsTrigger>
            </TabsList>
            <TabsContent value="specs" className="pt-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="flex gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-500 min-w-[80px]">{spec.label}</span>
                    <span className="text-sm text-gray-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="description" className="pt-6">
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </TabsContent>
            <TabsContent value="reviews" className="pt-6">
              <div className="text-center py-10 text-gray-500">{t('products.reviewsComingSoon')}</div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t('products.relatedProducts')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/${locale}/products/${p.id}`} className="group">
                  <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all">
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                    </div>
                    <CardContent className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{p.name}</h3>
                      <span className="text-base font-bold text-orange-600">¥{p.price.toLocaleString()}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}