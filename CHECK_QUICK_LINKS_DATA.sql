-- Check current state of quick links (nav_tools) data
-- Run this in Supabase SQL Editor to see what's in the database

-- 1. Check if nav_tools table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'nav_tools'
    ) THEN '✅ nav_tools table EXISTS'
    ELSE '❌ nav_tools table MISSING'
  END AS nav_tools_table_status;

-- 2. Check if nav_sections table has data
SELECT 
  COUNT(*) as section_count,
  STRING_AGG(title, ', ') as section_titles
FROM nav_sections 
WHERE is_active = true;

-- 3. Check current nav_tools data
SELECT 
  nt.id,
  nt.title,
  nt.slug,
  ns.title as section_title,
  ns.slug as section_slug,
  nt.sort_order
FROM nav_tools nt
JOIN nav_sections ns ON nt.section_id = ns.id
ORDER BY ns.sort_order, nt.sort_order;

-- 4. Count tools per section
SELECT 
  ns.title as section_name,
  ns.slug as section_slug,
  COUNT(nt.id) as tool_count
FROM nav_sections ns
LEFT JOIN nav_tools nt ON ns.id = nt.section_id
WHERE ns.is_active = true
GROUP BY ns.id, ns.title, ns.slug
ORDER BY ns.sort_order;