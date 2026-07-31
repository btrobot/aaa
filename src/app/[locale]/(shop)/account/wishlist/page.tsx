'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

export default function WishlistPage() {
  const { locale, t } = useTranslations();
  
interface WishlistProduct {
  id: number;
  name: string;
  price: string;
  image?: string;
}

const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        if (!user) { setLoading(false); return; }
        const data = await api.customers.wishlist();
        setWishlist(data || []);
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleRemove = async (productId: number) => {
    try {
      if (!user) { setLoading(false); return; }
      await api.customers.removeWishlist( productId);
      setWishlist(wishlist.filter((p) => p.id !== productId));
    } catch (err) {
      console.error('Failed to remove:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-64 bg-gray-100 rounded-xl" />))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">{t('account.wishlist')}</h1>
          <span className="text-gray-400">({wishlist.length})</span>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-500">{t('account.wishlistEmpty')}</h2>
            <Link href={`/${locale}/products`}>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">{t('cart.continueShopping')}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {wishlist.map((product) => (
              <Card key={product.id} className="border-0 shadow-sm group">
                <Link href={`/${locale}/products/${product.id}`}>
                  <div style={{ position: "relative" }} className="aspect-square bg-gray-100 overflow-hidden rounded-t-xl">
                    {product.image ? (
                      <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Heart className="w-12 h-12" />
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.preventDefault(); handleRemove(product.id); }}
                      className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </Link>
                <CardContent className="p-3">
                  <Link href={`/${locale}/products/${product.id}`}>
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600">{product.name}</h3>
                  </Link>
                  <p className="text-sm font-bold text-blue-600 mt-1">¥{Number(product.price).toLocaleString()}</p>
                  <Button size="sm" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-xs" asChild>
                    <Link href={`/${locale}/cart?add=${product.id}`}>
                      <ShoppingCart className="w-3 h-3 mr-1" /> {t('cart.addToCart')}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}