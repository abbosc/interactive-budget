-- Budget App Database Schema
-- Run this in Supabase SQL Editor

-- 1. Budget Configuration Table
CREATE TABLE IF NOT EXISTS budget_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_income BIGINT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  display_order INT4 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Subcategories Table
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  default_value BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Subcategory Impacts Table (threshold messages)
CREATE TABLE IF NOT EXISTS subcategory_impacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE CASCADE,
  threshold_type TEXT NOT NULL CHECK (threshold_type IN ('increase_3', 'increase_7', 'decrease_3', 'decrease_7')),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(subcategory_id, threshold_type)
);

-- 5. Budget Plans Table (user submissions)
CREATE TABLE IF NOT EXISTS budget_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_config_id UUID REFERENCES budget_config(id),
  user_name TEXT,
  user_age INT4,
  user_occupation TEXT,
  changes JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_income BIGINT NOT NULL,
  total_expenses BIGINT NOT NULL,
  deficit BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE budget_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategory_impacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public access (no auth needed)
CREATE POLICY "Public read budget_config"
  ON budget_config FOR SELECT
  USING (TRUE);

CREATE POLICY "Public update budget_config"
  ON budget_config FOR UPDATE
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Public read categories"
  ON categories FOR SELECT
  USING (TRUE);

CREATE POLICY "Public insert categories"
  ON categories FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Public update categories"
  ON categories FOR UPDATE
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Public delete categories"
  ON categories FOR DELETE
  USING (TRUE);

CREATE POLICY "Public read subcategories"
  ON subcategories FOR SELECT
  USING (TRUE);

CREATE POLICY "Public insert subcategories"
  ON subcategories FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Public update subcategories"
  ON subcategories FOR UPDATE
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Public delete subcategories"
  ON subcategories FOR DELETE
  USING (TRUE);

CREATE POLICY "Public read subcategory_impacts"
  ON subcategory_impacts FOR SELECT
  USING (TRUE);

CREATE POLICY "Public insert subcategory_impacts"
  ON subcategory_impacts FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Public update subcategory_impacts"
  ON subcategory_impacts FOR UPDATE
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Public delete subcategory_impacts"
  ON subcategory_impacts FOR DELETE
  USING (TRUE);

CREATE POLICY "Public read budget_plans"
  ON budget_plans FOR SELECT
  USING (TRUE);

CREATE POLICY "Public insert budget_plans"
  ON budget_plans FOR INSERT
  WITH CHECK (TRUE);

-- Insert sample data
INSERT INTO budget_config (total_income, is_active)
VALUES (2181445400000, TRUE);

INSERT INTO categories (name, icon, color, display_order) VALUES
  ('Ma''orif', '&#xf02d;', '#9e8a00', 1),
  ('Ijimoiy', '&#xf0c0;', '#ff6b35', 2),
  ('Iqtisodiyotga xarajatlar', '&#xf0a3;', '#2ecc71', 3);

INSERT INTO subcategories (category_id, name, default_value)
SELECT
  c.id,
  'Yangi kichik toifa',
  10000000000
FROM categories c
LIMIT 1;
