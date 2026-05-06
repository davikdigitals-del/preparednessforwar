import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Search, User, Globe, Mail, Calendar, Mic, Video, Newspaper, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { navSections } from "@/data/mockData";
import { MegaMenu, MegaMenuTrigger, MegaMenuContent, type MegaMenuConfig } from "@/components/MegaMenu";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const mainNavItems = [
    { label: "Emergency News", to: "/emergency-news", section: "emergency-news" },
    { label: "Survival Guides", to: "/survival-guides", section: "survival-guides" },
    { label: "Health & Vaccination", to: "/health", section: "health" },
    { label: "Official Directives", to: "/directives", section: "directives" },
    { label: "Essential Supplies", to: "/supplies", section: "supplies" },
    { label: "Resources", to: "/resources", section: "resources" },
    { label: "Education", to: "/education", section: "education" },
  ];

  // Create MegaMenuConfig for each section with categories
  const createMenuConfig = (sectionSlug: string): MegaMenuConfig | null => {
    const section = navSections.find(s => s.slug === sectionSlug);
    if (!section || section.categories.length === 0) return null;

    // Ensure we have at least 3 categories (requirement)
    const categories = section.categories.slice(0, 12); // Max 12
    if (categories.length < 3) return null;

    return {
      menuId: sectionSlug,
      categories: {
        heading: 'Categories',
        items: categories.map(cat => ({
          id: cat.slug,
          label: cat.title,
          href: `/${sectionSlug}/${cat.slug}`,
        })),
      },
      programmes: {
        heading: 'Quick Links',
        groups: [
          {
            id: 'main',
            label: 'Main Section',
            href: `/${sectionSlug}`,
            subProgrammes: [
              { id: 'all', label: 'View All', href: `/${sectionSlug}` },
              { id: 'latest', label: 'Latest Updates', href: `/${sectionSlug}?sort=latest` },
            ],
          },
          {
            id: 'resources',
            label: 'Related Resources',
            href: '/resources',
            subProgrammes: [
              { id: 'library', label: 'Library', href: '/library' },
              { id: 'encyclopaedia', label: 'Encyclopaedia', href: '/encyclopaedia' },
            ],
          },
        ],
      },
      featured: {
        heading: 'Featured',
        items: [
          {
            id: 'featured-1',
            title: `${section.title} Updates`,
            description: `Stay informed with the latest ${section.title.toLowerCase()} information`,
            imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=225&fit=crop',
            href: `/${sectionSlug}`,
          },
        ],
      },
    };
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      {/* Top utility bar */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-10 text-xs">
            <div className="flex items-center gap-4">
              <Link to="/countries" className="flex items-center gap-1 text-gray-600 hover:text-primary">
                <Globe className="w-3 h-3" />
                <span>Countries</span>
              </Link>
              <Link to="/newsletter" className="flex items-center gap-1 text-gray-600 hover:text-primary">
                <Mail className="w-3 h-3" />
                <span>Newsletter</span>
              </Link>
              <Link to="/library" className="flex items-center gap-1 text-gray-600 hover:text-primary">
                <Newspaper className="w-3 h-3" />
                <span>Library</span>
              </Link>
              <Link to="/encyclopaedia" className="flex items-center gap-1 text-gray-600 hover:text-primary">
                <Newspaper className="w-3 h-3" />
                <span>Encyclopaedia</span>
              </Link>
              <Link to="/media" className="flex items-center gap-1 text-gray-600 hover:text-primary">
                <Video className="w-3 h-3" />
                <span>Media Hub</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-gray-600 hover:text-primary">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <Link to="/" className="flex items-center">
              <div className="px-4 py-2 flex items-center gap-2">
                <span className="text-blue-900 text-2xl font-black">
                  PH
                </span>
                <span className="font-black text-xl tracking-tight text-gray-900">
                  preparedness<span className="font-light">for</span>war
                </span>
              </div>
            </Link>
          </div>

          {/* Main Navigation with MegaMenu */}
          <MegaMenu>
            <nav className="hidden lg:flex items-center gap-1">
              {mainNavItems.map((item) => {
                const menuConfig = item.section ? createMenuConfig(item.section) : null;

                if (menuConfig) {
                  // Render with mega menu
                  return (
                    <div key={item.label}>
                      <MegaMenuTrigger
                        menuId={item.section!}
                        label={item.label}
                        href={item.to}
                        className="px-4 py-2 text-sm font-semibold text-gray-700"
                      />
                      <MegaMenuContent
                        menuId={item.section!}
                        config={menuConfig}
                      />
                    </div>
                  );
                } else {
                  // Render as regular link
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-primary hover:bg-gray-100 rounded transition-colors"
                    >
                      {item.label}
                    </Link>
                  );
                }
              })}
            </nav>
          </MegaMenu>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden lg:flex">
                  <Link to="/dashboard">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={logout} className="hidden lg:flex">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden lg:flex">
                  <Link to="/login">
                    <User className="w-4 h-4 mr-2" />
                    Log In
                  </Link>
                </Button>
                <Button variant="default" size="sm" asChild className="hidden lg:flex">
                  <Link to="/signup">
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            {mainNavItems.map((item) => {
              const section = navSections.find(s => s.slug === item.section);
              const hasCategories = section && section.categories.length > 0;

              return (
                <div key={item.label}>
                  <Link
                    to={item.to}
                    className="block px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 hover:text-primary rounded"
                    onClick={() => !hasCategories && setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {hasCategories && (
                    <div className="ml-4 mt-1 space-y-1">
                      {section.categories.map((category) => (
                        <Link
                          key={category.slug}
                          to={`/${item.section}/${category.slug}`}
                          className="block px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-50 hover:text-primary rounded"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {category.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Mobile Auth Links */}
            <div className="border-t border-gray-200 pt-2 mt-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 hover:text-primary rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left block px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 hover:text-primary rounded"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 hover:text-primary rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-4 py-2 text-sm font-semibold text-primary hover:bg-gray-50 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
            
            <Link
              to="/legal/privacy"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Legal
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
