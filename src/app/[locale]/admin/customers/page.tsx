'use client';

import { useState } from 'react';
import { useTranslations } from '@/i18n/useTranslations';
import { Search, Mail, Phone, MapPin } from 'lucide-react';

const mockCustomers = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: ['张三', 'John Smith', '李四', 'Emma Wilson', '王五', 'Lisa Brown', '赵六', 'David Lee'][i % 8],
  email: `user${i + 1}@example.com`,
  phone: `+86 138-0000-${String(i + 1).padStart(4, '0')}`,
  orders: Math.floor(Math.random() * 20),
  spent: `$${(Math.random() * 10000 + 50).toFixed(2)}`,
  registered: `2024-01-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')}`,
  status: Math.random() > 0.15 ? 'active' : 'inactive',
}));

export default function AdminCustomers() {
  const { t } = useTranslations();
  const [search, setSearch] = useState('');

  const filtered = mockCustomers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.customers')}</h1>
        <p className="text-gray-500 mt-1">{mockCustomers.length} {t('admin.totalCustomers')}</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={t('admin.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((customer) => (
          <div key={customer.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">{customer.name[0]}</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{customer.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {customer.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {customer.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {customer.phone}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="text-gray-500">{customer.orders} orders</span>
              <span className="font-medium text-gray-900">{customer.spent}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}