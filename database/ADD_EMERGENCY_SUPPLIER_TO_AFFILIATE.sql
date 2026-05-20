-- Add emergency supplier fields to affiliate_products table
-- Run this in Supabase SQL Editor

ALTER TABLE affiliate_products
  ADD COLUMN IF NOT EXISTS is_emergency_supplier BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS supplier_phone TEXT,
  ADD COLUMN IF NOT EXISTS supplier_address TEXT,
  ADD COLUMN IF NOT EXISTS supplier_city TEXT,
  ADD COLUMN IF NOT EXISTS supplier_postcode TEXT,
  ADD COLUMN IF NOT EXISTS supplier_opening_hours TEXT,
  ADD COLUMN IF NOT EXISTS supplier_accepts_cash BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS supplier_coordinates TEXT;

-- Index for quick lookup of emergency suppliers
CREATE INDEX IF NOT EXISTS idx_affiliate_products_emergency ON affiliate_products(is_emergency_supplier) WHERE is_emergency_supplier = TRUE;
