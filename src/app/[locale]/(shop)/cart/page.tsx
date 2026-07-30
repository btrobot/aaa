'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ShoppingCart } from 'lucide-react';

function toApiLocale(locale: string) {
  return locale === 'en' ? 'en' : 'zh_cn';
}

interface CartItemData {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  price: string;
  quantity: number;
  selected: boolean;
  image?: string;
}

export default function CartPage() {
  const { locale, t } = useTranslations();
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');

  // In a real app, get customerId from auth context
  const customerId = 1;

  const loadCart = async () => {
    try {
      const items = await api.cart.get(customerId, toApiLocale(locale));
      setCartItems(items);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [locale]);

  const updateQuantity = async (id: number, delta: number) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    const newQty = Math.max(1, Math.min(99, item.quantity + delta));
    try {
      await api.cart.update(id, newQty);
      setCartItems((items) =>
        items.map((item) =>
          item.id === id ? { ...item, quantity: newQty } : item
        )
      );
    } catch (err) {
      console.error('Failed to update cart:', err);
    }
  };

  const removeItem = async (id: number) => {
    try {
      await api.cart.remove(id);
      setCartItems((items) => items.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const shipping = subtotal >= 500 ? 0 : 30;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-gray-900" />
            <h1 className="text-2xl font-bold text-gray-900">{t('nav.cart')}</h1>
            <span className="text-sm text-gray-500">({cartItems.length} {t('common.items')})</span>
          </div>
          <Link href={`/${locale}/products`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t('products.backToProducts')}
            </Button>
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <Card className="text-center py-16">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('cart.emptyTitle')}</h2>
            <p className="text-gray-500 mb-6">{t('cart.emptyDesc')}</p>
            <Link href={`/${locale}/products`}>
              <Button className="bg-blue-600 hover:bg-blue-700">{t('products.backToProducts')}</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="flex gap-4 p-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm">{item.productName}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">SKU: {item.sku}</p>
                      <p className="text-sm font-bold text-blue-600 mt-1">¥{Number(item.price).toLocaleString()}</p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1.5 hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 py-1.5 text-sm font-medium min-w-[30px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1.5 hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4">{t('cart.orderSummary')}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('cart.subtotal')}</span>
                    <span className="font-medium">¥{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('cart.shipping')}</span>
                    <span className="font-medium">{shipping === 0 ? t('cart.freeShipping') : `¥${shipping}`}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base">
                    <span className="font-semibold">{t('cart.total')}</span>
                    <span className="font-bold text-blue-600 text-lg">¥{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Coupon */}
                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder={t('cart.couponPlaceholder')}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="text-sm"
                  />
                  <Button variant="outline" size="sm">{t('cart.apply')}</Button>
                </div>

                <Link href={`/${locale}/checkout`}>
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" size="lg">
                    {t('cart.checkout')}
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}