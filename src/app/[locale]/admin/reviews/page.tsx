'use client';

import { useState, useEffect } from 'react';
import { Star, Trash2, Search, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface Review {
  id: number;
  productId: number;
  customerId: number;
  customerName: string;
  rating: number;
  content: string | null;
  status: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const router = useRouter();

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews?pageSize=100');
      const data = await res.json();
      setReviews(data.items || []);
    } catch (e: unknown) {
      setError('加载评价失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReviews(); }, []);

  const toggleStatus = async (id: number, current: boolean) => {
    try {
      await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: !current }),
      });
      setReviews(reviews.map(r => r.id === id ? { ...r, status: !current } : r));
    } catch (e: unknown) {
      setError('操作失败');
    }
  };

  const deleteReview = async (id: number) => {
    if (!confirm('确定删除此评价？')) return;
    try {
      await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      setReviews(reviews.filter(r => r.id !== id));
    } catch (e: unknown) {
      setError('删除失败');
    }
  };

  const filtered = reviews.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.customerName.toLowerCase().includes(q) || r.content?.toLowerCase().includes(q);
  });

  const renderStars = (n: number) => (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= n ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
      ))}
    </span>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">评价管理</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索评价内容/用户..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">暂无评价</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(review => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{review.customerName}</span>
                      {renderStars(review.rating)}
                      <Badge variant={review.status ? 'default' : 'secondary'} className="text-xs">
                        {review.status ? '已显示' : '已隐藏'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400">产品ID: {review.productId} | 评价ID: {review.id}</p>
                    {review.content && (
                      <p className="text-sm text-gray-600 mt-1">{review.content}</p>
                    )}
                    <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleString('zh-CN')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus(review.id, review.status)}
                      title={review.status ? '隐藏' : '显示'}
                    >
                      {review.status ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteReview(review.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}