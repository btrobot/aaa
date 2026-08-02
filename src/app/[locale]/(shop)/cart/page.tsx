'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { toApiLocale } from '@/lib/locales';
import type { CartItemData } from '@/lib/types';

export default function CartPage() {
  const locale = useLocale();
  const t = useTranslations();
  const { user, loading: authLoading } = useAuth();
  
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    api.cart.get(toApiLocale(locale)).then(setCartItems).catch(console.error).finally(() => setLoading(false));
  }, [user, authLoading, locale]);

  const updateQty = async (id: number, qty: number) => {
    if (qty < 1) return;
    await api.cart.update(id, qty);
    setCartItems(items => items.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const removeItem = async (id: number) => {
    await api.cart.remove(id);
    setCartItems(items => items.filter(i => i.id !== id));
  };

  if (authLoading || loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>{t('common.loading')}</p></div>;
  if (!user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><p className="text-gray-500 mb-4">{t('auth.loginTitle')}</p><Link href={`/${locale}/auth/login`}><Button>{t('auth.login')}</Button></Link></div></div>;

  const total = cartItems.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">{t('cart.title')}</h1>
          <span className="text-sm text-gray-500">({cartItems.length} {t('cart.items')})</span>
        </div>
        {cartItems.length === 0 ? (
          <div className="text-center py-16"><ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" /><p className="text-gray-500 mb-4">{t('cart.empty')}</p><Link href={`/${locale}/products`}><Button>{t('cart.continueShopping')}</Button></Link></div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="flex gap-4 p-4">
                    <div style={{ position: 'relative' }} className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {item.image ? <Image src={item.image} alt={item.productName} fill sizes="80px" className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">无图</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{item.productName}</h3>
                      <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      <p className="text-lg font-bold text-blue-600 mt-1">¥{parseFloat(item.price).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1}><Minus className="w-3 h-3" /></Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQty(item.id, item.quantity + 1)}><Plus className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeItem(item.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div>
              <Card className="sticky top-24"><CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold">{t('cart.summary')}</h2>
                <div className="flex justify-between"><span className="text-gray-500">{t('cart.subtotal')}</span><span className="font-medium">¥{total.toLocaleString()}</span></div>
                <div className="border-t pt-4 flex justify-between"><span className="font-semibold">{t('cart.total')}</span><span className="text-xl font-bold text-blue-600">¥{total.toLocaleString()}</span></div>
                <Link href={`/${locale}/checkout`}><Button className="w-full bg-blue-600 hover:bg-blue-700">{t('cart.checkout')}</Button></Link>
                <Link href={`/${locale}/products`}><Button variant="outline" className="w-full"><ArrowLeft className="w-4 h-4 mr-2" />{t('cart.continueShopping')}</Button></Link>
              </CardContent></Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
