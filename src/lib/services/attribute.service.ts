import { db } from '@/lib/db/db';
import {
  attributeGroups, attributeGroupDescriptions,
  attributes, attributeDescriptions,
  attributeValues, attributeValueDescriptions,
} from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { z } from 'zod';
import { NotFoundError, BusinessRuleError } from './errors';

// ── Types ──
export interface AttributeGroupResponse {
  id: number;
  sortOrder: number;
  name: string;
  locale: string;
  attributes: AttributeResponse[];
}

export interface AttributeResponse {
  id: number;
  attributeGroupId: number | null;
  sortOrder: number;
  name: string;
  locale: string;
  values: AttributeValueResponse[];
}

export interface AttributeValueResponse {
  id: number;
  attributeId: number;
  sortOrder: number;
  name: string;
  locale: string;
}

// ── Zod Schemas ──
const attributeDescSchema = z.object({
  name: z.string().min(1),
});

export const createGroupSchema = z.object({
  sortOrder: z.number().int().optional().default(0),
  descriptions: z.record(z.string(), attributeDescSchema).refine((d) => Object.keys(d).length > 0, {
    message: '至少需要一种语言的描述',
  }),
});

export const updateGroupSchema = z.object({
  sortOrder: z.number().int().optional(),
  descriptions: z.record(z.string(), attributeDescSchema).optional(),
});

export const createAttributeSchema = z.object({
  attributeGroupId: z.number().int().positive(),
  sortOrder: z.number().int().optional().default(0),
  descriptions: z.record(z.string(), attributeDescSchema).refine((d) => Object.keys(d).length > 0, {
    message: '至少需要一种语言的描述',
  }),
});

export const updateAttributeSchema = z.object({
  sortOrder: z.number().int().optional(),
  descriptions: z.record(z.string(), attributeDescSchema).optional(),
});

export const createValueSchema = z.object({
  attributeId: z.number().int().positive(),
  sortOrder: z.number().int().optional().default(0),
  descriptions: z.record(z.string(), attributeDescSchema).refine((d) => Object.keys(d).length > 0, {
    message: '至少需要一种语言的描述',
  }),
});

