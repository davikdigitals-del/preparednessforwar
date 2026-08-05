-- Add is_premium column to library_items table
-- This allows library resources to be marked as premium content

-- Add the column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'library_items' 
    AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE library_items ADD COLUMN is_premium BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added is_premium column to library_items';
  ELSE
    RAISE NOTICE 'is_premium column already exists in library_items';
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_library_items_is_premium ON library_items(is_premium);

-- Update any existing premium content if needed (example - adjust as needed)
-- UPDATE library_items SET is_premium = true WHERE category = 'Premium Guides';

COMMENT ON COLUMN library_items.is_premium IS 'Whether this library item requires a premium subscription to access';
