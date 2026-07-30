import { db } from '@/lib/db/db';
import { notifications } from '@/lib/db/schema';
import { eq, desc, and, isNull, lt } from 'drizzle-orm';
import { NotFoundError, BusinessRuleError } from './errors';

export interface CreateNotificationInput {
  type: string;
  data?: Record<string, unknown>;
  notifiableId?: number;
  notifiableType?: string;
}

export class NotificationService {
  async list(options?: { notifiableId?: number; notifiableType?: string; unreadOnly?: boolean }) {
    const conditions = [];
    if (options?.notifiableId !== undefined) {
      conditions.push(eq(notifications.notifiableId, options.notifiableId));
    }
    if (options?.notifiableType) {
      conditions.push(eq(notifications.notifiableType, options.notifiableType));
    }
    if (options?.unreadOnly) {
      conditions.push(isNull(notifications.readAt));
    }

    const query = db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    const items = conditions.length > 0
      ? await query.where(and(...conditions))
      : await query;

    const allUnread = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(
        and(
          ...(options?.notifiableId !== undefined
            ? [eq(notifications.notifiableId, options.notifiableId)]
            : []),
          ...(options?.notifiableType
            ? [eq(notifications.notifiableType, options.notifiableType)]
            : []),
          isNull(notifications.readAt),
        ),
      );

    return { items, total: items.length, unreadCount: allUnread.length };
  }

  async getById(id: number) {
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);
    if (!notification) throw new NotFoundError('通知', id);
    return notification;
  }

  async create(input: CreateNotificationInput) {
    if (!input.type || input.type.trim() === '') {
      throw new BusinessRuleError('通知类型不能为空');
    }
    if (!input.data || !input.data.summary) {
      throw new BusinessRuleError('通知 data 必须包含 summary 字段');
    }

    const [notification] = await db
      .insert(notifications)
      .values({
        type: input.type,
        data: input.data ?? null,
        notifiableId: input.notifiableId ?? null,
        notifiableType: input.notifiableType ?? null,
      })
      .returning();
    return notification;
  }

  async markAsRead(id: number, userId?: number, userType?: string) {
    // pre: 通知存在
    const notification = await this.getById(id);

    // pre: 属于当前用户（如指定）
    if (userId !== undefined && userType !== undefined) {
      if (notification.notifiableId !== userId || notification.notifiableType !== userType) {
        throw new BusinessRuleError('无权操作此通知');
      }
    }

    const [updated] = await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return updated;
  }

  async markAllAsRead(notifiableId?: number, notifiableType?: string) {
    const conditions = [];
    if (notifiableId !== undefined) {
      conditions.push(eq(notifications.notifiableId, notifiableId));
    }
    if (notifiableType) {
      conditions.push(eq(notifications.notifiableType, notifiableType));
    }
    conditions.push(isNull(notifications.readAt));

    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(...conditions));
  }

  async delete(id: number, userId?: number, userType?: string) {
    // pre: 通知存在
    const notification = await this.getById(id);

    // pre: 属于当前用户（如指定）
    if (userId !== undefined && userType !== undefined) {
      if (notification.notifiableId !== userId || notification.notifiableType !== userType) {
        throw new BusinessRuleError('无权删除此通知');
      }
    }

    await db.delete(notifications).where(eq(notifications.id, id));
    return true;
  }

  async deleteOld(days: number = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    await db
      .delete(notifications)
      .where(and(lt(notifications.createdAt, cutoff)));
  }
}

export const notificationService = new NotificationService();
