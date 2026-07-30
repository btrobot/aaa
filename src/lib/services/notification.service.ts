import { db } from '@/lib/db/db';
import { notifications } from '@/lib/db/schema';
import { eq, desc, and, isNull, lt } from 'drizzle-orm';

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

    // Count unread
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
    return notification || null;
  }

  async create(input: CreateNotificationInput) {
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

  async markAsRead(id: number) {
    const [notification] = await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
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

  async delete(id: number) {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  async deleteOld(days: number = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    await db
      .delete(notifications)
      .where(
        and(
          ...(notifications.createdAt ? [lt(notifications.createdAt, cutoff)] : []),
        ),
      );
  }
}

export const notificationService = new NotificationService();