export const updateValueSchema = z.object({
  sortOrder: z.number().int().optional(),
  descriptions: z.record(z.string(), attributeDescSchema).optional(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type CreateAttributeInput = z.infer<typeof createAttributeSchema>;
export type UpdateAttributeInput = z.infer<typeof updateAttributeSchema>;
export type CreateValueInput = z.infer<typeof createValueSchema>;
export type UpdateValueInput = z.infer<typeof updateValueSchema>;

// ── Service ──
export const AttributeService = {
  // ── 查询（含级联） ──
  async getAttributeGroups(locale: string): Promise<AttributeGroupResponse[]> {
    const rows = await db
      .select({
        id: attributeGroups.id,
        sortOrder: attributeGroups.sortOrder,
        descId: attributeGroupDescriptions.id,
        descLocale: attributeGroupDescriptions.locale,
        name: attributeGroupDescriptions.name,
      })
      .from(attributeGroups)
      .leftJoin(
        attributeGroupDescriptions,
        eq(attributeGroupDescriptions.attributeGroupId, attributeGroups.id)
      )
      .where(eq(attributeGroupDescriptions.locale, locale))
      .orderBy(asc(attributeGroups.sortOrder));

    const groups: AttributeGroupResponse[] = rows.map((r) => ({
      id: r.id,
      sortOrder: r.sortOrder ?? 0,
      name: r.name ?? '',
      locale: r.descLocale ?? locale,
      attributes: [],
    }));

    for (const group of groups) {
      const attrRows = await db
        .select({
          id: attributes.id,
          attributeGroupId: attributes.attributeGroupId,
          sortOrder: attributes.sortOrder,
          descId: attributeDescriptions.id,
          descLocale: attributeDescriptions.locale,
          name: attributeDescriptions.name,
        })
        .from(attributes)
        .leftJoin(
          attributeDescriptions,
          eq(attributeDescriptions.attributeId, attributes.id)
        )
        .where(eq(attributeDescriptions.locale, locale))
        .orderBy(asc(attributes.sortOrder));

      group.attributes = attrRows.map((a) => ({
        id: a.id,
        attributeGroupId: a.attributeGroupId ?? group.id,
        sortOrder: a.sortOrder ?? 0,
        name: a.name ?? '',
        locale: a.descLocale ?? locale,
        values: [],
      }));

      for (const attr of group.attributes) {
        const valRows = await db
          .select({
            id: attributeValues.id,
            attributeId: attributeValues.attributeId,
            sortOrder: attributeValues.sortOrder,
            descId: attributeValueDescriptions.id,
            descLocale: attributeValueDescriptions.locale,
            name: attributeValueDescriptions.name,
          })
          .from(attributeValues)
          .leftJoin(
            attributeValueDescriptions,
            eq(attributeValueDescriptions.attributeValueId, attributeValues.id)
          )
          .where(eq(attributeValueDescriptions.locale, locale))
          .orderBy(asc(attributeValues.sortOrder));

        attr.values = valRows.map((v) => ({
          id: v.id,
          attributeId: v.attributeId,
          sortOrder: v.sortOrder ?? 0,
          name: v.name ?? '',
          locale: v.descLocale ?? locale,
        }));
      }
    }

    return groups;
  },

  // ── 属性组 CRUD ──
  async createGroup(data: CreateGroupInput) {
    const validated = createGroupSchema.parse(data);

    const [group] = await db.insert(attributeGroups).values({
      sortOrder: validated.sortOrder ?? 0,
    }).returning();

    for (const [locale, desc] of Object.entries(validated.descriptions)) {
      await db.insert(attributeGroupDescriptions).values({
        attributeGroupId: group.id,
        locale,
        name: desc.name,
      });
    }
    return group;
  },

  async updateGroup(id: number, data: UpdateGroupInput) {
    const validated = updateGroupSchema.parse(data);

    // pre: 属性组存在
    const [existing] = await db.select({ id: attributeGroups.id })
      .from(attributeGroups).where(eq(attributeGroups.id, id)).limit(1);
    if (!existing) throw new NotFoundError('属性组', id);

    if (validated.sortOrder !== undefined) {
      await db.update(attributeGroups).set({ sortOrder: validated.sortOrder })
        .where(eq(attributeGroups.id, id));
    }

    if (validated.descriptions) {
      for (const [locale, desc] of Object.entries(validated.descriptions)) {
        const [existingDesc] = await db
          .select()
          .from(attributeGroupDescriptions)
          .where(and(
            eq(attributeGroupDescriptions.attributeGroupId, id),
            eq(attributeGroupDescriptions.locale, locale)
          ))
          .limit(1);

        if (existingDesc) {
          await db.update(attributeGroupDescriptions).set({ name: desc.name })
            .where(and(
              eq(attributeGroupDescriptions.attributeGroupId, id),
              eq(attributeGroupDescriptions.locale, locale)
            ));
        } else {
          await db.insert(attributeGroupDescriptions).values({
            attributeGroupId: id, locale, name: desc.name,
          });
        }
      }
    }
  },

  async deleteGroup(id: number) {
    // pre: 属性组存在
    const [existing] = await db.select({ id: attributeGroups.id })
      .from(attributeGroups).where(eq(attributeGroups.id, id)).limit(1);
    if (!existing) throw new NotFoundError('属性组', id);

    // pre: 无关联属性
    const [linkedAttr] = await db.select({ id: attributes.id })
      .from(attributes).where(eq(attributes.attributeGroupId, id)).limit(1);
    if (linkedAttr) {
      throw new BusinessRuleError('该属性组下有属性，无法删除');
    }

    await db.delete(attributeGroups).where(eq(attributeGroups.id, id));
    return true;
  },

  // ── 属性 CRUD ──
  async createAttribute(data: CreateAttributeInput) {
    const validated = createAttributeSchema.parse(data);

    // pre: 属性组存在
    const [group] = await db.select({ id: attributeGroups.id })
      .from(attributeGroups).where(eq(attributeGroups.id, validated.attributeGroupId)).limit(1);
    if (!group) throw new NotFoundError('属性组', validated.attributeGroupId);

    const [attr] = await db.insert(attributes).values({
      attributeGroupId: validated.attributeGroupId,
      sortOrder: validated.sortOrder ?? 0,
    }).returning();

    for (const [locale, desc] of Object.entries(validated.descriptions)) {
      await db.insert(attributeDescriptions).values({
        attributeId: attr.id, locale, name: desc.name,
      });
    }
    return attr;
  },

  async updateAttribute(id: number, data: UpdateAttributeInput) {
    const validated = updateAttributeSchema.parse(data);

    // pre: 属性存在
    const [existing] = await db.select({ id: attributes.id })
      .from(attributes).where(eq(attributes.id, id)).limit(1);
    if (!existing) throw new NotFoundError('属性', id);

    if (validated.sortOrder !== undefined) {
      await db.update(attributes).set({ sortOrder: validated.sortOrder }).where(eq(attributes.id, id));
    }

    if (validated.descriptions) {
      for (const [locale, desc] of Object.entries(validated.descriptions)) {
        const [existingDesc] = await db
          .select()
          .from(attributeDescriptions)
          .where(and(
            eq(attributeDescriptions.attributeId, id),
            eq(attributeDescriptions.locale, locale)
          ))
          .limit(1);

        if (existingDesc) {
          await db.update(attributeDescriptions).set({ name: desc.name })
            .where(and(
              eq(attributeDescriptions.attributeId, id),
              eq(attributeDescriptions.locale, locale)
            ));
        } else {
          await db.insert(attributeDescriptions).values({
            attributeId: id, locale, name: desc.name,
          });
        }
      }
    }
  },

  async deleteAttribute(id: number) {
    // pre: 属性存在
    const [existing] = await db.select({ id: attributes.id })
      .from(attributes).where(eq(attributes.id, id)).limit(1);
    if (!existing) throw new NotFoundError('属性', id);

    await db.delete(attributes).where(eq(attributes.id, id));
    return true;
  },

  // ── 属性值 CRUD ──
  async createValue(data: CreateValueInput) {
    const validated = createValueSchema.parse(data);

    // pre: 属性存在
    const [attr] = await db.select({ id: attributes.id })
      .from(attributes).where(eq(attributes.id, validated.attributeId)).limit(1);
    if (!attr) throw new NotFoundError('属性', validated.attributeId);

    const [val] = await db.insert(attributeValues).values({
      attributeId: validated.attributeId,
      sortOrder: validated.sortOrder ?? 0,
    }).returning();

    for (const [locale, desc] of Object.entries(validated.descriptions)) {
      await db.insert(attributeValueDescriptions).values({
        attributeValueId: val.id, locale, name: desc.name,
      });
    }
    return val;
  },

  async updateValue(id: number, data: UpdateValueInput) {
    const validated = updateValueSchema.parse(data);

    // pre: 属性值存在
    const [existing] = await db.select({ id: attributeValues.id })
      .from(attributeValues).where(eq(attributeValues.id, id)).limit(1);
    if (!existing) throw new NotFoundError('属性值', id);

    if (validated.sortOrder !== undefined) {
      await db.update(attributeValues).set({ sortOrder: validated.sortOrder }).where(eq(attributeValues.id, id));
    }

    if (validated.descriptions) {
      for (const [locale, desc] of Object.entries(validated.descriptions)) {
        const [existingDesc] = await db
          .select()
          .from(attributeValueDescriptions)
          .where(and(
            eq(attributeValueDescriptions.attributeValueId, id),
            eq(attributeValueDescriptions.locale, locale)
          ))
          .limit(1);

        if (existingDesc) {
          await db.update(attributeValueDescriptions).set({ name: desc.name })
            .where(and(
              eq(attributeValueDescriptions.attributeValueId, id),
              eq(attributeValueDescriptions.locale, locale)
            ));
        } else {
          await db.insert(attributeValueDescriptions).values({
            attributeValueId: id, locale, name: desc.name,
          });
        }
      }
    }
  },

  async deleteValue(id: number) {
    // pre: 属性值存在
    const [existing] = await db.select({ id: attributeValues.id })
      .from(attributeValues).where(eq(attributeValues.id, id)).limit(1);
    if (!existing) throw new NotFoundError('属性值', id);

    await db.delete(attributeValues).where(eq(attributeValues.id, id));
    return true;
  },
};