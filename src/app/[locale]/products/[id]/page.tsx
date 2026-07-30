'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from '@/i18n/useTranslations';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { products } from '@/lib/product-data';
import {
  ShoppingCart,
  Check,
  ArrowLeft,
  Share2,
  Ruler,
  Zap,
  Users,
  Package,
  ArrowRight,
  Star,
  Shield,
} from 'lucide-react';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = use(params);
  const { t } = useTranslations();
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);

  const product = products.find((p) => p.id === id);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {locale === 'zh' ? '产品未找到' : 'Product Not Found'}
          </h2>
          <p className="text-gray-500 mb-4">
            {locale === 'zh' ? '抱歉，该产品不存在' : 'Sorry, this product does not exist'}
          </p>
          <Link href={`/${locale}/products`}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {locale === 'zh' ? '返回产品列表' : 'Back to Products'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const name = locale === 'zh' ? product.nameZh : product.nameEn;
  const desc = locale === 'zh' ? product.descZh : product.descEn;
  const specs = locale === 'zh' ? product.specsZh : product.specsEn;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: name,
      category: product.category,
      price: product.price,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isInCart = items.some((i) => i.id === product.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={`/${locale}`} className="hover:text-blue-600">{t('nav.home')}</Link>
            <span>/</span>
            <Link href={`/${locale}/products`} className="hover:text-blue-600">{t('nav.products')}</Link>
            <span>/</span>
            <Link href={`/${locale}/products?category=${product.category}`} className="hover:text-blue-600">
              {t(`products.${product.category}`)}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Product Main */}
        <div className="grid lg:grid-cols-2 gap-10 mb-16">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white shadow-sm mb-4">
              <Image
                src={product.images[selectedImage] || product.image}
                alt={name}
                fill
                className="object-cover"
                priority
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-blue-600' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${name} ${i + 1}`}
                      fill
                      className="object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <Badge className="mb-3 bg-blue-100 text-blue-700 border-0">
              {t(`products.${product.category}`)}
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{name}</h1>
            <p className="text-gray-600 leading-relaxed mb-6">{desc}</p>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.features.map((feature) => (
                <Badge key={feature} variant="secondary" className="bg-gray-100 text-gray-700">
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  {feature}
                </Badge>
              ))}
            </div>

            {/* Price */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-blue-600">{product.price}</span>
                <span className="text-sm text-gray-400">
                  {locale === 'zh' ? '参考价格' : 'Reference Price'}
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleAddToCart}
                  disabled={added}
                >
                  {added ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {locale === 'zh' ? '已添加' : 'Added'}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {t('products.addToCart')}
                    </>
                  )}
                </Button>
                <Link href={`/${locale}/contact?product=${product.id}`} className="flex-1">
                  <Button size="lg" variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50">
                    {t('products.inquiry')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Ruler, label: locale === 'zh' ? '规格' : 'Specs', value: specs[0] },
                { icon: Users, label: locale === 'zh' ? '载客量' : 'Capacity', value: specs[1] },
                { icon: Zap, label: locale === 'zh' ? '功率' : 'Power', value: specs[2] },
                { icon: Package, label: locale === 'zh' ? '材质' : 'Material', value: specs[4] },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                  <item.icon className="h-5 w-5 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">{item.label}</div>
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[140px]">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('products.specs')}</h2>
          <Card className="p-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {specs.map((spec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-gray-700">{spec}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('products.relatedProducts')}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((rp) => (
                <Link key={rp.id} href={`/${locale}/products/${rp.id}`}>
                  <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={rp.image}
                        alt={locale === 'zh' ? rp.nameZh : rp.nameEn}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {locale === 'zh' ? rp.nameZh : rp.nameEn}
                      </h3>
                      <span className="text-blue-600 font-bold">{rp.price}</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}