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
  jsonb,
} from 'drizzle-orm/pg-core';

// ============================================================
// 语言
// ============================================================
export const languages = pgTable('languages', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 10 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  image: varchar('image', { length: 500 }),
  sortOrder: integer('sort_order').default(0),
  status: boolean('status').default(true),
}, (table) => ({
  codeIdx: uniqueIndex('languages_code_idx').on(table.code),
}));

// ============================================================
// 货币
// ============================================================
export const currencies = pgTable('currencies', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 3 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  symbol: varchar('symbol', { length: 10 }).notNull(),
  rate: decimal('rate', { precision: 10, scale: 4 }).notNull().default('1.0000'),
  sortOrder: integer('sort_order').default(0),
  status: boolean('status').default(true),
}, (table) => ({
  currencyCodeIdx: uniqueIndex('currencies_code_idx').on(table.code),
}));

// ============================================================
// 国家
// ============================================================
export const countries = pgTable('countries', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 2 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  status: boolean('status').default(true),
});

// ============================================================
// 区域/州
// ============================================================
export const zones = pgTable('zones', {
  id: serial('id').primaryKey(),
  countryId: integer('country_id').notNull().references(() => countries.id),
  code: varchar('code', { length: 50 }),
  name: varchar('name', { length: 255 }).notNull(),
});

// ============================================================
// 系统设置
// ============================================================
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 255 }).notNull(),
  value: text('value'),
  locale: varchar('locale', { length: 10 }),
}, (table) => ({
  settingKeyIdx: uniqueIndex('settings_key_locale_idx').on(table.key, table.locale),
}));

// ============================================================
// 税率
// ============================================================
export const taxClasses = pgTable('tax_classes', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
});

export const taxRates = pgTable('tax_rates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  rate: decimal('rate', { precision: 7, scale: 4 }).notNull().default('0.0000'),
  type: varchar('type', { length: 20 }).default('percent'),
});

export const taxRules = pgTable('tax_rules', {
  id: serial('id').primaryKey(),
  taxClassId: integer('tax_class_id').notNull().references(() => taxClasses.id),
  taxRateId: integer('tax_rate_id').notNull().references(() => taxRates.id),
  basedOn: varchar('based_on', { length: 50 }).default('shipping'),
});

// ============================================================
// 管理员
// ============================================================
export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  avatar: varchar('avatar', { length: 500 }),
  locale: varchar('locale', { length: 10 }).default('zh_cn'),
  status: boolean('status').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  adminEmailIdx: uniqueIndex('admin_users_email_idx').on(table.email),
}));

// ============================================================
// 文章/页面
// ============================================================
export const pages = pgTable('pages', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id'),
  author: varchar('author', { length: 255 }),
  image: varchar('image', { length: 500 }),
  status: boolean('status').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const pageDescriptions = pgTable('page_descriptions', {
  id: serial('id').primaryKey(),
  pageId: integer('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  locale: varchar('locale', { length: 10 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content'),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  metaKeywords: varchar('meta_keywords', { length: 500 }),
}, (table) => ({
  pageLocaleIdx: uniqueIndex('page_desc_locale_idx').on(table.pageId, table.locale),
}));

export const pageCategories = pgTable('page_categories', {
  id: serial('id').primaryKey(),
  parentId: integer('parent_id'),
  image: varchar('image', { length: 500 }),
  sortOrder: integer('sort_order').default(0),
  status: boolean('status').default(true),
});

export const pageCategoryDescriptions = pgTable('page_category_descriptions', {
  id: serial('id').primaryKey(),
  pageCategoryId: integer('page_category_id').notNull().references(() => pageCategories.id, { onDelete: 'cascade' }),
  locale: varchar('locale', { length: 10 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
}, (table) => ({
  pageCatLocaleIdx: uniqueIndex('page_cat_desc_locale_idx').on(table.pageCategoryId, table.locale),
}));

// ============================================================
// 通知
// ============================================================
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 100 }).notNull(),
  data: jsonb('data'),
  notifiableId: integer('notifiable_id'),
  notifiableType: varchar('notifiable_type', { length: 100 }),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  notifNotifiableIdx: index('notif_notifiable_idx').on(table.notifiableId, table.notifiableType),
}));

// ============================================================
// 配送方式
// ============================================================
export const shippingMethods = pgTable('shipping_methods', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  icon: varchar('icon', { length: 500 }),
  baseFee: decimal('base_fee', { precision: 10, scale: 2 }).notNull().default('0.00'),
  freeShippingThreshold: decimal('free_shipping_threshold', { precision: 10, scale: 2 }).default('0.00'),
  estimatedDays: varchar('estimated_days', { length: 100 }),
  status: boolean('status').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const shippingMethodDescriptions = pgTable('shipping_method_descriptions', {
  id: serial('id').primaryKey(),
  shippingMethodId: integer('shipping_method_id').notNull().references(() => shippingMethods.id, { onDelete: 'cascade' }),
  locale: varchar('locale', { length: 10 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
}, (table) => ({
  shippingMethodLocaleIdx: uniqueIndex('shipping_method_locale_idx').on(table.shippingMethodId, table.locale),
}));
