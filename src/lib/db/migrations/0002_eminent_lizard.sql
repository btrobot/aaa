ALTER TABLE "rmas" ADD COLUMN "order_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "rmas" ADD COLUMN "type" varchar(50) DEFAULT 'refund' NOT NULL;--> statement-breakpoint
ALTER TABLE "rmas" ADD COLUMN "admin_note" text;