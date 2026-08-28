-- ============================================================================
-- Add structured content fields to education_programmes
-- Run this in Supabase SQL editor
-- ============================================================================

ALTER TABLE public.education_programmes
  ADD COLUMN IF NOT EXISTS topics    jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS activities jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS subjects  jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS downloads jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ks_key    text;  -- e.g. KS1, KS2, KS3, KS4

-- ============================================================================
-- Seed the 4 Key Stage homeschool programmes
-- ============================================================================

INSERT INTO public.education_programmes (
  title, description, programme_type, age_group, age_label, level,
  badge_icon, ks_key, is_published, sort_order,
  topics, activities, subjects, downloads
) VALUES
(
  'Staying Safe at Home',
  'Young children learn what an emergency is, who the helpers are, and what simple actions keep them safe at home and school.',
  'homeschool', '5-7', 'Key Stage 1', 'beginner',
  '🏠', 'KS1', true, 1,
  '["What is an emergency? Fire, flood, and first aid basics","Know your address and when to call 999","Safe rooms and meeting points at home","Stranger awareness and asking trusted adults for help","Basic hygiene and hand-washing to prevent illness"]'::jsonb,
  '["Draw your home''s fire escape route","Role-play calling 999 with a parent","Build a mini emergency kit from household items"]'::jsonb,
  '["PSHE","Science","Geography"]'::jsonb,
  '[{"title":"KS1 Safety Colouring Sheet","url":"#"},{"title":"My Emergency Contact Card","url":"#"}]'::jsonb
),
(
  'Natural Disasters & Emergency Services',
  'Children explore natural hazards, understand the role of emergency services, and learn how families and communities prepare for and recover from disasters.',
  'homeschool', '7-11', 'Key Stage 2', 'beginner',
  '🎒', 'KS2', true, 2,
  '["Types of natural disaster: floods, storms, earthquakes, wildfires","The role of police, fire, ambulance, and coastguard","Building a 72-hour emergency kit","First aid basics: cuts, burns, and choking","Climate change and its impact on extreme weather","Community resilience and neighbourhood planning"]'::jsonb,
  '["Map your local area for flood risk zones","Pack a real 72-hour kit as a family project","Write a family emergency communication plan","Research a real disaster and present findings"]'::jsonb,
  '["Geography","Science","PSHE","Computing"]'::jsonb,
  '[{"title":"72-Hour Kit Checklist","url":"#"},{"title":"UK Natural Hazards Worksheet","url":"#"},{"title":"Family Communication Plan Template","url":"#"}]'::jsonb
),
(
  'Geopolitics, Civil Defence & Resilience',
  'Students explore the geopolitical landscape, the history and purpose of civil defence, and what resilience means at national and individual levels.',
  'homeschool', '11-14', 'Key Stage 3', 'intermediate',
  '🗺️', 'KS3', true, 3,
  '["Introduction to NATO, the UN, and international security","Cold War civil defence history and modern equivalents","CBRN awareness: chemical, biological, radiological, nuclear basics","Psychological resilience and stress management in a crisis","Critical infrastructure: power, water, food supply chains","Media literacy: identifying misinformation in an emergency","Evacuation planning and reading topographic maps"]'::jsonb,
  '["Debate: should every citizen know how to respond to a national emergency?","Create an infographic on NATO Article 5","Design a community shelter plan for a fictional town","Analyse a real emergency broadcast for accuracy"]'::jsonb,
  '["Geography","History","Citizenship","PSHE","Computing"]'::jsonb,
  '[{"title":"Civil Defence History Timeline","url":"#"},{"title":"Evacuation Route Planning Sheet","url":"#"},{"title":"Media Literacy Checklist","url":"#"}]'::jsonb
),
(
  'Global Security & Survival Science',
  'Advanced study combining geopolitics, survival science, first responder skills, and ethical considerations around national security and civil liberties.',
  'homeschool', '14-16', 'Key Stage 4', 'advanced',
  '🔬', 'KS4', true, 4,
  '["Global threat landscape: terrorism, cyber warfare, hybrid threats","First responder skills: triage, CPR, and casualty management","Water purification, food security, and off-grid living","Cyber security and protecting personal data in a crisis","UK Emergency Powers Act and civil contingencies legislation","Mental health in prolonged emergencies: PTSD and coping strategies","Ethics of preparedness: privacy vs. security debate"]'::jsonb,
  '["Complete a basic first aid qualification","Write a personal 30-day preparedness plan","Analyse the UK National Risk Register","Simulate a cyber incident response tabletop exercise"]'::jsonb,
  '["Geography","Politics","Biology","Computing","PSHE"]'::jsonb,
  '[{"title":"30-Day Preparedness Planner","url":"#"},{"title":"UK National Risk Register Summary","url":"#"},{"title":"First Aid Quick Reference Card","url":"#"}]'::jsonb
);
