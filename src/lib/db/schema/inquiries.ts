import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  text,
  index,
} from 'drizzle-orm/pg-core';
import { products } from './products';
import { customers } from './customers';

// ============================================================
// 询盘（Inquiry）
// 客户对产品的询价记录，B2B 核心转化数据
// ============================================================
export const inquiries = pgTable('inquiries', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id),
  customerId: integer('customer_id').references(() => customers.id),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  company: varchar('company', { length: 255 }),
  quantity: integer('quantity').notNull().default(1),
  message: text('message'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  customerIdx: index('idx_inquiries_customer').on(table.customerId),
  productIdx: index('idx_inquiries_product').on(table.productId),
  statusIdx: index('idx_inquiries_status').on(table.status),
}));