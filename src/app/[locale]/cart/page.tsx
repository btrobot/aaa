'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { products } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  options: string;
}

export default function CartPage() {
  const { locale, t } = useTranslations();
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: 1, productId: 1, name: 'iPhone 15 Pro Max', image: 'https://picsum.photos/seed/iphone15/600/600', price: 8999, quantity: 1, options: '黑色 / 256GB' },
    { id: 2, productId: 4, name: 'Sony WH-1000XM5', image: 'https://picsum.photos/seed/sonyxm5/600/600', price: 2499, quantity: 2, options: '黑色' },
    { id: 3, productId: 3, name: 'Nike Air Max 270', image: 'https://picsum.photos/seed/airmax270/600/600', price: 1299, quantity: 1, options: '42码 / 白色' },
  ]);

  const [couponCode, setCouponCode] = useState('');

  const updateQuantity = (id: number, delta: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Math.min(99, item.quantity + delta)) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 500 ? 0 : 30;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingBag className="h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">{t('cart.title')}</h1>
          <span className="text-gray-400">({cartItems.length} {t('cart.items')})</span>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-500 mb-2">{t('cart.empty')}</h2>
            <p className="text-gray-400 mb-6">{t('cart.emptyDesc')}</p>
            <Link href={`/${locale}/products`}>
              <Button className="bg-orange-500 hover:bg-orange-600">{t('cart.continueShopping')}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Link href={`/${locale}/products/${item.productId}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link href={`/${locale}/products/${item.productId}`} className="text-sm sm:text-base font-medium text-gray-900 hover:text-orange-600 line-clamp-1">
                              {item.name}
                            </Link>
                            <p className="text-xs text-gray-500 mt-1">{item.options}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1.5 hover:bg-gray-50 transition-colors"
                            >
                              <Minus className="h-3.5 w-3.5 text-gray-600" />
                            </button>
                            <span className="px-4 py-1.5 font-medium text-gray-900 text-sm min-w-[40px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1.5 hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5 text-gray-600" />
                            </button>
                          </div>
                          <span className="text-base font-bold text-orange-600">
                            ¥{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-between items-center pt-2">
                <Link href={`/${locale}/products`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600">
                  <ArrowLeft className="h-4 w-4" /> {t('cart.continueShopping')}
                </Link>
                <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-1" /> {t('cart.clearCart')}
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="border-0 shadow-sm sticky top-24">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">{t('cart.orderSummary')}</h3>

                  {/* Coupon */}
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder={t('cart.couponPlaceholder')}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="text-sm"
                    />
                    <Button variant="outline" size="sm" className="shrink-0">{t('cart.apply')}</Button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>{t('cart.subtotal')}</span>
                      <span>¥{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>{t('cart.shipping')}</span>
                      <span>{shipping === 0 ? <span className="text-green-600">{t('cart.freeShipping')}</span> : `¥${shipping}`}</span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-xs text-gray-400">满 ¥500 免运费，还差 ¥{(500 - subtotal).toLocaleString()}</p>
                    )}
                    <Separator />
                    <div className="flex justify-between text-base font-bold text-gray-900">
                      <span>{t('cart.total')}</span>
                      <span className="text-orange-600">¥{total.toLocaleString()}</span>
                    </div>
                  </div>

                  <Link href={`/${locale}/checkout`}>
                    <Button className="w-full mt-6 bg-orange-500 hover:bg-orange-600 h-12 text-base font-semibold">
                      {t('cart.checkout')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}