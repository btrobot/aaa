'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Bell, Check, CheckCheck, Trash2, Info, AlertTriangle, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';

interface Notification {
  id: number;
  type: string;
  data: Record<string, unknown> | null;
  notifiableId: number | null;
  notifiableType: string | null;
  readAt: string | null;
  createdAt: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  order: <ShoppingCart className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
};

const typeLabels: Record<string, string> = {
  order: '订单',
  info: '信息',
  warning: '警告',
};

export default function NotificationsAdminPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    try {
      const url = filter === 'unread'
        ? '/api/notifications?unreadOnly=true'
        : '/api/notifications';
      const res = await fetch(url);
      const data = await res.json();
      setNotifications(data.items ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      toast.error('加载通知失败');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkRead = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read' }),
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch {
      toast.error('操作失败');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      });
      if (res.ok) {
        toast.success('已全部标记为已读');
        fetchNotifications();
      }
    } catch {
      toast.error('操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该通知？')) return;
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      toast.success('通知已删除');
      fetchNotifications();
    } catch {
      toast.error('删除失败');
    }
  };

  const getSummary = (n: Notification) => {
    if (n.data?.summary) return String(n.data.summary);
    if (n.type === 'order') return '新订单通知';
    return n.type;
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">通知管理</h1>
            <p className="text-muted-foreground text-sm">
              共 {notifications.length} 条
              {unreadCount > 0 && `，${unreadCount} 条未读`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
            全部
          </Button>
          <Button variant={filter === 'unread' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('unread')}>
            未读 ({unreadCount})
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="mr-1 h-4 w-4" /> 全部已读
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {notifications.map((n) => (
          <Card
            key={n.id}
            className={`transition-colors ${!n.readAt ? 'border-primary/30 bg-primary/5' : ''}`}
          >
            <CardContent className="flex items-start gap-4 p-4">
              <div className="mt-1 text-muted-foreground">
                {typeIcons[n.type] || <Bell className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {typeLabels[n.type] || n.type}
                  </Badge>
                  {!n.readAt && (
                    <Badge variant="default" className="text-xs bg-primary">新</Badge>
                  )}
                </div>
                <p className="text-sm">{getSummary(n)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(n.createdAt), 'yyyy-MM-dd HH:mm')}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                {!n.readAt && (
                  <Button variant="ghost" size="icon" onClick={() => handleMarkRead(n.id)} title="标记已读">
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleDelete(n.id)} title="删除">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>暂无通知</p>
          </div>
        )}
      </div>
    </div>
  );
}