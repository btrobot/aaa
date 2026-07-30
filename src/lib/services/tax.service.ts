import { db } from '@/lib/db/db';
import { taxClasses, taxRates, taxRules } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NotFoundError, BusinessRuleError } from './errors';

// ─── 响应类型 ────────────────────────────────────────────────

export interface TaxClassResponse {
  id: number;
  title: string;
  description: string | null;
}

export interface TaxRateResponse {
  id: number;
  taxClassId: number;
  name: string;
  rate: string;
  type: string;
}

export interface TaxRuleResponse {
  id: number;
  taxClassId: number;
  taxRateId: number;
  basedOn: string;
  priority: number;
  customerGroupId: number | null;
}

// ─── Service ──────────────────────────────────────────────────

export const TaxService = {
  // ── TaxClass ──────────────────────────────────────────────

  /**
   * 列出所有税率类（含关联税率）
   */
  async listTaxClasses(): Promise<Array<TaxClassResponse & { rates: TaxRateResponse[] }>> {
    const classes = await db.select().from(taxClasses);

    const result: Array<TaxClassResponse & { rates: TaxRateResponse[] }> = [];
    for (const cls of classes) {
      const rates = await db.select()
        .from(taxRates)
        .where(eq(taxRates.taxClassId, cls.id));

      result.push({
        id: cls.id,
        title: cls.title,
        description: cls.description,
        rates: rates.map(r => ({
          id: r.id,
          taxClassId: r.taxClassId,
          name: r.name,
          rate: r.rate,
          type: r.type ?? 'percentage',
        })),
      });
    }

    return result;
  },

  /**
   * 创建税率类
   */
  async createTaxClass(data: {
    title: string;
    description?: string;
  }): Promise<TaxClassResponse> {
    const [cls] = await db.insert(taxClasses).values({
      title: data.title,
      description: data.description || null,
    }).returning();

    return {
      id: cls.id,
      title: cls.title,
      description: cls.description,
    };
  },

  // ── TaxRate ───────────────────────────────────────────────

  /**
   * 创建税率
   * pre: taxClassId 对应的税率类存在
   */
  async createTaxRate(data: {
    taxClassId: number;
    name: string;
    rate: string;
    type?: string;
  }): Promise<TaxRateResponse> {
    // pre: 税率类存在
    const existingClass = await db.select()
      .from(taxClasses)
      .where(eq(taxClasses.id, data.taxClassId))
      .limit(1);

    if (existingClass.length === 0) {
      throw new NotFoundError('税率类', data.taxClassId);
    }

    const [rate] = await db.insert(taxRates).values({
      taxClassId: data.taxClassId,
      name: data.name,
      rate: data.rate,
      type: data.type || 'percentage',
    }).returning();

    return {
      id: rate.id,
      taxClassId: rate.taxClassId,
      name: rate.name,
      rate: rate.rate,
      type: rate.type ?? 'percentage',
    };
  },

  // ── TaxRule ───────────────────────────────────────────────

  /**
   * 创建税务规则
   * pre: taxClassId 和 taxRateId 存在且属于同一类
   */
  async createTaxRule(data: {
    taxClassId: number;
    taxRateId: number;
    basedOn?: string;
    priority?: number;
    customerGroupId?: number;
  }): Promise<TaxRuleResponse> {
    // pre: 税率类存在
    const existingClass = await db.select()
      .from(taxClasses)
      .where(eq(taxClasses.id, data.taxClassId))
      .limit(1);

    if (existingClass.length === 0) {
      throw new NotFoundError('税率类', data.taxClassId);
    }

    // pre: 税率存在
    const existingRate = await db.select()
      .from(taxRates)
      .where(eq(taxRates.id, data.taxRateId))
      .limit(1);

    if (existingRate.length === 0) {
      throw new NotFoundError('税率', data.taxRateId);
    }

    // pre: 属于同一类
    if (existingRate[0].taxClassId !== data.taxClassId) {
      throw new BusinessRuleError('税率和规则必须属于同一税率类');
    }

    const [rule] = await db.insert(taxRules).values({
      taxClassId: data.taxClassId,
      taxRateId: data.taxRateId,
      basedOn: data.basedOn || 'store_address',
      priority: data.priority ?? 1,
    }).returning();

    return {
      id: rule.id,
      taxClassId: rule.taxClassId,
      taxRateId: rule.taxRateId,
      basedOn: rule.basedOn ?? 'store_address',
      priority: rule.priority ?? 1,
      customerGroupId: data.customerGroupId ?? null,
    };
  },

  /**
   * 计算税额（内部逻辑）
   * 根据 lineItems 的 taxClassId 匹配规则，按 priority 升序取第一条
   */
  async calculateTax(input: {
    orderTotal: number;
    lineItems: Array<{ taxClassId: number; subtotal: number }>;
  }): Promise<{ taxAmount: number; breakdown: Array<{ taxClassId: number; rate: string; amount: number }> }> {
    const breakdown: Array<{ taxClassId: number; rate: string; amount: number }> = [];
    let taxAmount = 0;

    for (const item of input.lineItems) {
      // 查找该 taxClassId 下按 priority 排序的规则
      const rules = await db.select()
        .from(taxRules)
        .where(eq(taxRules.taxClassId, item.taxClassId));

      if (rules.length === 0) continue;

      // 按 priority 升序排序，取第一条
      rules.sort((a, b) => (a.priority ?? 1) - (b.priority ?? 1));
      const rule = rules[0];

      // 查找对应税率
      const rateRow = await db.select()
        .from(taxRates)
        .where(eq(taxRates.id, rule.taxRateId))
        .limit(1);

      if (rateRow.length === 0) continue;

      const rate = parseFloat(rateRow[0].rate);
      const amount = item.subtotal * rate;

      // 校验：超过 100% 视为配置错误
      if (rate > 1) {
        throw new BusinessRuleError('税率超过 100%，请检查配置');
      }

      taxAmount += amount;
      breakdown.push({
        taxClassId: item.taxClassId,
        rate: rateRow[0].rate,
        amount: Math.round(amount * 100) / 100,
      });
    }

    return {
      taxAmount: Math.round(taxAmount * 100) / 100,
      breakdown,
    };
  },
};
