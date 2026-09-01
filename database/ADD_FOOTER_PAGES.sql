-- Add About Us and Contact pages to the admin panel
-- These pages will be editable in Admin > Pages Management

-- About Us
INSERT INTO pages (slug, title, content, meta_title, meta_description, is_published)
VALUES (
  'about',
  'About Us',
  '<style>
  .page-content { max-width: 900px; margin: 0 auto; padding: 2rem; }
  .page-content h1 { font-size: 2.5rem; font-weight: bold; margin-bottom: 1.5rem; color: #1e293b; text-align: center; }
  .page-content h2 { font-size: 1.75rem; font-weight: 600; margin-top: 2.5rem; margin-bottom: 1rem; color: #334155; }
  .page-content p { line-height: 1.8; margin-bottom: 1.25rem; color: #475569; font-size: 1.05rem; }
  .page-content ul { margin-left: 2rem; margin-bottom: 1.5rem; }
  .page-content li { margin-bottom: 0.75rem; color: #475569; line-height: 1.7; }
  .hero-section { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 3rem 2rem; border-radius: 12px; margin-bottom: 3rem; text-align: center; }
  .hero-section h1 { color: white; }
  .mission-box { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px; }
  </style>
  
  <div class="page-content">
    <div class="hero-section">
      <h1>About Preparedness for War</h1>
      <p style="font-size: 1.2rem; margin: 0;">Your trusted source for emergency preparedness and survival intelligence</p>
    </div>
    
    <h2>Our Mission</h2>
    <div class="mission-box">
      <p style="font-size: 1.15rem; margin: 0;"><strong>We believe that preparedness is not paranoia—it''s responsibility.</strong></p>
      <p style="margin: 1rem 0 0 0;">Our mission is to provide accurate, actionable, and up-to-date information to help individuals, families, and communities prepare for emergencies and crisis situations.</p>
    </div>
    
    <h2>What We Do</h2>
    <p>Preparedness for War is a comprehensive platform dedicated to emergency preparedness, survival strategies, and geopolitical intelligence. We cover:</p>
    <ul>
      <li><strong>Emergency Preparedness:</strong> Practical guides for natural disasters, pandemics, and civil emergencies</li>
      <li><strong>Survival Skills:</strong> Essential knowledge for self-reliance and resilience</li>
      <li><strong>Geopolitical Analysis:</strong> Country-specific intelligence and regional threat assessments</li>
      <li><strong>Resource Library:</strong> Curated collection of documents, guides, and educational materials</li>
      <li><strong>Community Support:</strong> Connecting like-minded individuals committed to preparedness</li>
    </ul>
    
    <h2>Why Preparedness Matters</h2>
    <p>In an increasingly uncertain world, being prepared is no longer optional. From natural disasters to economic instability, from pandemics to geopolitical conflicts, the threats we face are real and evolving. Our platform empowers you with:</p>
    <ul>
      <li>Evidence-based preparedness strategies</li>
      <li>Real-time updates on global events</li>
      <li>Expert-curated content and resources</li>
      <li>Community-driven knowledge sharing</li>
    </ul>
    
    <h2>Our Commitment</h2>
    <p>We are committed to providing reliable, non-sensationalized information that helps you make informed decisions about your safety and security. We believe in:</p>
    <ul>
      <li><strong>Accuracy:</strong> Fact-checked, sourced information</li>
      <li><strong>Practicality:</strong> Actionable advice you can implement</li>
      <li><strong>Accessibility:</strong> Making preparedness knowledge available to everyone</li>
      <li><strong>Community:</strong> Building a network of prepared individuals</li>
    </ul>
    
    <p style="margin-top: 3rem; text-align: center; font-size: 1.1rem; color: #1e293b;"><strong>Stay informed. Stay prepared. Stay safe.</strong></p>
  </div>',
  'About Us - Preparedness for War',
  'Learn about our mission to provide emergency preparedness and survival intelligence.',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();

-- Contact Page
INSERT INTO pages (slug, title, content, meta_title, meta_description, is_published)
VALUES (
  'contact',
  'Contact Us',
  '<style>
  .page-content { max-width: 800px; margin: 0 auto; padding: 2rem; }
  .page-content h1 { font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem; color: #1e293b; text-align: center; }
  .page-content p { line-height: 1.8; margin-bottom: 1.25rem; color: #475569; font-size: 1.05rem; }
  .contact-intro { text-align: center; margin-bottom: 3rem; color: #64748b; }
  .contact-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 3rem 0; }
  .contact-card { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 2rem; text-align: center; transition: all 0.3s; }
  .contact-card:hover { border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15); }
  .contact-card h3 { font-size: 1.5rem; font-weight: 600; color: #1e293b; margin-bottom: 0.75rem; }
  .contact-card p { color: #64748b; margin-bottom: 1.5rem; font-size: 0.95rem; }
  .contact-button { display: inline-block; padding: 0.75rem 2rem; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: background 0.3s; }
  .contact-button:hover { background: #2563eb; }
  .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 1.5rem; margin: 2rem 0; border-radius: 8px; }
  .info-box p { color: #92400e; margin: 0; }
  </style>
  
  <div class="page-content">
    <h1>Get in Touch</h1>
    <p class="contact-intro">Have questions, suggestions, or feedback? We''d love to hear from you.</p>
    
    <div class="contact-cards">
      <div class="contact-card">
        <h3>📧 General Inquiries</h3>
        <p>For general questions about our platform, content, or services.</p>
        <a href="mailto:info@preparednessforwar.com" class="contact-button">Email Us</a>
      </div>
      
      <div class="contact-card">
        <h3>📝 Content Submissions</h3>
        <p>Have valuable preparedness content or resources to share with the community?</p>
        <a href="mailto:submissions@preparednessforwar.com" class="contact-button">Submit Content</a>
      </div>
      
      <div class="contact-card">
        <h3>🤝 Partnerships</h3>
        <p>Interested in partnering with us or becoming an affiliate?</p>
        <a href="mailto:partnerships@preparednessforwar.com" class="contact-button">Partner With Us</a>
      </div>
      
      <div class="contact-card">
        <h3>🛠️ Technical Support</h3>
        <p>Experiencing technical issues or need help with your account?</p>
        <a href="mailto:support@preparednessforwar.com" class="contact-button">Get Support</a>
      </div>
    </div>
    
    <div class="info-box">
      <p><strong>⚠️ Emergency Notice:</strong> This platform is for educational and informational purposes only. In case of immediate emergency, always contact your local emergency services (911 in the US).</p>
    </div>
    
    <div style="text-align: center; margin-top: 3rem; padding-top: 2rem; border-top: 2px solid #e2e8f0;">
      <h3 style="color: #1e293b; margin-bottom: 1rem;">Response Time</h3>
      <p style="color: #64748b;">We typically respond to all inquiries within 24-48 hours during business days. Thank you for your patience.</p>
    </div>
  </div>',
  'Contact Us - Preparedness for War',
  'Get in touch with us for inquiries, support, partnerships, or content submissions.',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();
