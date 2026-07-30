'use client';

import { useState } from 'react';
import { useTranslations } from '@/i18n/useTranslations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { MapPin, Plus, Edit2, Trash2 } from 'lucide-react';

interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { locale, t } = useTranslations();
  const [addresses, setAddresses] = useState<Address[]>([
    { id: 1, name: '张三', phone: '13800138000', address: '北京市朝阳区建国路88号 100022', isDefault: true },
    { id: 2, name: '张三', phone: '13900139000', address: '上海市浦东新区陆家嘴金融区 200120', isDefault: false },
  ]);
  const [editing, setEditing] = useState<Address | null>(null);

  const setDefault = (id: number) => {
    setAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  const remove = (id: number) => {
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900">{t('account.addresses')}</h1>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4 mr-1" /> {t('account.addAddress')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t('account.addAddress')}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2"><Label>{t('checkout.fullName')}</Label><Input placeholder="张三" /></div>
                <div className="space-y-2"><Label>{t('checkout.phone')}</Label><Input placeholder="13800138000" /></div>
                <div className="space-y-2"><Label>{t('checkout.address')}</Label><Input placeholder="详细地址" /></div>
                <Button className="w-full bg-orange-500 hover:bg-orange-600">{t('account.save')}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {addresses.map((addr) => (
            <Card key={addr.id} className={`border-0 shadow-sm ${addr.isDefault ? 'ring-2 ring-orange-200' : ''}`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{addr.name}</span>
                        <span className="text-gray-400 text-sm">{addr.phone}</span>
                        {addr.isDefault && <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">默认</Badge>}
                      </div>
                      <p className="text-sm text-gray-600">{addr.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!addr.isDefault && (
                      <Button variant="outline" size="sm" onClick={() => setDefault(addr.id)}>设为默认</Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-500">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500" onClick={() => remove(addr.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}