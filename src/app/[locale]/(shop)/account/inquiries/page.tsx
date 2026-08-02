'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { api, InquiryType } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Search, Clock, Package } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  replied: 'bg-blue-100 text-blue-700',
  closed: 'bg-gray-100 text-gray-700',
};

const statusLabels: Record<string, string> = {
  pending: 'inquiry.pending',
  replied: 'inquiry.replied',
  closed: 'inquiry.closed',
};

export default function InquiryHistoryPage() {
  const locale = useLocale();
  const t = useTranslations();
  const { user, loading: authLoading } = useAuth();
  const [inquiries, setInquiries] = useState<InquiryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) { setLoading(false); return; }
      try {
        const result = await api.inquiries.list();
        setInquiries(result.items);
      } catch (err) {
        console.error('Failed to load inquiries:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-100 rounded w-1/3" />
            <div className="h-40 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Mail className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">{t('inquiry.loginRequired')}</p>
          <Link href={`/${locale}/auth/login`}>
            <Button className="bg-blue-600 hover:bg-blue-700">{t('common.login')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">{t('account.myInquiries')}</h1>
        </div>

        {inquiries.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">{t('inquiry.noInquiries')}</p>
              <p className="text-gray-400 text-sm mb-6">{t('inquiry.noInquiriesDesc')}</p>
              <Link href={`/${locale}/products`}>
                <Button className="bg-blue-600 hover:bg-blue-700">{t('inquiry.browseProducts')}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <Card key={inquiry.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-900">
                          {t('inquiry.productSku')}: {inquiry.productSku || '-'}
                        </span>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4 mt-4 text-sm">
                        <div>
                          <span className="text-gray-400">{t('products.inquiryName')}</span>
                          <p className="text-gray-700">{inquiry.name}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">{t('products.inquiryEmail')}</span>
                          <p className="text-gray-700">{inquiry.email}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">{t('products.quantity')}</span>
                          <p className="text-gray-700">{inquiry.quantity}</p>
                        </div>
                      </div>
                      {inquiry.company && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-400">{t('products.inquiryCompany')}</span>
                          <p className="text-gray-700">{inquiry.company}</p>
                        </div>
                      )}
                      {inquiry.message && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-400">{t('products.inquiryMessage')}</span>
                          <p className="text-gray-600 mt-1 line-clamp-2">{inquiry.message}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <Badge className={`${statusColors[inquiry.status] || 'bg-gray-100 text-gray-700'} text-xs`}>
                        {t(statusLabels[inquiry.status] || 'inquiry.pending')}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </div>
                    </div>
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