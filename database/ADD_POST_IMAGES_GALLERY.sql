-- Add support for multiple images (gallery) to posts table
-- This allows posts to have multiple featured images that can be previewed

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Update existing posts: if they have an image_url, add it to the images array
UPDATE posts
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL 
  AND image_url != ''
  AND (images IS NULL OR array_length(images, 1) IS NULL);

-- Keep image_url for backward compatibility (it will be the first image in the array)
COMMENT ON COLUMN posts.images IS 'Array of image URLs for post gallery/multiple featured images';
COMMENT ON COLUMN posts.image_url IS 'Primary featured image (for backward compatibility, synced with images[0])';
