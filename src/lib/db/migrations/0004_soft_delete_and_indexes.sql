-- ============================================================
-- P2#20: 软删除 — 添加 deleted_at 列
-- P2#22: 索引策略优化 — 添加缺失索引
-- ============================================================

-- 商品体系
ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();

-- 客户体系
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;

-- 订单体系
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
ALTER TABLE "rmas" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;

-- 系统体系
ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
ALTER TABLE "shipping_methods" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;

-- ============================================================
-- 新增索引
-- ============================================================

-- 商品索引
CREATE INDEX IF NOT EXISTS "categories_status_idx" ON "categories" ("status");
CREATE INDEX IF NOT EXISTS "products_created_at_idx" ON "products" ("created_at");

-- 评价索引
CREATE INDEX IF NOT EXISTS "reviews_product_idx" ON "reviews" ("product_id");
CREATE INDEX IF NOT EXISTS "reviews_customer_idx" ON "reviews" ("customer_id");
CREATE INDEX IF NOT EXISTS "reviews_status_idx" ON "reviews" ("status");

-- 客户索引
CREATE INDEX IF NOT EXISTS "customers_group_idx" ON "customers" ("group_id");
CREATE INDEX IF NOT EXISTS "customers_status_idx" ON "customers" ("status");

-- 退换货索引
CREATE INDEX IF NOT EXISTS "rmas_order_idx" ON "rmas" ("order_id");
CREATE INDEX IF NOT EXISTS "rmas_customer_idx" ON "rmas" ("customer_id");
CREATE INDEX IF NOT EXISTS "rmas_status_idx" ON "rmas" ("status");

-- 订单关联索引
CREATE INDEX IF NOT EXISTS "shipment_order_idx" ON "order_shipments" ("order_id");
CREATE INDEX IF NOT EXISTS "payment_order_idx" ON "order_payments" ("order_id");

-- 商品关联索引
CREATE INDEX IF NOT EXISTS "relation_product_idx" ON "product_relations" ("product_id");
CREATE INDEX IF NOT EXISTS "relation_related_idx" ON "product_relations" ("related_product_id");

-- 页面索引
CREATE INDEX IF NOT EXISTS "pages_category_idx" ON "pages" ("category_id");
CREATE INDEX IF NOT EXISTS "pages_status_idx" ON "pages" ("status");

-- 国家/区域索引
CREATE INDEX IF NOT EXISTS "countries_code_idx" ON "countries" ("code");
CREATE INDEX IF NOT EXISTS "countries_status_idx" ON "countries" ("status");
CREATE INDEX IF NOT EXISTS "zones_country_idx" ON "zones" ("country_id");

-- 配送方式索引
CREATE INDEX IF NOT EXISTS "shipping_methods_status_idx" ON "shipping_methods" ("status");