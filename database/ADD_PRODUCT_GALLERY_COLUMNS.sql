-- Add images array and video_url to affiliate_products
-- Run this in Supabase SQL Editor

ALTER TABLE affiliate_products
  ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT '';
