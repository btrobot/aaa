import { db } from '@/lib/db/db';
import { settings } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface SettingGroup {
  [key: string]: string | null;
}

export class SettingsService {
  /** 获取所有设置 */
  async getAll(locale?: string): Promise<SettingGroup> {
    const rows = await db.select().from(settings);
    const result: SettingGroup = {};

    // 先处理全局设置 (locale = null)
    const globalRows = rows.filter((r) => !r.locale);
    for (const row of globalRows) {
      result[row.key] = row.value;
    }

    // 如果指定 locale，覆盖本地化值
    if (locale) {
      const localized = rows.filter((r) => r.locale === locale);
      for (const row of localized) {
        result[row.key] = row.value;
      }
    }
    return result;
  }

  /** 批量更新设置 */
  async updateAll(data: Record<string, string | null>, locale?: string) {
    const entries = Object.entries(data);
    for (const [key, value] of entries) {
      const existing = await db.select()
        .from(settings)
        .where(
          locale
            ? and(eq(settings.key, key), eq(settings.locale, locale))
            : and(eq(settings.key, key), eq(settings.locale, ''))
        )
        .limit(1);

      if (existing.length > 0) {
        await db.update(settings)
          .set({ value })
          .where(eq(settings.id, existing[0].id));
      } else {
        await db.insert(settings).values({
          key,
          value,
          locale: locale || null,
        });
      }
    }
    return this.getAll(locale);
  }

  /** 获取单个设置 */
  async get(key: string, locale?: string): Promise<string | null> {
    const rows = await db.select()
      .from(settings)
      .where(
        locale
          ? and(eq(settings.key, key), eq(settings.locale, locale))
          : and(eq(settings.key, key), eq(settings.locale, ''))
      )
      .limit(1);
    if (rows[0]?.value) return rows[0].value;
    // 回退到全局设置
    const global = await db.select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);
    return global[0]?.value || null;
  }
}

export const settingsService = new SettingsService();