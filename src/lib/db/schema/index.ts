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
  foreignKey,
  jsonb,
  doublePrecision,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================
// 商品体系
// ============================================================

// 品牌
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

// 分类
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

// 分类多语言描述
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

// 分类路径（用于多级分类层级）
export const categoryPaths = pgTable('category_paths', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  pathId: integer('path_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  level: integer('level').notNull().default(0),
});

// 属性组
export const attributeGroups = pgTable('attribute_groups', {
  id: serial('id').primaryKey(),
  sortOrder: integer('sort_order').default(0),
});

// 属性组多语言
export const attributeGroupDescriptions = pgTable('attribute_group_descriptions', {
  id: serial('id').primaryKey(),
  attributeGroupId: integer('attribute_group_id').notNull().references(() => attributeGroups.id, { onDelete: 'cascade' }),
  locale: varchar('locale', { length: 10 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
}, (table) => ({
  attrGroupLocaleIdx: uniqueIndex('attr_group_desc_locale_idx').on(table.attributeGroupId, table.locale),
}));

// 属性定义
export const attributes = pgTable('attributes', {
  id: serial('id').primaryKey(),
  attributeGroupId: integer('attribute_group_id').references(() => attributeGroups.id),
  sortOrder: integer('sort_order').default(0),
});

// 属性多语言
export const attributeDescriptions = pgTable('attribute_descriptions', {
  id: serial('id').primaryKey(),
  attributeId: integer('attribute_id').notNull().references(() => attributes.id, { onDelete: 'cascade' }),
  locale: varchar('locale', { length: 10 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
}, (table) => ({
  attrLocaleIdx: uniqueIndex('attr_desc_locale_idx').on(table.attributeId, table.locale),
}));

// 属性值
export const attributeValues = pgTable('attribute_values', {
  id: serial('id').primaryKey(),
  attributeId: integer('attribute_id').notNull().references(() => attributes.id, { onDelete: 'cascade' }),
  sortOrder: integer('sort_order').default(0),
});

// 属性值多语言
export const attributeValueDescriptions = pgTable('attribute_value_descriptions', {
  id: serial('id').primaryKey(),
  attributeValueId: integer('attribute_value_id').notNull().references(() => attributeValues.id, { onDelete: 'cascade' }),
  locale: varchar('locale', { length: 10 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
}, (table) => ({
  attrValLocaleIdx: uniqueIndex('attr_val_desc_locale_idx').on(table.attributeValueId, table.locale),
}));

// 商品主表
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

// 商品多语言描述
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

// 商品-分类关联
export const productCategories = pgTable('product_categories', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, (table) => ({
  productCategoryIdx: uniqueIndex('prod_cat_idx').on(table.productId, table.categoryId),
  catProductIdx: index('cat_prod_idx').on(table.categoryId),
}));

// 商品属性值
export const productAttributes = pgTable('product_attributes', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  attributeId: integer('attribute_id').notNull().references(() => attributes.id, { onDelete: 'cascade' }),
  attributeValueId: integer('attribute_value_id').references(() => attributeValues.id),
  text: text('text'),
}, (table) => ({
  productAttrIdx: uniqueIndex('prod_attr_idx').on(table.productId, table.attributeId),
}));

// 商品 SKU（多规格）
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

// 商品图片
export const productImages = pgTable('product_images', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  image: varchar('image', { length: 500 }).notNull(),
  sortOrder: integer('sort_order').default(0),
}, (table) => ({
  imgProductIdx: index('img_product_idx').on(table.productId),
}));

// 关联商品
export const productRelations = pgTable('product_relations', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  relatedProductId: integer('related_product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
});

// ============================================================
// 客户体系
// ============================================================

// 客户分组
export const customerGroups = pgTable('customer_groups', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  discount: decimal('discount', { precision: 5, scale: 2 }).default('0.00'),
});

// 客户
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  avatar: varchar('avatar', { length: 500 }),
  groupId: integer('group_id').references(() => customerGroups.id),
  status: boolean('status').default(true),
  newsletter: boolean('newsletter').default(false),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex('customers_email_idx').on(table.email),
}));

// 客户地址
export const customerAddresses = pgTable('customer_addresses', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  countryId: integer('country_id').notNull(),
  zoneId: integer('zone_id'),
  city: varchar('city', { length: 255 }),
  address1: varchar('address_1', { length: 500 }).notNull(),
  address2: varchar('address_2', { length: 500 }),
  zipCode: varchar('zip_code', { length: 50 }),
  isDefault: boolean('is_default').default(false),
}, (table) => ({
  addrCustomerIdx: index('addr_customer_idx').on(table.customerId),
}));

// 客户收藏
export const customerWishlists = pgTable('customer_wishlists', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  wishlistCustomerProductIdx: uniqueIndex('wishlist_cust_prod_idx').on(table.customerId, table.productId),
}));

// ============================================================
// 购物车体系
// ============================================================

export const carts = pgTable('carts', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  skuId: integer('sku_id').references(() => productSkus.id),
  quantity: integer('quantity').notNull().default(1),
  selected: boolean('selected').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  cartCustomerProductIdx: uniqueIndex('cart_cust_prod_idx').on(table.customerId, table.productId),
}));

