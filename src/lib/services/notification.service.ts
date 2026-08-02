import { db } from '@/lib/db/db';
import { notifications } from '@/lib/db/schema';
import { eq, desc, and, count, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { NotFoundError } from './errors';

export const createNotificationSchema = z.object({
  type: z.string().min(1),
  data: z.any().optional(),
  notifiableId: z.number(),
  notifiableType: z.string().min(1),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

export const NotificationService = {
  /**
   * 创建通知（通常由系统事件触发，不直接暴露给普通用户）
   */
  async create(input: CreateNotificationInput) {
    const validated = createNotificationSchema.parse(input);
    const [notification] = await db
      .insert(notifications)
      .values({
        type: validated.type,
        data: validated.data ?? null,
        notifiableId: validated.notifiableId,
        notifiableType: validated.notifiableType,
      })
      .returning();
    return notification;
  },

  /**
   * 查询通知列表
   */
  async list(params: {
    notifiableId: number;
    notifiableType: string;
    unreadOnly?: boolean;
    page?: number;
    pageSize?: number;
  }) {
    const { notifiableId, notifiableType, unreadOnly, page = 1, pageSize = 20 } = params;
    const conditions = [
      eq(notifications.notifiableId, notifiableId),
      eq(notifications.notifiableType, notifiableType),
    ];
    if (unreadOnly) {
      conditions.push(isNull(notifications.readAt));
    }

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db
        .select({ count: count(notifications.id) })
        .from(notifications)
        .where(and(...conditions)),
    ]);

    return { items, total: totalResult[0]?.count ?? 0 };
  },

  /**
   * 标记单条通知为已读
   */
  async markAsRead(id: number, notifiableId: number) {
    const [notification] = await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.notifiableId, notifiableId),
        ),
      )
      .returning();
    if (!notification) throw new NotFoundError('通知', id);
    return notification;
  },

  /**
   * 批量标记所有通知为已读
   */
  async markAllAsRead(notifiableId: number, notifiableType: string) {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notifications.notifiableId, notifiableId),
          eq(notifications.notifiableType, notifiableType),
        ),
      );
    return { success: true };
  },

  /**
   * 删除通知
   */
  async delete(id: number, notifiableId: number) {
    const [notification] = await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.notifiableId, notifiableId),
        ),
      )
      .returning();
    if (!notification) throw new NotFoundError('通知', id);
    return notification;
  },

  /**
   * 按 ID 获取通知（不校验所有权，调用方自行校验）
   */
  async getById(id: number) {
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);
    return notification ?? null;
  },
};