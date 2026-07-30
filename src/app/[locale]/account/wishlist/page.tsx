'use client';

import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { products } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

export default function WishlistPage() {
  const { locale, t } = useTranslations();
  const wishlist = products.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">{t('account.wishlist')}</h1>
          <span className="text-gray-400">({wishlist.length})</span>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-500">{t('account.wishlistEmpty')}</h2>
            <Link href={`/${locale}/products`}><Button className="mt-4 bg-orange-500 hover:bg-orange-600">{t('cart.continueShopping')}</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {wishlist.map((product) => (
              <Card key={product.id} className="border-0 shadow-sm group">
                <div className="relative aspect-square bg-gray-100 overflow-hidden rounded-t-xl">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  <button className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <CardContent className="p-3">
                  <Link href={`/${locale}/products/${product.id}`}>
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-orange-600">{product.name}</h3>
                  </Link>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-base font-bold text-orange-600">¥{product.price.toLocaleString()}</span>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}