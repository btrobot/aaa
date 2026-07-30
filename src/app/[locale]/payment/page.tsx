'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useTranslations } from '@/i18n/useTranslations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params.locale as string) || 'zh';
  const { t } = useTranslations();

  const orderNumber = searchParams.get('orderNumber') || '';
  const paymentId = searchParams.get('paymentId') || '';
  const status = searchParams.get('status') || 'processing';
  const [processing, setProcessing] = useState(true);
  const [result, setResult] = useState<'success' | 'failed'>('success');

  useEffect(() => {
    if (!orderNumber || !paymentId) {
      setProcessing(false);
      setResult('failed');
      return;
    }

    // 模拟支付确认过程
    const timer = setTimeout(async () => {
      try {
        if (status === 'success') {
          await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'confirm', orderNumber, paymentId }),
          });
          setResult('success');
        } else {
          await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'fail', orderNumber }),
          });
          setResult('failed');
        }
      } catch (_err) {
        setResult('failed');
      } finally {
        setProcessing(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [orderNumber, paymentId, status]);

  if (processing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-12 text-center">
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">正在处理支付...</h2>
            <p className="text-gray-500 text-sm">请稍候，正在确认您的支付</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="py-12 text-center">
          {result === 'success' ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">支付成功！</h2>
              <p className="text-gray-500 text-sm mb-6">
                订单 {orderNumber} 已支付成功，我们将尽快为您安排发货。
              </p>
              <div className="flex justify-center gap-3">
                <Link href={`/${locale}/account/orders`}>
                  <Button variant="outline">
                    <ShoppingBag className="w-4 h-4 mr-1" /> 查看订单
                  </Button>
                </Link>
                <Link href={`/${locale}/products`}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    继续购物 <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">支付失败</h2>
              <p className="text-gray-500 text-sm mb-6">
                支付处理过程中出现错误，请重试或联系客服。
              </p>
              <div className="flex justify-center gap-3">
                <Link href={`/${locale}/account/orders`}>
                  <Button variant="outline">返回订单</Button>
                </Link>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.back()}
                >
                  重试支付
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}