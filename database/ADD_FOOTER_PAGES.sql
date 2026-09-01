-- Add standard footer pages to the admin panel
-- These pages will be editable in Admin > Pages Management

-- Privacy Policy
INSERT INTO pages (slug, title, content, meta_title, meta_description, is_published)
VALUES (
  'privacy',
  'Privacy Policy',
  '<style>
  .page-content { max-width: 800px; margin: 0 auto; padding: 2rem; }
  .page-content h1 { font-size: 2rem; font-weight: bold; margin-bottom: 1rem; color: #1e293b; }
  .page-content h2 { font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: #334155; }
  .page-content p { line-height: 1.7; margin-bottom: 1rem; color: #475569; }
  .page-content ul { margin-left: 1.5rem; margin-bottom: 1rem; }
  .page-content li { margin-bottom: 0.5rem; color: #475569; }
  </style>
  
  <div class="page-content">
    <h1>Privacy Policy</h1>
    <p><strong>Last Updated:</strong> ' || to_char(CURRENT_DATE, 'Month DD, YYYY') || '</p>
    
    <h2>Information We Collect</h2>
    <p>We collect information you provide directly to us, including:</p>
    <ul>
      <li>Account information (email, password)</li>
      <li>Profile information</li>
      <li>Content you create or share</li>
      <li>Payment information (processed securely through Stripe)</li>
    </ul>
    
    <h2>How We Use Your Information</h2>
    <p>We use the information we collect to:</p>
    <ul>
      <li>Provide, maintain, and improve our services</li>
      <li>Process transactions and send related information</li>
      <li>Send you technical notices and support messages</li>
      <li>Respond to your comments and questions</li>
    </ul>
    
    <h2>Data Security</h2>
    <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
    
    <h2>Contact Us</h2>
    <p>If you have questions about this Privacy Policy, please contact us through our website.</p>
  </div>',
  'Privacy Policy - Preparedness for War',
  'Learn how we collect, use, and protect your personal information.',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();

-- Terms of Service
INSERT INTO pages (slug, title, content, meta_title, meta_description, is_published)
VALUES (
  'terms',
  'Terms of Service',
  '<style>
  .page-content { max-width: 800px; margin: 0 auto; padding: 2rem; }
  .page-content h1 { font-size: 2rem; font-weight: bold; margin-bottom: 1rem; color: #1e293b; }
  .page-content h2 { font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: #334155; }
  .page-content p { line-height: 1.7; margin-bottom: 1rem; color: #475569; }
  .page-content ul { margin-left: 1.5rem; margin-bottom: 1rem; }
  .page-content li { margin-bottom: 0.5rem; color: #475569; }
  </style>
  
  <div class="page-content">
    <h1>Terms of Service</h1>
    <p><strong>Last Updated:</strong> ' || to_char(CURRENT_DATE, 'Month DD, YYYY') || '</p>
    
    <h2>Acceptance of Terms</h2>
    <p>By accessing and using Preparedness for War, you accept and agree to be bound by the terms and provision of this agreement.</p>
    
    <h2>Use License</h2>
    <p>Permission is granted to temporarily access the materials on Preparedness for War for personal, non-commercial use only.</p>
    
    <h2>User Content</h2>
    <p>You retain all rights to content you submit, post or display on or through the service. By submitting content, you grant us a license to use, modify, and display that content.</p>
    
    <h2>Prohibited Uses</h2>
    <p>You may not use our service:</p>
    <ul>
      <li>For any unlawful purpose</li>
      <li>To harass, abuse, or harm another person</li>
      <li>To impersonate or attempt to impersonate another user</li>
      <li>To upload viruses or malicious code</li>
    </ul>
    
    <h2>Termination</h2>
    <p>We may terminate or suspend your account at any time, without prior notice, for conduct that we believe violates these Terms of Service.</p>
    
    <h2>Changes to Terms</h2>
    <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
  </div>',
  'Terms of Service - Preparedness for War',
  'Read our terms of service and user agreement.',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();

-- Disclaimer
INSERT INTO pages (slug, title, content, meta_title, meta_description, is_published)
VALUES (
  'disclaimer',
  'Disclaimer',
  '<style>
  .page-content { max-width: 800px; margin: 0 auto; padding: 2rem; }
  .page-content h1 { font-size: 2rem; font-weight: bold; margin-bottom: 1rem; color: #1e293b; }
  .page-content h2 { font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: #334155; }
  .page-content p { line-height: 1.7; margin-bottom: 1rem; color: #475569; }
  .page-content .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 1rem; margin: 1.5rem 0; }
  </style>
  
  <div class="page-content">
    <h1>Disclaimer</h1>
    <p><strong>Last Updated:</strong> ' || to_char(CURRENT_DATE, 'Month DD, YYYY') || '</p>
    
    <div class="warning">
      <strong>Important:</strong> The information provided on this website is for educational and informational purposes only.
    </div>
    
    <h2>No Professional Advice</h2>
    <p>The content on Preparedness for War is not intended to be a substitute for professional advice, whether medical, legal, financial, or otherwise. Always seek the advice of qualified professionals regarding any questions you may have.</p>
    
    <h2>Accuracy of Information</h2>
    <p>While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind about the completeness, accuracy, reliability, or availability of the information on this website.</p>
    
    <h2>External Links</h2>
    <p>This website may contain links to external websites. We have no control over the content of those sites and accept no responsibility for them or for any loss or damage that may arise from your use of them.</p>
    
    <h2>Use at Your Own Risk</h2>
    <p>Any action you take based on information found on this website is strictly at your own risk. We will not be liable for any losses or damages in connection with the use of this website.</p>
    
    <h2>Emergency Situations</h2>
    <p>In case of emergency, always contact local emergency services immediately. Do not rely solely on information from this website for emergency response.</p>
  </div>',
  'Disclaimer - Preparedness for War',
  'Important disclaimers about the use of information on this website.',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();

-- Newsletter page
INSERT INTO pages (slug, title, content, meta_title, meta_description, is_published)
VALUES (
  'newsletter',
  'Newsletter',
  '<style>
  .page-content { max-width: 600px; margin: 0 auto; padding: 2rem; text-align: center; }
  .page-content h1 { font-size: 2rem; font-weight: bold; margin-bottom: 1rem; color: #1e293b; }
  .page-content p { line-height: 1.7; margin-bottom: 1.5rem; color: #475569; }
  .benefits { text-align: left; max-width: 400px; margin: 2rem auto; }
  .benefits li { padding: 0.75rem 0; border-bottom: 1px solid #e2e8f0; color: #475569; }
  .benefits li:last-child { border-bottom: none; }
  .cta-box { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 2rem; margin-top: 2rem; }
  </style>
  
  <div class="page-content">
    <h1>📬 Stay Prepared</h1>
    <p>Get the latest emergency preparedness news, survival tips, and critical updates delivered straight to your inbox.</p>
    
    <ul class="benefits">
      <li>✓ Weekly preparedness insights</li>
      <li>✓ Early access to new content</li>
      <li>✓ Exclusive survival guides</li>
      <li>✓ Community updates</li>
    </ul>
    
    <div class="cta-box">
      <p><strong>Newsletter subscription coming soon!</strong></p>
      <p style="font-size: 0.9rem; color: #64748b;">We''re working on bringing you the best emergency preparedness content. Check back soon or create an account to stay updated.</p>
    </div>
  </div>',
  'Newsletter - Preparedness for War',
  'Subscribe to our newsletter for emergency preparedness tips and updates.',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();
