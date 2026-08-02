'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Mail, Send, CheckCircle } from 'lucide-react';

interface InquiryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productSku: string;
}

export function InquiryModal({ open, onOpenChange, productName, productSku }: InquiryModalProps) {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    quantity: '1',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = [
      `Product: ${productName}`,
      `SKU: ${productSku}`,
      `---`,
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      `Phone: ${formData.phone}`,
      `Company: ${formData.company}`,
      `Quantity: ${formData.quantity}`,
      `---`,
      `Message:`,
      formData.message,
    ].join('\n');

    const subject = encodeURIComponent(`Inquiry: ${productName} (${productSku})`);
    window.location.href = `mailto:sales@nodecoda.com?subject=${subject}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <DialogTitle className="text-xl mb-2">{t('products.inquirySent')}</DialogTitle>
            <p className="text-gray-500">{t('products.inquirySentDesc')}</p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setSubmitted(false);
                onOpenChange(false);
              }}
            >
              {t('common.close')}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                {t('products.inquiryTitle')}
              </DialogTitle>
              <DialogDescription>
                {t('products.inquiryFormDesc')}
              </DialogDescription>
            </DialogHeader>

            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-blue-900">{productName}</p>
              <p className="text-xs text-blue-700">SKU: {productSku}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('products.inquiryName')}</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('products.inquiryEmail')}</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('products.inquiryPhone')}</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">{t('products.inquiryCompany')}</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">{t('products.quantity')}</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{t('products.inquiryMessage')}</Label>
                <Textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder={t('products.inquiryMessagePlaceholder')}
                />
              </div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                <Send className="w-4 h-4 mr-2" />
                {t('products.sendInquiry')}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}