-- Add indexes for better performance on large datasets

-- Index for items ordered by createdAt (most common query)
CREATE INDEX IF NOT EXISTS "items_created_at_idx" ON "items" ("created_at" DESC);

-- Index for item categories relationship lookups
CREATE INDEX IF NOT EXISTS "item_categories_item_id_idx" ON "item_categories" ("item_id");
CREATE INDEX IF NOT EXISTS "item_categories_category_id_idx" ON "item_categories" ("category_id");

-- Composite index for efficient category-item joins
CREATE INDEX IF NOT EXISTS "item_categories_composite_idx" ON "item_categories" ("category_id", "item_id");

-- Index for order queries
CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" ("status");

-- Index for order items
CREATE INDEX IF NOT EXISTS "order_items_order_id_idx" ON "order_items" ("order_id");
CREATE INDEX IF NOT EXISTS "order_items_item_id_idx" ON "order_items" ("item_id");

-- Index for categories ordering
CREATE INDEX IF NOT EXISTS "categories_order_name_idx" ON "categories" ("order" ASC, "name" ASC);