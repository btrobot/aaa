'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from '@/i18n/useTranslations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const { locale, t } = useTranslations();
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: productId
      ? (locale === 'zh'
          ? `我对产品 ID: ${productId} 感兴趣，请提供更多信息。`
          : `I'm interested in product ID: ${productId}, please provide more information.`)
      : '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitting(false);
    setSubmitted(true);
  };

  const contactInfo = [
    { icon: MapPin, label: t('contact.address'), value: t('contact.addressValue') },
    { icon: Phone, label: t('contact.phoneValue'), value: t('contact.phoneValue') },
    { icon: Mail, label: t('contact.emailValue'), value: t('contact.emailValue') },
    { icon: Clock, label: t('contact.workingHours'), value: t('contact.workingHoursValue') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{t('contact.title')}</h1>
          <p className="text-blue-100 text-lg">{t('contact.subtitle')}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <Card className="p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {locale === 'zh' ? '留言已发送！' : 'Message Sent!'}
                  </h3>
                  <p className="text-gray-500 mb-6">{t('contact.submitSuccess')}</p>
                  <Button onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', company: '', message: '' }); }}>
                    {locale === 'zh' ? '发送新留言' : 'Send New Message'}
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contact.form')}</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t('contact.name')} <span className="text-red-500">*</span>
                        </label>
                        <Input
                          required
                          placeholder={t('contact.name')}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t('contact.email')} <span className="text-red-500">*</span>
                        </label>
                        <Input
                          required
                          type="email"
                          placeholder={t('contact.email')}
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t('contact.phone')}
                        </label>
                        <Input
                          placeholder={t('contact.phone')}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t('contact.company')}
                        </label>
                        <Input
                          placeholder={t('contact.company')}
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t('contact.message')} <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        required
                        rows={5}
                        placeholder={t('contact.message')}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t('common.loading')}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          {t('contact.submit')}
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </Card>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('contact.info')}</h3>
              <div className="space-y-5">
                {contactInfo.map((info) => (
                  <div key={info.label} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <info.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">{info.label}</div>
                      <div className="text-sm font-medium text-gray-900">{info.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Map Placeholder */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('contact.map')}</h3>
              <div className="aspect-[16/9] rounded-lg bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    {locale === 'zh' ? '广东省广州市' : 'Guangzhou, Guangdong'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Response */}
            <Card className="p-6 bg-blue-50 border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                {locale === 'zh' ? '快速响应' : 'Quick Response'}
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                {locale === 'zh'
                  ? '我们承诺在24小时内回复您的咨询'
                  : 'We promise to respond to your inquiry within 24 hours'}
              </p>
              <div className="flex items-center gap-2 text-blue-600">
                <Phone className="h-4 w-4" />
                <span className="text-sm font-medium">{t('contact.phoneValue')}</span>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}