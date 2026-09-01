--Add simple About Us and Contact pages
--You can edit and add full content from the admin panel

--About Us(empty template - add content in admin)
INSERT INTO pages(slug, title, content, meta_title, meta_description, is_published)
VALUES(
    'about',
    'About Us',
    '<div style="max-width: 800px; margin: 0 auto; padding: 2rem;">
    < h1 > About Us</h1 >
<p>Content coming soon...</p>
</div > ',
  'About Us - Preparedness for War',
    'Learn about Preparedness for War.',
    true
)
ON CONFLICT(slug) DO UPDATE SET
title = EXCLUDED.title,
    content = EXCLUDED.content,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    updated_at = NOW();

--Contact(empty template - add content in admin)
INSERT INTO pages(slug, title, content, meta_title, meta_description, is_published)
VALUES(
    'contact',
    'Contact Us',
    '<div style="max-width: 800px; margin: 0 auto; padding: 2rem;">
    < h1 > Contact Us</h1 >
<p>Get in touch with us...</p>
</div > ',
  'Contact Us - Preparedness for War',
    'Contact Preparedness for War.',
    true
)
ON CONFLICT(slug) DO UPDATE SET
title = EXCLUDED.title,
    content = EXCLUDED.content,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    updated_at = NOW();