// ============================================================
// 订单体系
// ============================================================

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  number: varchar('number', { length: 50 }).notNull(),
  customerId: integer('customer_id').notNull().references(() => customers.id),
  shippingAddressId: integer('shipping_address_id'),
  paymentAddressId: integer('payment_address_id'),
  total: decimal('total', { precision: 15, scale: 2 }).notNull().default('0.00'),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).default('0.00'),
  shippingFee: decimal('shipping_fee', { precision: 15, scale: 2 }).default('0.00'),
  tax: decimal('tax', { precision: 15, scale: 2 }).default('0.00'),
  discount: decimal('discount', { precision: 15, scale: 2 }).default('0.00'),
  currency: varchar('currency', { length: 3 }).default('USD'),
  currencyRate: decimal('currency_rate', { precision: 10, scale: 4 }).default('1.0000'),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  shippingMethod: varchar('shipping_method', { length: 255 }),
  paymentMethod: varchar('payment_method', { length: 255 }),
  paymentStatus: varchar('payment_status', { length: 50 }).default('unpaid'),
  paymentId: varchar('payment_id', { length: 500 }),
  paidAt: timestamp('paid_at'),
  comment: text('comment'),
  customerNote: text('customer_note'),
  ip: varchar('ip', { length: 50 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  numberIdx: uniqueIndex('orders_number_idx').on(table.number),
  customerIdx: index('orders_customer_idx').on(table.customerId),
  statusIdx: index('orders_status_idx').on(table.status),
  createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
}));

// 订单商品
export const orderProducts = pgTable('order_products', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull(),
  skuId: integer('sku_id'),
  name: varchar('name', { length: 500 }).notNull(),
  sku: varchar('sku', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 15, scale: 2 }).notNull(),
  total: decimal('total', { precision: 15, scale: 2 }).notNull(),
  image: varchar('image', { length: 500 }),
}, (table) => ({
  orderProductIdx: index('order_product_order_idx').on(table.orderId),
}));

// 订单金额明细
export const orderTotals = pgTable('order_totals', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  value: decimal('value', { precision: 15, scale: 2 }).notNull().default('0.00'),
  sortOrder: integer('sort_order').default(0),
}, (table) => ({
  totalOrderIdx: index('total_order_idx').on(table.orderId),
}));

// 订单状态历史
export const orderHistories = pgTable('order_histories', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  fromStatus: varchar('from_status', { length: 50 }),
  toStatus: varchar('to_status', { length: 50 }).notNull(),
  comment: text('comment'),
  operator: varchar('operator', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  historyOrderIdx: index('history_order_idx').on(table.orderId),
}));

// 发货信息
export const orderShipments = pgTable('order_shipments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  expressCompany: varchar('express_company', { length: 255 }),
  trackingNumber: varchar('tracking_number', { length: 255 }),
  shippedAt: timestamp('shipped_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 支付信息
export const orderPayments = pgTable('order_payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  transactionId: varchar('transaction_id', { length: 255 }),
  paymentMethod: varchar('payment_method', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  status: varchar('status', { length: 50 }).default('pending'),
  responseData: jsonb('response_data'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================
// 系统体系
// ============================================================

// 语言
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

// 货币
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

// 国家
export const countries = pgTable('countries', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 2 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  status: boolean('status').default(true),
});

// 区域/州
export const zones = pgTable('zones', {
  id: serial('id').primaryKey(),
  countryId: integer('country_id').notNull().references(() => countries.id),
  code: varchar('code', { length: 50 }),
  name: varchar('name', { length: 255 }).notNull(),
});

// 系统设置
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 255 }).notNull(),
  value: text('value'),
  locale: varchar('locale', { length: 10 }),
}, (table) => ({
  settingKeyIdx: uniqueIndex('settings_key_locale_idx').on(table.key, table.locale),
}));

// 税率
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

// 管理员
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

// 文章/页面
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

// 文章多语言
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

// 文章分类
export const pageCategories = pgTable('page_categories', {
  id: serial('id').primaryKey(),
  parentId: integer('parent_id'),
  image: varchar('image', { length: 500 }),
  sortOrder: integer('sort_order').default(0),
  status: boolean('status').default(true),
});

// 文章分类多语言
export const pageCategoryDescriptions = pgTable('page_category_descriptions', {
  id: serial('id').primaryKey(),
  pageCategoryId: integer('page_category_id').notNull().references(() => pageCategories.id, { onDelete: 'cascade' }),
  locale: varchar('locale', { length: 10 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
}, (table) => ({
  pageCatLocaleIdx: uniqueIndex('page_cat_desc_locale_idx').on(table.pageCategoryId, table.locale),
}));

// 评价/评论
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  customerId: integer('customer_id').notNull().references(() => customers.id),
  rating: integer('rating').notNull().default(5),
  content: text('content'),
  status: boolean('status').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// 退换货
export const rmas = pgTable('rmas', {
  id: serial('id').primaryKey(),
  orderProductId: integer('order_product_id').notNull(),
  customerId: integer('customer_id').notNull(),
  quantity: integer('quantity').notNull().default(1),
  reason: varchar('reason', { length: 500 }),
  status: varchar('status', { length: 50 }).default('pending'),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 通知
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