'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { api, InquiryType } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, MapPin, Settings, LogOut, ChevronRight, FileText } from 'lucide-react';

const sidebarLinks = [
  { icon: User, label: 'account.profile', href: '/account' },
  { icon: Mail, label: 'account.myInquiries', href: '/account/inquiries' },
  { icon: MapPin, label: 'account.addresses', href: '/account/addresses' },
  { icon: Settings, label: 'account.settings', href: '#' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  replied: 'bg-blue-100 text-blue-700',
  closed: 'bg-gray-100 text-gray-700',
};

export default function AccountPage() {
  const locale = useLocale();
  const t = useTranslations();
  const { user, loading: authLoading, logout } = useAuth();

  const [inquiries, setInquiries] = useState<InquiryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) { setLoading(false); return; }
      try {
        const result = await api.inquiries.list();
        setInquiries(result.items.slice(0, 3));
      } catch (err) {
        console.error('Failed to load account:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50"><div className="max-w-7xl mx-auto px-4 py-6"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-100 rounded w-1/3" /><div className="h-40 bg-gray-100 rounded" /></div></div></div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center"><User className="w-16 h-16 mx-auto text-gray-300 mb-4" /><p className="text-gray-500 mb-4">{t('inquiry.loginRequired')}</p><Link href={`/${locale}/auth/login`}><Button className="bg-blue-600 hover:bg-blue-700">{t('common.login')}</Button></Link></div>
      </div>
    );
  }

  const pendingCount = inquiries.filter((i) => i.status === 'pending').length;
  const repliedCount = inquiries.filter((i) => i.status === 'replied').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">{t('account.myAccount')}</h1>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="text-center mb-4 pb-4 border-b">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <nav className="space-y-1">
                  {sidebarLinks.map((link) => (
                    <Link key={link.label} href={`/${locale}${link.href}`} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <link.icon className="w-4 h-4" />
                      <span>{t(link.label)}</span>
                    </Link>
                  ))}
                  <button
                    onClick={() => { logout(); window.location.href = `/${locale}`; }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('common.logout')}</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{inquiries.length}</p>
                  <p className="text-sm text-gray-500">{t('account.myInquiries')}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                  <p className="text-sm text-gray-500">{t('inquiry.pending')}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{repliedCount}</p>
                  <p className="text-sm text-gray-500">{t('inquiry.replied')}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">{t('inquiry.sendInquiry')}</p>
                  <p className="text-sm text-gray-500">
                    <Link href={`/${locale}/products`} className="text-blue-600 hover:underline">{t('inquiry.browseProducts')}</Link>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Inquiries */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{t('account.recentInquiries')}</h2>
                  <Link href={`/${locale}/account/inquiries`} className="text-sm text-blue-600 hover:underline">{t('common.viewAll')}</Link>
                </div>
                {inquiries.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">{t('inquiry.noInquiries')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inquiries.map((inquiry) => (
                      <div key={inquiry.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{inquiry.productSku || '-'}</p>
                            <p className="text-xs text-gray-500">{inquiry.company || inquiry.name}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <span className="text-xs text-gray-400">{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                          <Badge className={`${statusColors[inquiry.status] || 'bg-gray-100 text-gray-700'} text-xs`}>
                            {t(inquiry.status === 'pending' ? 'inquiry.pending' : inquiry.status === 'replied' ? 'inquiry.replied' : 'inquiry.closed')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Link href={`/${locale}/account/inquiries`} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">{t('account.myInquiries')}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
              </Link>
              <Link href={`/${locale}/account/addresses`} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">{t('account.myAddresses')}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
              </Link>
              <Link href={`/${locale}/products`} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">{t('inquiry.browseProducts')}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}