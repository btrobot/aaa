'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/i18n/useTranslations';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cookie, Lock, Mail, User } from 'lucide-react';

export default function RegisterPage() {
  const { locale, t } = useTranslations();
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register({ email: form.email, password: form.password, name: form.name });
      router.push(`/${locale}/account`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Cookie className="w-7 h-7 text-blue-600" />
          </div>
          <CardTitle className="text-xl">{t('auth.createAccount')}</CardTitle>
          <CardDescription>{t('auth.registerDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('auth.name')}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input id="name" className="pl-10" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input id="email" type="email" className="pl-10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input id="password" type="password" className="pl-10" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input id="confirmPassword" type="password" className="pl-10" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
              </div>
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? t('common.loading') : t('auth.register')}
            </Button>
            <p className="text-center text-sm text-gray-500">
              {t('auth.hasAccount')}{' '}
              <Link href={`/${locale}/auth/login`} className="text-blue-600 hover:underline font-medium">{t('auth.login')}</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
