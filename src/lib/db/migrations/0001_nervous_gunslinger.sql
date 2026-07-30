CREATE TABLE "shipping_method_descriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"shipping_method_id" integer NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "shipping_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"icon" varchar(500),
	"base_fee" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"free_shipping_threshold" numeric(10, 2) DEFAULT '0.00',
	"estimated_days" varchar(100),
	"status" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "shipping_methods_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_status" varchar(50) DEFAULT 'unpaid';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_id" varchar(500);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "paid_at" timestamp;--> statement-breakpoint
ALTER TABLE "shipping_method_descriptions" ADD CONSTRAINT "shipping_method_descriptions_shipping_method_id_shipping_methods_id_fk" FOREIGN KEY ("shipping_method_id") REFERENCES "public"."shipping_methods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "shipping_method_locale_idx" ON "shipping_method_descriptions" USING btree ("shipping_method_id","locale");