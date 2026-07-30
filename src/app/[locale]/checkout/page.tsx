'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronRight, CreditCard, Building, Wallet } from 'lucide-react';

export default function CheckoutPage() {
  const { locale, t } = useTranslations();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', address: '', city: '', state: '', zip: '', country: '中国',
    note: '', paymentMethod: 'alipay',
  });

  const subtotal = 12997;
  const shipping = 0;
  const total = subtotal + shipping;

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('checkout.title')}</h1>

        {/* Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>{s}</div>
              <span className={`ml-2 text-sm ${step >= s ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
                {s === 1 ? t('checkout.address') : s === 2 ? t('checkout.payment') : t('checkout.confirm')}
              </span>
              {i < 2 && <ChevronRight className="h-4 w-4 text-gray-300 mx-4" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Address */}
            {step === 1 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('checkout.shippingAddress')}</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('checkout.fullName')}</Label>
                      <Input value={formData.name} onChange={(e) => updateField('name', e.target.value)} placeholder="张三" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('checkout.phone')}</Label>
                      <Input value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="13800138000" />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <Label>{t('checkout.email')}</Label>
                      <Input value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="email@example.com" />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <Label>{t('checkout.address')}</Label>
                      <Input value={formData.address} onChange={(e) => updateField('address', e.target.value)} placeholder="北京市朝阳区xxx路xx号" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('checkout.city')}</Label>
                      <Input value={formData.city} onChange={(e) => updateField('city', e.target.value)} placeholder="北京" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('checkout.zipCode')}</Label>
                      <Input value={formData.zip} onChange={(e) => updateField('zip', e.target.value)} placeholder="100000" />
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <Label>{t('checkout.orderNote')}</Label>
                    <Input value={formData.note} onChange={(e) => updateField('note', e.target.value)} placeholder={t('checkout.notePlaceholder')} />
                  </div>
                  <Button className="mt-6 bg-orange-500 hover:bg-orange-600" onClick={() => setStep(2)}>
                    {t('checkout.nextStep')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('checkout.paymentMethod')}</h2>
                  <RadioGroup value={formData.paymentMethod} onValueChange={(v) => updateField('paymentMethod', v)} className="space-y-3">
                    {[
                      { value: 'alipay', icon: Wallet, label: '支付宝' },
                      { value: 'wechat', icon: Building, label: '微信支付' },
                      { value: 'card', icon: CreditCard, label: '银行卡支付' },
                    ].map((method) => (
                      <label key={method.value} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                        formData.paymentMethod === method.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <RadioGroupItem value={method.value} />
                        <method.icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-900">{method.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setStep(1)}>{t('checkout.prevStep')}</Button>
                    <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setStep(3)}>
                      {t('checkout.nextStep')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('checkout.confirmOrder')}</h2>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-4">
                    <h3 className="font-medium text-gray-900">{t('checkout.shippingAddress')}</h3>
                    <p className="text-sm text-gray-600">{formData.name} | {formData.phone}</p>
                    <p className="text-sm text-gray-600">{formData.address} {formData.city} {formData.zip}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
                    <h3 className="font-medium text-gray-900">{t('checkout.paymentMethod')}</h3>
                    <p className="text-sm text-gray-600">
                      {formData.paymentMethod === 'alipay' ? '支付宝' : formData.paymentMethod === 'wechat' ? '微信支付' : '银行卡支付'}
                    </p>
                  </div>
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-base font-semibold"
                    onClick={() => alert(t('checkout.orderSuccess'))}
                  >
                    {t('checkout.submitOrder')} (¥{total.toLocaleString()})
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="border-0 shadow-sm sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">{t('cart.orderSummary')}</h3>
                <div className="space-y-3">
                  {[
                    { name: 'iPhone 15 Pro Max', qty: 1, price: 8999 },
                    { name: 'Sony WH-1000XM5', qty: 2, price: 2499 },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate max-w-[180px]">{item.name} x{item.qty}</span>
                      <span className="text-gray-900 font-medium">¥{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{t('cart.subtotal')}</span>
                    <span>¥{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{t('cart.shipping')}</span>
                    <span className="text-green-600">{t('cart.freeShipping')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>{t('cart.total')}</span>
                    <span className="text-orange-600">¥{total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}