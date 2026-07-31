import {
  pgTable,
  serial,
  integer,
  varchar,
  decimal,
  timestamp,
  text,
  uniqueIndex,
  index,
  jsonb,
} from 'drizzle-orm/pg-core';
import { customers } from './customers';

// ============================================================
// 订单
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

// ============================================================
// 订单商品
// ============================================================
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

// ============================================================
// 订单金额明细
// ============================================================
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

// ============================================================
// 订单状态历史
// ============================================================
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

// ============================================================
// 发货信息
// ============================================================
export const orderShipments = pgTable('order_shipments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  expressCompany: varchar('express_company', { length: 255 }),
  trackingNumber: varchar('tracking_number', { length: 255 }),
  shippedAt: timestamp('shipped_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================
// 支付信息
// ============================================================
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
// 退换货
// ============================================================
export const rmas = pgTable('rmas', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull(),
  orderProductId: integer('order_product_id').notNull(),
  customerId: integer('customer_id').notNull(),
  type: varchar('type', { length: 50 }).notNull().default('refund'),
  reason: varchar('reason', { length: 500 }),
  quantity: integer('quantity').notNull().default(1),
  comment: text('comment'),
  status: varchar('status', { length: 50 }).default('pending'),
  adminNote: text('admin_note'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
