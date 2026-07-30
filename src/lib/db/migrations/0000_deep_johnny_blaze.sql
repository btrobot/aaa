CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"avatar" varchar(500),
	"locale" varchar(10) DEFAULT 'zh_cn',
	"status" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "attribute_descriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"attribute_id" integer NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attribute_group_descriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"attribute_group_id" integer NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attribute_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "attribute_value_descriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"attribute_value_id" integer NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attribute_values" (
	"id" serial PRIMARY KEY NOT NULL,
	"attribute_id" integer NOT NULL,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "attributes" (
	"id" serial PRIMARY KEY NOT NULL,
	"attribute_group_id" integer,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"logo" varchar(500),
	"description" text,
	"website" varchar(500),
	"sort_order" integer DEFAULT 0,
	"status" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"sku_id" integer,
	"quantity" integer DEFAULT 1 NOT NULL,
	"selected" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"image" varchar(500),
	"sort_order" integer DEFAULT 0,
	"status" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "category_descriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"meta_title" varchar(255),
	"meta_description" text,
	"meta_keywords" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "category_paths" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"path_id" integer NOT NULL,
	"level" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(2) NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(3) NOT NULL,
	"name" varchar(255) NOT NULL,
	"symbol" varchar(10) NOT NULL,
	"rate" numeric(10, 4) DEFAULT '1.0000' NOT NULL,
	"sort_order" integer DEFAULT 0,
	"status" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "customer_addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"country_id" integer NOT NULL,
	"zone_id" integer,
	"city" varchar(255),
	"address_1" varchar(500) NOT NULL,
	"address_2" varchar(500),
	"zip_code" varchar(50),
	"is_default" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "customer_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"discount" numeric(5, 2) DEFAULT '0.00'
);
--> statement-breakpoint
CREATE TABLE "customer_wishlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"name" varchar(255),
	"phone" varchar(50),
	"avatar" varchar(500),
	"group_id" integer,
	"status" boolean DEFAULT true,
	"newsletter" boolean DEFAULT false,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(10) NOT NULL,
	"name" varchar(255) NOT NULL,
	"image" varchar(500),
	"sort_order" integer DEFAULT 0,
	"status" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(100) NOT NULL,
	"data" jsonb,
	"notifiable_id" integer,
	"notifiable_type" varchar(100),
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_histories" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"from_status" varchar(50),
	"to_status" varchar(50) NOT NULL,
	"comment" text,
	"operator" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"transaction_id" varchar(255),
	"payment_method" varchar(255) NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"status" varchar(50) DEFAULT 'pending',
	"response_data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"sku_id" integer,
	"name" varchar(500) NOT NULL,
	"sku" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"price" numeric(15, 2) NOT NULL,
	"total" numeric(15, 2) NOT NULL,
	"image" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "order_shipments" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"express_company" varchar(255),
	"tracking_number" varchar(255),
	"shipped_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_totals" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"code" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"value" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" varchar(50) NOT NULL,
	"customer_id" integer NOT NULL,
	"shipping_address_id" integer,
	"payment_address_id" integer,
	"total" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"subtotal" numeric(15, 2) DEFAULT '0.00',
	"shipping_fee" numeric(15, 2) DEFAULT '0.00',
	"tax" numeric(15, 2) DEFAULT '0.00',
	"discount" numeric(15, 2) DEFAULT '0.00',
	"currency" varchar(3) DEFAULT 'USD',
	"currency_rate" numeric(10, 4) DEFAULT '1.0000',
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"shipping_method" varchar(255),
	"payment_method" varchar(255),
	"comment" text,
	"customer_note" text,
	"ip" varchar(50),
	"user_agent" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "page_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"image" varchar(500),
	"sort_order" integer DEFAULT 0,
	"status" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "page_category_descriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_category_id" integer NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "page_descriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_id" integer NOT NULL,
	"locale" varchar(10) NOT NULL,
	"title" varchar(500) NOT NULL,
	"content" text,
	"meta_title" varchar(255),
	"meta_description" text,
	"meta_keywords" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer,
	"author" varchar(255),
	"image" varchar(500),
	"status" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_attributes" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"attribute_id" integer NOT NULL,
	"attribute_value_id" integer,
	"text" text
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"category_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_descriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" varchar(500) NOT NULL,
	"description" text,
	"meta_title" varchar(255),
	"meta_description" text,
	"meta_keywords" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"image" varchar(500) NOT NULL,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "product_relations" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"related_product_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_skus" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"sku" varchar(255) NOT NULL,
	"price" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"quantity" integer DEFAULT 0,
	"weight" double precision DEFAULT 0,
	"image" varchar(500),
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"sku" varchar(255) NOT NULL,
	"brand_id" integer,
	"price" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"cost_price" numeric(15, 2) DEFAULT '0.00',
	"weight" double precision DEFAULT 0,
	"status" boolean DEFAULT true,
	"quantity" integer DEFAULT 0,
	"sales" integer DEFAULT 0,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"content" text,
	"status" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rmas" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_product_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"reason" varchar(500),
	"status" varchar(50) DEFAULT 'pending',
	"comment" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text,
	"locale" varchar(10)
);
--> statement-breakpoint
CREATE TABLE "tax_classes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "tax_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"rate" numeric(7, 4) DEFAULT '0.0000' NOT NULL,
	"type" varchar(20) DEFAULT 'percent'
);
--> statement-breakpoint
CREATE TABLE "tax_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"tax_class_id" integer NOT NULL,
	"tax_rate_id" integer NOT NULL,
	"based_on" varchar(50) DEFAULT 'shipping'
);
--> statement-breakpoint
CREATE TABLE "zones" (
	"id" serial PRIMARY KEY NOT NULL,
	"country_id" integer NOT NULL,
	"code" varchar(50),
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attribute_descriptions" ADD CONSTRAINT "attribute_descriptions_attribute_id_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attribute_group_descriptions" ADD CONSTRAINT "attribute_group_descriptions_attribute_group_id_attribute_groups_id_fk" FOREIGN KEY ("attribute_group_id") REFERENCES "public"."attribute_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attribute_value_descriptions" ADD CONSTRAINT "attribute_value_descriptions_attribute_value_id_attribute_values_id_fk" FOREIGN KEY ("attribute_value_id") REFERENCES "public"."attribute_values"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attribute_values" ADD CONSTRAINT "attribute_values_attribute_id_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attributes" ADD CONSTRAINT "attributes_attribute_group_id_attribute_groups_id_fk" FOREIGN KEY ("attribute_group_id") REFERENCES "public"."attribute_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_sku_id_product_skus_id_fk" FOREIGN KEY ("sku_id") REFERENCES "public"."product_skus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_descriptions" ADD CONSTRAINT "category_descriptions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_paths" ADD CONSTRAINT "category_paths_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_paths" ADD CONSTRAINT "category_paths_path_id_categories_id_fk" FOREIGN KEY ("path_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_wishlists" ADD CONSTRAINT "customer_wishlists_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_wishlists" ADD CONSTRAINT "customer_wishlists_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_group_id_customer_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."customer_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_histories" ADD CONSTRAINT "order_histories_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_payments" ADD CONSTRAINT "order_payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_products" ADD CONSTRAINT "order_products_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_shipments" ADD CONSTRAINT "order_shipments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_totals" ADD CONSTRAINT "order_totals_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_category_descriptions" ADD CONSTRAINT "page_category_descriptions_page_category_id_page_categories_id_fk" FOREIGN KEY ("page_category_id") REFERENCES "public"."page_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_descriptions" ADD CONSTRAINT "page_descriptions_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_attribute_id_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_attribute_value_id_attribute_values_id_fk" FOREIGN KEY ("attribute_value_id") REFERENCES "public"."attribute_values"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_descriptions" ADD CONSTRAINT "product_descriptions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_relations" ADD CONSTRAINT "product_relations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_relations" ADD CONSTRAINT "product_relations_related_product_id_products_id_fk" FOREIGN KEY ("related_product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_skus" ADD CONSTRAINT "product_skus_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_rules" ADD CONSTRAINT "tax_rules_tax_class_id_tax_classes_id_fk" FOREIGN KEY ("tax_class_id") REFERENCES "public"."tax_classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_rules" ADD CONSTRAINT "tax_rules_tax_rate_id_tax_rates_id_fk" FOREIGN KEY ("tax_rate_id") REFERENCES "public"."tax_rates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zones" ADD CONSTRAINT "zones_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_email_idx" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "attr_desc_locale_idx" ON "attribute_descriptions" USING btree ("attribute_id","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "attr_group_desc_locale_idx" ON "attribute_group_descriptions" USING btree ("attribute_group_id","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "attr_val_desc_locale_idx" ON "attribute_value_descriptions" USING btree ("attribute_value_id","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "cart_cust_prod_idx" ON "carts" USING btree ("customer_id","product_id");--> statement-breakpoint
CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cat_desc_locale_idx" ON "category_descriptions" USING btree ("category_id","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "currencies_code_idx" ON "currencies" USING btree ("code");--> statement-breakpoint
CREATE INDEX "addr_customer_idx" ON "customer_addresses" USING btree ("customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wishlist_cust_prod_idx" ON "customer_wishlists" USING btree ("customer_id","product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_email_idx" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "languages_code_idx" ON "languages" USING btree ("code");--> statement-breakpoint
CREATE INDEX "notif_notifiable_idx" ON "notifications" USING btree ("notifiable_id","notifiable_type");--> statement-breakpoint
CREATE INDEX "history_order_idx" ON "order_histories" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_product_order_idx" ON "order_products" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "total_order_idx" ON "order_totals" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_number_idx" ON "orders" USING btree ("number");--> statement-breakpoint
CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "page_cat_desc_locale_idx" ON "page_category_descriptions" USING btree ("page_category_id","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "page_desc_locale_idx" ON "page_descriptions" USING btree ("page_id","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "prod_attr_idx" ON "product_attributes" USING btree ("product_id","attribute_id");--> statement-breakpoint
CREATE UNIQUE INDEX "prod_cat_idx" ON "product_categories" USING btree ("product_id","category_id");--> statement-breakpoint
CREATE INDEX "cat_prod_idx" ON "product_categories" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "prod_desc_locale_idx" ON "product_descriptions" USING btree ("product_id","locale");--> statement-breakpoint
CREATE INDEX "img_product_idx" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "sku_product_idx" ON "product_skus" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_sku_idx" ON "products" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "products_brand_idx" ON "products" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "settings_key_locale_idx" ON "settings" USING btree ("key","locale");