import { db } from '@/lib/db/db';
import {
  attributeGroups, attributeGroupDescriptions,
  attributes, attributeDescriptions,
  attributeValues, attributeValueDescriptions,
} from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';

// ── 类型 ──
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

// ── 查询（含级联） ──
export async function getAttributeGroups(locale: string): Promise<AttributeGroupResponse[]> {
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

  // 加载每个组的属性
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
      .where(
        eq(attributeDescriptions.locale, locale)
      )
      .orderBy(asc(attributes.sortOrder));

    group.attributes = attrRows.map((a) => ({
      id: a.id,
      attributeGroupId: a.attributeGroupId ?? group.id,
      sortOrder: a.sortOrder ?? 0,
      name: a.name ?? '',
      locale: a.descLocale ?? locale,
      values: [],
    }));

    // 加载每个属性的值
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
        .where(
          eq(attributeValueDescriptions.locale, locale)
        )
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
}

// ── 属性组 CRUD ──
export async function createGroup(data: { sortOrder?: number; descriptions: Record<string, { name: string }> }) {
  const [group] = await db.insert(attributeGroups).values({
    sortOrder: data.sortOrder ?? 0,
  }).returning();

  for (const [locale, desc] of Object.entries(data.descriptions)) {
    await db.insert(attributeGroupDescriptions).values({
      attributeGroupId: group.id,
      locale,
      name: desc.name,
    });
  }
  return group;
}

export async function updateGroup(id: number, data: { sortOrder?: number; descriptions: Record<string, { name: string }> }) {
  await db.update(attributeGroups).set({
    sortOrder: data.sortOrder,
  }).where(eq(attributeGroups.id, id));

  for (const [locale, desc] of Object.entries(data.descriptions)) {
    const existing = await db
      .select()
      .from(attributeGroupDescriptions)
      .where(
        and(
          eq(attributeGroupDescriptions.attributeGroupId, id),
          eq(attributeGroupDescriptions.locale, locale)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db.update(attributeGroupDescriptions).set({ name: desc.name })
        .where(
          and(
            eq(attributeGroupDescriptions.attributeGroupId, id),
            eq(attributeGroupDescriptions.locale, locale)
          )
        );
    } else {
      await db.insert(attributeGroupDescriptions).values({
        attributeGroupId: id, locale, name: desc.name,
      });
    }
  }
}

export async function deleteGroup(id: number) {
  await db.delete(attributeGroups).where(eq(attributeGroups.id, id));
}

// ── 属性 CRUD ──
export async function createAttribute(data: { attributeGroupId: number; sortOrder?: number; descriptions: Record<string, { name: string }> }) {
  const [attr] = await db.insert(attributes).values({
    attributeGroupId: data.attributeGroupId,
    sortOrder: data.sortOrder ?? 0,
  }).returning();

  for (const [locale, desc] of Object.entries(data.descriptions)) {
    await db.insert(attributeDescriptions).values({
      attributeId: attr.id, locale, name: desc.name,
    });
  }
  return attr;
}

export async function updateAttribute(id: number, data: { sortOrder?: number; descriptions: Record<string, { name: string }> }) {
  await db.update(attributes).set({ sortOrder: data.sortOrder }).where(eq(attributes.id, id));

  for (const [locale, desc] of Object.entries(data.descriptions)) {
    const existing = await db
      .select()
      .from(attributeDescriptions)
      .where(
        and(
          eq(attributeDescriptions.attributeId, id),
          eq(attributeDescriptions.locale, locale)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db.update(attributeDescriptions).set({ name: desc.name })
        .where(
          and(
            eq(attributeDescriptions.attributeId, id),
            eq(attributeDescriptions.locale, locale)
          )
        );
    } else {
      await db.insert(attributeDescriptions).values({
        attributeId: id, locale, name: desc.name,
      });
    }
  }
}

export async function deleteAttribute(id: number) {
  await db.delete(attributes).where(eq(attributes.id, id));
}

// ── 属性值 CRUD ──
export async function createValue(data: { attributeId: number; sortOrder?: number; descriptions: Record<string, { name: string }> }) {
  const [val] = await db.insert(attributeValues).values({
    attributeId: data.attributeId,
    sortOrder: data.sortOrder ?? 0,
  }).returning();

  for (const [locale, desc] of Object.entries(data.descriptions)) {
    await db.insert(attributeValueDescriptions).values({
      attributeValueId: val.id, locale, name: desc.name,
    });
  }
  return val;
}

export async function updateValue(id: number, data: { sortOrder?: number; descriptions: Record<string, { name: string }> }) {
  await db.update(attributeValues).set({ sortOrder: data.sortOrder }).where(eq(attributeValues.id, id));

  for (const [locale, desc] of Object.entries(data.descriptions)) {
    const existing = await db
      .select()
      .from(attributeValueDescriptions)
      .where(
        and(
          eq(attributeValueDescriptions.attributeValueId, id),
          eq(attributeValueDescriptions.locale, locale)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db.update(attributeValueDescriptions).set({ name: desc.name })
        .where(
          and(
            eq(attributeValueDescriptions.attributeValueId, id),
            eq(attributeValueDescriptions.locale, locale)
          )
        );
    } else {
      await db.insert(attributeValueDescriptions).values({
        attributeValueId: id, locale, name: desc.name,
      });
    }
  }
}

export async function deleteValue(id: number) {
  await db.delete(attributeValues).where(eq(attributeValues.id, id));
}