-- ============================================================
-- P2#21: updated_at 自动更新触发器
-- 为所有包含 updated_at 列的表添加自动更新触发器
-- ============================================================

-- 1. 创建触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. 为每个包含 updated_at 的表应用触发器
-- 商品体系
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'updated_at') THEN
    DROP TRIGGER IF EXISTS trg_brands_updated_at ON brands;
    CREATE TRIGGER trg_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'updated_at') THEN
    DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
    CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at') THEN
    DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
    CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 客户体系
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'updated_at') THEN
    DROP TRIGGER IF EXISTS trg_customers_updated_at ON customers;
    CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carts' AND column_name = 'updated_at') THEN
    DROP TRIGGER IF EXISTS trg_carts_updated_at ON carts;
    CREATE TRIGGER trg_carts_updated_at BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 订单体系
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'updated_at') THEN
    DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
    CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rmas' AND column_name = 'updated_at') THEN
    DROP TRIGGER IF EXISTS trg_rmas_updated_at ON rmas;
    CREATE TRIGGER trg_rmas_updated_at BEFORE UPDATE ON rmas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 系统体系
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'updated_at') THEN
    DROP TRIGGER IF EXISTS trg_admin_users_updated_at ON admin_users;
    CREATE TRIGGER trg_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'updated_at') THEN
    DROP TRIGGER IF EXISTS trg_pages_updated_at ON pages;
    CREATE TRIGGER trg_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shipping_methods' AND column_name = 'updated_at') THEN
    DROP TRIGGER IF EXISTS trg_shipping_methods_updated_at ON shipping_methods;
    CREATE TRIGGER trg_shipping_methods_updated_at BEFORE UPDATE ON shipping_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;