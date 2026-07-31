'use client';

import { useState, useEffect } from 'react';
import { Star, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

interface Review {
  id: number;
  productId: number;
  customerId: number;
  rating: number;
  content: string | null;
  status: boolean;
  createdAt: string;
  customerName: string;
}

interface ReviewStats {
  average: number;
  total: number;
  distribution: Record<number, number>;
}

interface ProductReviewsProps {
  productId: number;
  locale: string;
}

export function ProductReviews({ productId, locale }: ProductReviewsProps) {
  const t = useTranslations('product');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/reviews?productId=${productId}&status=true`).then(r => r.json()),
      fetch(`/api/reviews/stats?productId=${productId}`).then(r => r.json()),
    ]).then(([reviewsData, statsData]) => {
      setReviews(reviewsData.items || []);
      setStats(statsData);
    }).catch(() => setError('加载评价失败')).finally(() => setLoading(false));
  }, [productId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, customerId: 1, rating, content: content || undefined }),
      });
      if (!res.ok) throw new Error('提交失败');
      setContent('');
      setRating(5);
      // 重新加载
      const [reviewsData, statsData] = await Promise.all([
        fetch(`/api/reviews?productId=${productId}&status=true`).then(r => r.json()),
        fetch(`/api/reviews/stats?productId=${productId}`).then(r => r.json()),
      ]);
      setReviews(reviewsData.items || []);
      setStats(statsData);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '未知错误');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return locale === 'zh_cn'
      ? `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
      : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const renderStars = (n: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => {
      const filled = (interactive ? (hoverRating || rating) : n) > i;
      return (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setRating(i + 1)}
          onMouseEnter={() => interactive && setHoverRating(i + 1)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`transition-colors ${interactive ? 'cursor-pointer' : 'cursor-default'} ${filled ? 'text-yellow-400' : 'text-gray-200'}`}
        >
          <Star className="w-5 h-5 fill-current" />
        </button>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-gray-400">
        <Clock className="w-4 h-4 animate-spin" />
        <span className="text-sm">加载评价...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Summary */}
      {stats && stats.total > 0 && (
        <div className="flex items-center gap-8 p-6 bg-gray-50 rounded-xl">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">{stats.average}</div>
            <div className="flex mt-1">{renderStars(Math.round(stats.average))}</div>
            <div className="text-sm text-gray-500 mt-1">{stats.total} 条评价</div>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map(n => {
              const pct = stats.total > 0 ? (stats.distribution[n] / stats.total) * 100 : 0;
              return (
                <div key={n} className="flex items-center gap-2 text-sm">
                  <span className="w-8 text-gray-600">{n}星</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-gray-400 text-xs">{stats.distribution[n]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write Review */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">{t('writeReview')}</h4>
          <div className="flex gap-1">{renderStars(rating, true)}</div>
          <Textarea
            placeholder={locale === 'zh_cn' ? '分享您的使用体验...' : 'Share your experience...'}
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
          />
          <Button onClick={handleSubmit} disabled={submitting} size="sm">
            {submitting ? '提交中...' : locale === 'zh_cn' ? '提交评价' : 'Submit Review'}
          </Button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p className="text-center py-8 text-gray-400">{t('noReviews')}</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{review.customerName}</span>
                    <div className="flex">{renderStars(review.rating)}</div>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                </div>
                {review.content && (
                  <p className="text-sm text-gray-600 ml-10">{review.content}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}