-- 1. For KPI queries (orders by date and status):
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at);

-- 2. For sales by period query (DATE_TRUNC on created_at):
CREATE INDEX IF NOT EXISTS idx_orders_created_status ON orders(created_at, status) WHERE status = 'completed';

 --3. For top products query (order_items + product JOIN):
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
    CREATE INDEX IF NOT EXISTS idx_orders_id_status ON orders(id, status);

-- 4. For inventory alerts (stock comparison):
CREATE INDEX IF NOT EXISTS idx_inventory_stock ON inventory(stock_current, stock_minimum);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);

-- 5. For recent orders (join with users):
CREATE INDEX IF NOT EXISTS idx_orders_created_desc ON orders(created_at DESC);
--CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- 6. For users count by date:
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

