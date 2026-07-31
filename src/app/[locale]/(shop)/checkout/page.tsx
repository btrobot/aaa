'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/i18n/useTranslations';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronRight, CreditCard, Building, Wallet, Truck, ShoppingBag } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';

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

interface ShippingMethod {
  id: number;
  code: string;
  icon: string | null;
  baseFee: string;
  freeShippingThreshold: string | null;
  estimatedDays: string | null;
  name: string;
  description: string | null;
}

export default function CheckoutPage() {
  const { locale, t } = useTranslations();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', address: '', city: '', state: '', zip: '', country: '中国',
    note: '', paymentMethod: 'alipay',
  });

  useEffect(() => {
    async function load() {
      try {
        const [items, methods] = await Promise.all([
          api.cart.get(toApiLocale(locale)),
          api.shipping.list(toApiLocale(locale)),
        ]);
        setCartItems(items);
        setShippingMethods(methods);
        if (methods.length > 0) {
          setSelectedShippingId(methods[0].id);
        }
      } catch (err) {
        console.error('Failed to load checkout data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [locale]);

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  // 计算运费
  const selectedMethod = shippingMethods.find(m => m.id === selectedShippingId);
  const shippingFee = selectedMethod
    ? (selectedMethod.freeShippingThreshold && subtotal >= parseFloat(selectedMethod.freeShippingThreshold)
      ? 0
      : parseFloat(selectedMethod.baseFee))
    : 0;
  const total = subtotal + shippingFee;

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitOrder = async () => {
    if (!selectedMethod) return;
    setSubmitting(true);
    try {
      const order = await api.orders.create({
        shippingAddress: formData,
        shippingMethod: selectedMethod.code,
        shippingFee: shippingFee.toFixed(2),
        paymentMethod: formData.paymentMethod,
        customerNote: formData.note,
      });
      // 创建支付并跳转
      const payResult = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', orderId: order.id }),
      });
      const payData = await payResult.json();
      // 模拟支付成功跳转（实际项目中跳转到 Stripe/PayPal Checkout URL）
      router.push(`/${locale}/payment?orderNumber=${order.orderNumber || order.number}&paymentId=${payData.paymentId}&status=success`);
    } catch (err) {
      console.error('Failed to create order:', err);
      alert('提交订单失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceedToStep2 = formData.name && formData.phone && formData.address && formData.city;
  const canProceedToStep3 = selectedShippingId !== null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-100 rounded w-1/3" />
            <div className="h-40 bg-gray-100 rounded" />
            <div className="h-24 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('cart.emptyTitle')}</h2>
          <Link href={`/${locale}/products`}>
            <Button className="bg-blue-600 hover:bg-blue-700">{t('products.backToProducts')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[
          { label: t('nav.products'), href: `/${locale}/products` },
          { label: t('checkout.title') },
        ]} />
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('checkout.title')}</h1>

        {/* Steps Indicator */}
        <div className="flex items-center gap-2 mb-8 text-sm flex-wrap">
          <span className={`px-3 py-1.5 rounded-full ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
            1. {t('checkout.shippingAddress')}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <span className={`px-3 py-1.5 rounded-full ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
            2. {t('checkout.shippingMethod')}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <span className={`px-3 py-1.5 rounded-full ${step === 3 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
            3. {t('checkout.paymentMethod')}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <span className={`px-3 py-1.5 rounded-full ${step === 4 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
            4. {t('cart.confirmOrder')}
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Address */}
            {step === 1 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('checkout.shippingAddress')}</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('cart.name')}</Label>
                    <Input value={formData.name} onChange={(e) => updateField('name', e.target.value)} placeholder={t('cart.name')} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('cart.phone')}</Label>
                    <Input value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder={t('cart.phone')} />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label>{t('cart.email')}</Label>
                    <Input value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="email@example.com" />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label>{t('cart.address')}</Label>
                    <Input value={formData.address} onChange={(e) => updateField('address', e.target.value)} placeholder={t('cart.address')} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('cart.city')}</Label>
                    <Input value={formData.city} onChange={(e) => updateField('city', e.target.value)} placeholder={t('cart.city')} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('cart.state')}</Label>
                    <Input value={formData.state} onChange={(e) => updateField('state', e.target.value)} placeholder={t('cart.state')} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('cart.zip')}</Label>
                    <Input value={formData.zip} onChange={(e) => updateField('zip', e.target.value)} placeholder={t('cart.zip')} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('cart.country')}</Label>
                    <Input value={formData.country} onChange={(e) => updateField('country', e.target.value)} />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label>{t('cart.orderNote')}</Label>
                    <Input value={formData.note} onChange={(e) => updateField('note', e.target.value)} placeholder={t('cart.orderNote')} />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => setStep(2)} className="bg-blue-600 hover:bg-blue-700" disabled={!canProceedToStep2}>
                    {t('cart.nextStep')} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 2: Shipping Method */}
            {step === 2 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('checkout.shippingMethod')}</h2>
                {shippingMethods.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">{t('common.loading')}</p>
                ) : (
                  <RadioGroup value={String(selectedShippingId)} onValueChange={(v) => setSelectedShippingId(Number(v))}>
                    <div className="space-y-3">
                      {shippingMethods.map((method) => {
                        const isFree = method.freeShippingThreshold && subtotal >= parseFloat(method.freeShippingThreshold);
                        const fee = isFree ? 0 : parseFloat(method.baseFee);
                        return (
                          <label
                            key={method.id}
                            className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/50`}
                          >
                            <RadioGroupItem value={String(method.id)} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Truck className="w-5 h-5 text-blue-600 shrink-0" />
                                <span className="text-sm font-medium text-gray-900">{method.name}</span>
                                {method.estimatedDays && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                    {method.estimatedDays} {locale === 'en' ? 'days' : '天'}
                                  </span>
                                )}
                              </div>
                              {method.description && (
                                <p className="text-xs text-gray-500 mt-1">{method.description}</p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <span className={`text-sm font-semibold ${isFree ? 'text-green-600' : 'text-gray-900'}`}>
                                {isFree ? (locale === 'en' ? 'Free' : '免费') : `¥${fee}`}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </RadioGroup>
                )}
                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>{t('common.back')}</Button>
                  <Button onClick={() => setStep(3)} className="bg-blue-600 hover:bg-blue-700" disabled={!canProceedToStep3}>
                    {t('cart.nextStep')} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 3: Payment Method */}
            {step === 3 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('checkout.paymentMethod')}</h2>
                <RadioGroup value={formData.paymentMethod} onValueChange={(v) => updateField('paymentMethod', v)}>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                      <RadioGroupItem value="alipay" />
                      <Wallet className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium">支付宝</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                      <RadioGroupItem value="wechat" />
                      <CreditCard className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium">微信支付</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                      <RadioGroupItem value="bank" />
                      <Building className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium">{t('cart.bankTransfer')}</span>
                    </label>
                  </div>
                </RadioGroup>
                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>{t('common.back')}</Button>
                  <Button onClick={() => setStep(4)} className="bg-blue-600 hover:bg-blue-700">
                    {t('cart.nextStep')} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 4: Confirm Order */}
            {step === 4 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('cart.confirmOrder')}</h2>
                
                {/* Shipping Info */}
                {selectedMethod && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-900">{selectedMethod.name}</span>
                      <span className="text-gray-500">|</span>
                      <span className="text-gray-600">{shippingFee === 0 ? (locale === 'en' ? 'Free' : '免费') : `¥${shippingFee}`}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formData.address}, {formData.city}, {formData.state} {formData.zip}</p>
                  </div>
                )}

                {/* Cart Items */}
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium">¥{Number(item.price).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(3)}>{t('common.back')}</Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleSubmitOrder}
                    disabled={submitting}
                  >
                    {submitting ? t('common.loading') : t('checkout.placeOrder')}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4">{t('checkout.orderSummary')}</h3>
              <div className="space-y-3 text-sm">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-gray-600 truncate max-w-[180px]">{item.productName} x{item.quantity}</span>
                    <span className="font-medium">¥{Number(item.price).toLocaleString()}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('checkout.subtotal')}</span>
                  <span className="font-medium">¥{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('checkout.shipping')}</span>
                  <span className={`font-medium ${shippingFee === 0 ? 'text-green-600' : ''}`}>
                    {shippingFee === 0 ? (locale === 'en' ? 'Free' : '免费') : `¥${shippingFee}`}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-base">
                  <span className="font-semibold">{t('checkout.total')}</span>
                  <span className="font-bold text-blue-600 text-lg">¥{total.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}