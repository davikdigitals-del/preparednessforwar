import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LanguagePicker } from "@/components/LanguagePicker";
import { supabase } from "@/integrations/supabase/client";
import { Facebook, Twitter, Youtube, Instagram, Linkedin } from "lucide-react";

interface FooterPage {
  slug: string;
  title: string;
}

interface SocialLinks {
  twitter?: string;
  facebook?: string;
  youtube?: string;
  instagram?: string;
  linkedin?: string;
}

interface SiteSettings {
  site_name?: string;
  site_description?: string;
  contact_email?: string;
}

export function SiteFooter() {
  const [pages, setPages] = useState<FooterPage[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});

  useEffect(() => {
    // Fetch footer pages
    supabase
      .from("pages")
      .select("slug, title")
      .eq("is_published", true)
      .order("title")
      .then(({ data }) => {
        if (data && data.length > 0) setPages(data as FooterPage[]);
      });

    // Fetch social media links
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["twitter", "facebook", "youtube", "instagram", "linkedin"])
      .then(({ data }) => {
        if (data) {
          const links: SocialLinks = {};
          data.forEach((item: any) => {
            if (item.value) links[item.key as keyof SocialLinks] = item.value;
          });
          setSocialLinks(links);
        }
      });

    // Fetch general site settings
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["site_name", "site_description", "contact_email"])
      .then(({ data }) => {
        if (data) {
          const settings: SiteSettings = {};
          data.forEach((item: any) => {
            if (item.value) settings[item.key as keyof SiteSettings] = item.value;
          });
          setSiteSettings(settings);
        }
      });
  }, []);

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand + Language */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{siteSettings.site_name || "Preparedness for War"}</h3>
            <p className="text-sm text-muted-foreground">
              {siteSettings.site_description || "Your trusted source for emergency preparedness and survival intelligence."}
            </p>
            {siteSettings.contact_email && (
              <p className="text-sm">
                <a href={`mailto:${siteSettings.contact_email}`} className="text-muted-foreground hover:text-primary transition-colors">
                  {siteSettings.contact_email}
                </a>
              </p>
            )}
            <LanguagePicker />

            {/* Social Media Icons */}
            {Object.keys(socialLinks).length > 0 && (
              <div className="flex items-center gap-3 pt-2">
                {socialLinks.twitter && (
                  <a
                    href={socialLinks.twitter.startsWith('http') ? socialLinks.twitter : `https://twitter.com/${socialLinks.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.facebook && (
                  <a
                    href={socialLinks.facebook.startsWith('http') ? socialLinks.facebook : `https://facebook.com/${socialLinks.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.youtube && (
                  <a
                    href={socialLinks.youtube.startsWith('http') ? socialLinks.youtube : `https://youtube.com/${socialLinks.youtube}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram.startsWith('http') ? socialLinks.instagram : `https://instagram.com/${socialLinks.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a
                    href={socialLinks.linkedin.startsWith('http') ? socialLinks.linkedin : `https://linkedin.com/${socialLinks.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Content</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/latest" className="text-muted-foreground hover:text-primary transition-colors">Latest News</Link></li>
              <li><Link to="/countries" className="text-muted-foreground hover:text-primary transition-colors">Countries</Link></li>
              <li><Link to="/media" className="text-muted-foreground hover:text-primary transition-colors">Media Hub</Link></li>
              <li><Link to="/library" className="text-muted-foreground hover:text-primary transition-colors">Library</Link></li>
              <li><Link to="/encyclopaedia" className="text-muted-foreground hover:text-primary transition-colors">Encyclopaedia</Link></li>
            </ul>
          </div>

          {/* Dynamic pages from DB */}
          {pages.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm">
                {pages.map((page) => (
                  <li key={page.slug}>
                    <Link
                      to={`/pages/${page.slug}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {siteSettings.site_name || "Preparedness for War"}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
