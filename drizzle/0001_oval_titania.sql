ALTER TABLE "orders" ALTER COLUMN "mall_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "mall_name" varchar(100);--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "mall_id" integer;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_mall_id_malls_id_fk" FOREIGN KEY ("mall_id") REFERENCES "public"."malls"("id") ON DELETE no action ON UPDATE no action;