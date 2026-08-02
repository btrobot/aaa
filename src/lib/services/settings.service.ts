import { db } from '@/lib/db/db';
import { settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const updateSettingsSchema = z.record(z.string(), z.any());

export const SettingsService = {
  /**
   * 获取所有设置
   */
  async getAll(locale?: string) {
    const rows = await db.select().from(settings);
    const result: Record<string, string> = {};
    for (const row of rows) {
      result[row.key] = row.value ?? '';
    }
    return result;
  },

  /**
   * 获取单个设置值
   */
  async get(key: string): Promise<string | null> {
    const [row] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);
    return row?.value ?? null;
  },

  /**
   * 更新所有设置（全量替换）
   */
  async updateAll(data: Record<string, string | null>, locale?: string) {
    for (const [key, value] of Object.entries(data)) {
      const existing = await db
        .select({ id: settings.id })
        .from(settings)
        .where(eq(settings.key, key))
        .limit(1);

      if (existing.length > 0) {
        if (value === null) {
          await db.delete(settings).where(eq(settings.key, key));
        } else {
          await db.update(settings).set({ value }).where(eq(settings.key, key));
        }
      } else if (value !== null) {
        await db.insert(settings).values({ key, value });
      }
    }
    return SettingsService.getAll(locale);
  },
};