import {
  pgTable,
  serial,
  integer,
  varchar,
  decimal,
  boolean,
  timestamp,
  text,
  uniqueIndex,
  index,
  doublePrecision,
} from 'drizzle-orm/pg-core';

// ============================================================
// 品牌
// ============================================================
export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  logo: varchar('logo', { length: 500 }),
  description: text('description'),
  website: varchar('website', { length: 500 }),
  sortOrder: integer('sort_order').default(0),
  status: boolean('status').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================
// 分类
// ============================================================
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  parentId: integer('parent_id'),
  image: varchar('image', { length: 500 }),
  sortOrder: integer('sort_order').default(0),
  status: boolean('status').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  parentIdx: index('categories_parent_idx').on(table.parentId),
}));

export const categoryDescriptions = pgTable('category_descriptions', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  locale: varchar('locale', { length: 10 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  metaKeywords: varchar('meta_keywords', { length: 500 }),
}, (table) => ({
  categoryLocaleIdx: uniqueIndex('cat_desc_locale_idx').on(table.categoryId, table.locale),
}));

export const categoryPaths = pgTable('category_paths', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  pathId: integer('path_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  level: integer('level').notNull().default(0),
});

// ============================================================
// 属性
// ============================================================
export const attributeGroups = pgTable('attribute_groups', {
  id: serial('id').primaryKey(),
  sortOrder: integer('sort_order').default(0),
});

export const attributeGroupDescriptions = pgTable('attribute_group_descriptions', {
  id: serial('id').primaryKey(),
  attributeGroupId: integer('attribute_group_id').notNull().references(() => attributeGroups.id, { onDelete: 'cascade' }),
  locale: varchar('locale', { length: 10 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
}, (table) => ({
  attrGroupLocaleIdx: uniqueIndex('attr_group_desc_locale_idx').on(table.attributeGroupId, table.locale),
}));

export const attributes = pgTable('attributes', {
  id: serial('id').primaryKey(),
  attributeGroupId: integer('attribute_group_id').references(() => attributeGroups.id),
  sortOrder: integer('sort_order').default(0),
});

export const attributeDescriptions = pgTable('attribute_descriptions', {
  id: serial('id').primaryKey(),
  attributeId: integer('attribute_id').notNull().references(() => attributes.id, { onDelete: 'cascade' }),
  locale: varchar('locale', { length: 10 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
}, (table) => ({
  attrLocaleIdx: uniqueIndex('attr_desc_locale_idx').on(table.attributeId, table.locale),
}));

export const attributeValues = pgTable('attribute_values', {
  id: serial('id').primaryKey(),
  attributeId: integer('attribute_id').notNull().references(() => attributes.id, { onDelete: 'cascade' }),
  sortOrder: integer('sort_order').default(0),
});

export const attributeValueDescriptions = pgTable('attribute_value_descriptions', {
  id: serial('id').primaryKey(),
  attributeValueId: integer('attribute_value_id').notNull().references(() => attributeValues.id, { onDelete: 'cascade' }),
  locale: varchar('locale', { length: 10 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
}, (table) => ({
  attrValLocaleIdx: uniqueIndex('attr_val_desc_locale_idx').on(table.attributeValueId, table.locale),
}));

// ============================================================
// 商品
// ============================================================
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  sku: varchar('sku', { length: 255 }).notNull(),
  brandId: integer('brand_id').references(() => brands.id),
  price: decimal('price', { precision: 15, scale: 2 }).notNull().default('0.00'),
  costPrice: decimal('cost_price', { precision: 15, scale: 2 }).default('0.00'),
  weight: doublePrecision('weight').default(0),
  status: boolean('status').default(true),
  quantity: integer('quantity').default(0),
  sales: integer('sales').default(0),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  skuIdx: uniqueIndex('products_sku_idx').on(table.sku),
  brandIdx: index('products_brand_idx').on(table.brandId),
  statusIdx: index('products_status_idx').on(table.status),
}));

export const productDescriptions = pgTable('product_descriptions', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  locale: varchar('locale', { length: 10 }).notNull(),
  name: varchar('name', { length: 500 }).notNull(),
  description: text('description'),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  metaKeywords: varchar('meta_keywords', { length: 500 }),
}, (table) => ({
  productLocaleIdx: uniqueIndex('prod_desc_locale_idx').on(table.productId, table.locale),
}));

export const productCategories = pgTable('product_categories', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, (table) => ({
  productCategoryIdx: uniqueIndex('prod_cat_idx').on(table.productId, table.categoryId),
  catProductIdx: index('cat_prod_idx').on(table.categoryId),
}));

export const productAttributes = pgTable('product_attributes', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  attributeId: integer('attribute_id').notNull().references(() => attributes.id, { onDelete: 'cascade' }),
  attributeValueId: integer('attribute_value_id').references(() => attributeValues.id),
  text: text('text'),
}, (table) => ({
  productAttrIdx: uniqueIndex('prod_attr_idx').on(table.productId, table.attributeId),
}));

export const productSkus = pgTable('product_skus', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  sku: varchar('sku', { length: 255 }).notNull(),
  price: decimal('price', { precision: 15, scale: 2 }).notNull().default('0.00'),
  quantity: integer('quantity').default(0),
  weight: doublePrecision('weight').default(0),
  image: varchar('image', { length: 500 }),
  sortOrder: integer('sort_order').default(0),
}, (table) => ({
  skuProductIdx: index('sku_product_idx').on(table.productId),
}));

export const productImages = pgTable('product_images', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  image: varchar('image', { length: 500 }).notNull(),
  sortOrder: integer('sort_order').default(0),
}, (table) => ({
  imgProductIdx: index('img_product_idx').on(table.productId),
}));

export const productRelations = pgTable('product_relations', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  relatedProductId: integer('related_product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
});

// ============================================================
// 评价
// ============================================================
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  customerId: integer('customer_id').notNull(),
  rating: integer('rating').notNull().default(5),
  content: text('content'),
  status: boolean('status').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});
