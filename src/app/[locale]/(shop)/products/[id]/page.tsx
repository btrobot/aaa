'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { api } from '@/lib/api';
import type { Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { Mail, Cog, Ruler, Weight, Package, BarChart3, Calendar, Truck, Shield } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { ProductReviews } from '@/components/ProductReviews';
import { toApiLocale } from '@/lib/locales';
import { InquiryModal } from '@/components/InquiryModal';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const locale = useLocale();
  const t = useTranslations();
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [inquiryOpen, setInquiryOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const prod = await api.products.get(Number(id));
        setProduct(prod);

        // 更新页面标题和 JSON-LD 结构化数据
        if (prod) {
          const name = prod.descriptions?.[0]?.name || '';
          const desc = prod.descriptions?.[0]?.description || '';
          const image = prod.images?.[0]?.image || '';
          setProductName(name);
          setProductDesc(desc);
          document.title = `${name} | NodeCoda`;
          // 设置 Open Graph 标签
          const ogTitle = document.querySelector('meta[property="og:title"]');
          const ogDesc = document.querySelector('meta[property="og:description"]');
          const ogImage = document.querySelector('meta[property="og:image"]');
          if (ogTitle) ogTitle.setAttribute('content', `${name} | NodeCoda`);
          if (ogDesc) ogDesc.setAttribute('content', desc);
          if (ogImage && image) ogImage.setAttribute('content', image);
        }
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

  const specItems = [
    { icon: Package, label: t('products.sku'), value: product.sku },
    { icon: BarChart3, label: t('products.price'), value: `¥${Number(product.price).toLocaleString()}` },
    { icon: Weight, label: t('products.weight'), value: `${product.weight}kg` },
    { icon: Ruler, label: t('products.sales'), value: String(product.sales) },
    { icon: Shield, label: t('products.brand'), value: product.brand?.name || '-' },
    { icon: Calendar, label: t('products.updatedAt'), value: new Date(product.updatedAt).toLocaleDateString() },
  ];

  return (
    <>
      {/* Product JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: productName,
            description: productDesc,
            sku: product.sku,
            image: images[0]?.image || undefined,
            brand: product.brand?.name ? { '@type': 'Brand', name: product.brand.name } : undefined,
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'CNY',
              availability: 'https://schema.org/InStock',
            },
          }),
        }}
      />
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={[
          { label: t('nav.products'), href: `/${locale}/products` },
          { label: name },
        ]} />

        {/* Product Main */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Images */}
          <div className="space-y-4">
            <div style={{ position: "relative" }} className="aspect-square bg-white rounded-2xl overflow-hidden border shadow-sm">
              {images[0].image ? (
                <Image
                  src={images[selectedImage]?.image || images[0].image}
                  alt={name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <Cog className="w-32 h-32" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    style={{ position: "relative" }}
                    className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image src={img.image} alt="" fill sizes="64px" className="object-cover" />
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

            {/* Quick Specs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{t('products.sales')}</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{product.sales}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{t('products.weight')}</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{product.weight}kg</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{t('products.brand')}</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{product.brand?.name || '-'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{t('products.sku')}</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{product.sku}</p>
              </div>
            </div>

            {/* Inquiry CTA */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{t('products.inquiryTitle')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t('products.inquiryDesc')}</p>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <Button
                      size="lg"
                      className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200"
                      onClick={() => setInquiryOpen(true)}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {t('products.sendInquiry')}
                    </Button>
                    <Link href={`/${locale}/products`}>
                      <Button variant="outline" size="lg">
                        {t('products.viewAllProducts')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Tabs */}
        <Card className="mb-12">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
              <TabsTrigger value="description" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                {t('product.description')}
              </TabsTrigger>
              <TabsTrigger value="specifications" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                {t('product.specifications')}
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                {t('product.reviews')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="p-6">
              <div className="prose max-w-none text-gray-600 whitespace-pre-line leading-relaxed">
                {desc.replace(/[*#`]/g, '') || t('product.noDescription')}
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {specItems.map((spec) => (
                  <div key={spec.label} className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <spec.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{spec.label}</p>
                      <p className="text-sm font-medium text-gray-900">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="p-6">
              <ProductReviews productId={product.id} locale={locale} />
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
                      <div style={{ position: "relative" }} className="aspect-square bg-gray-100 overflow-hidden">
                        {rp.images && rp.images.length > 0 ? (
                          <Image
                            src={rp.images[0].image}
                            alt={rpName}
                            fill
                            sizes="128px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
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

      {/* Inquiry Modal */}
      <InquiryModal
        open={inquiryOpen}
        onOpenChange={setInquiryOpen}
        productName={name}
        productSku={product.sku}
        productId={product.id}
      />
    </>
  );
}