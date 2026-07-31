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
} from 'drizzle-orm/pg-core';
import { products } from './products';

// ============================================================
// 客户分组
// ============================================================
export const customerGroups = pgTable('customer_groups', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  discount: decimal('discount', { precision: 5, scale: 2 }).default('0.00'),
});

// ============================================================
// 客户
// ============================================================
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

// ============================================================
// 客户地址
// ============================================================
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

// ============================================================
// 客户收藏
// ============================================================
export const customerWishlists = pgTable('customer_wishlists', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  wishlistCustomerProductIdx: uniqueIndex('wishlist_cust_prod_idx').on(table.customerId, table.productId),
}));

// ============================================================
// 购物车
// ============================================================
export const carts = pgTable('carts', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  skuId: integer('sku_id'),
  quantity: integer('quantity').notNull().default(1),
  selected: boolean('selected').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  cartCustomerProductIdx: uniqueIndex('cart_cust_prod_idx').on(table.customerId, table.productId),
}));
