import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Search, User, Globe, Mail, X, Video, Newspaper, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { navSections } from "@/data/mockData";
import { MegaMenu, MegaMenuTrigger, MegaMenuContent } from "@/components/MegaMenu";
import type { MegaMenuConfig } from "@/components/MegaMenu";

// Build a MegaMenuConfig from a navSection
function buildMenuConfig(section: (typeof navSections)[number]): MegaMenuConfig {
  return {
    menuId: section.slug,
    categories: {
      heading: "Categories",
      items: section.categories.map((cat) => ({
        id: cat.slug,
        label: cat.title,
        href: `/${section.slug}/${cat.slug}`,
      })),
    },
    programmes: {
      heading: "Quick Links",
      groups: [
        {
          id: "all",
          label: `All ${section.title}`,
          href: `/${section.slug}`,
        },
        ...(section.tools ?? []).map((tool) => ({
          id: tool.slug,
          label: tool.title,
          href: `/${section.slug}/${tool.slug}`,
        })),
      ],
    },
    featured: {
      heading: "Featured",
      items: (section.featured ?? []).map((f) => ({
        id: f.slug,
        title: f.title,
        description: "",
        imageUrl: f.image ?? "/placeholder.svg",
        href: `/${section.slug}/${f.slug}`,
      })),
    },
  };
}

const mainNavItems = [
  { label: "Emergency News", to: "/emergency-news", section: "emergency-news" },
  { label: "Survival Guides", to: "/survival-guides", section: "survival-guides" },
  { label: "Health & Vaccination", to: "/health", section: "health" },
  { label: "Official Directives", to: "/directives", section: "directives" },
  { label: "Essential Supplies", to: "/supplies", section: "supplies" },
  { label: "Resources", to: "/resources", section: "resources" },
  { label: "Education", to: "/education", section: "education" },
];

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm relative">
      {/* Top utility bar - Hidden on mobile */}
      <div className="hidden md:block border-b border-gray-100 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-10 text-xs">
            <div className="flex items-center gap-4">
              <Link to="/countries" className="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors">
                <Globe className="w-3 h-3" />
                <span>Countries</span>
              </Link>
              <Link to="/newsletter" className="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors">
                <Mail className="w-3 h-3" />
                <span>Newsletter</span>
              </Link>
              <Link to="/library" className="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors">
                <Newspaper className="w-3 h-3" />
                <span>Library</span>
              </Link>
              <Link to="/encyclopaedia" className="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors">
                <Newspaper className="w-3 h-3" />
                <span>Encyclopaedia</span>
              </Link>
              <Link to="/media" className="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors">
                <Video className="w-3 h-3" />
                <span>Media Hub</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-gray-600 hover:text-primary transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Mobile Menu Button & Logo */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Mobile: Just PH */}
                <span className="text-blue-900 text-2xl font-black lg:hidden">PH</span>

                {/* Desktop: Full logo */}
                <div className="hidden lg:flex items-center gap-2">
                  <span className="text-blue-900 text-2xl font-black">PH</span>
                  <span className="font-black text-xl tracking-tight text-gray-900">
                    preparedness<span className="font-light">for</span>war
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation with Mega Menu */}
          <nav className="hidden lg:flex items-center">
            <MegaMenu>
              {/* Trigger row */}
              <div className="flex items-center gap-1">
                {mainNavItems.map((item) => (
                  <MegaMenuTrigger
                    key={item.label}
                    menuId={item.section}
                    label={item.label}
                    href={item.to}
                    className="text-gray-700 font-semibold"
                  />
                ))}
              </div>

              {/* Dropdown panels — span full header width */}
              {mainNavItems.map((item) => {
                const section = navSections.find((s) => s.slug === item.section);
                const config = section ? buildMenuConfig(section) : null;
                return config ? (
                  <MegaMenuContent
                    key={item.section}
                    menuId={item.section}
                    config={config}
                    className="border-t border-gray-200 shadow-xl"
                  />
                ) : null;
              })}
            </MegaMenu>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search */}
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-md transition-colors">
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

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
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                  <Link to="/login">
                    <User className="w-4 h-4 mr-2" />
                    <span className="hidden md:inline">Log In</span>
                    <span className="md:hidden">Login</span>
                  </Link>
                </Button>
                <Button variant="default" size="sm" asChild className="text-xs sm:text-sm">
                  <Link to="/signup">
                    <span className="hidden sm:inline">Sign Up</span>
                    <span className="sm:hidden">Join</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 py-4 max-h-[70vh] overflow-y-auto">
            {/* Quick Links */}
            <div className="mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quick Access</h3>
              <div className="space-y-1">
                <Link
                  to="/library"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Newspaper className="w-4 h-4" />
                  Library
                </Link>
                <Link
                  to="/encyclopaedia"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Newspaper className="w-4 h-4" />
                  Encyclopaedia
                </Link>
                <Link
                  to="/media"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Video className="w-4 h-4" />
                  Media Hub
                </Link>
                <Link
                  to="/countries"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Globe className="w-4 h-4" />
                  Countries
                </Link>
                <Link
                  to="/newsletter"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Mail className="w-4 h-4" />
                  Newsletter
                </Link>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Main Navigation</h3>
              <nav className="space-y-1">
                {mainNavItems.map((item) => {
                  const section = navSections.find((s) => s.slug === item.section);
                  const hasCategories = section && section.categories.length > 0;
                  const isExpanded = expandedSection === item.section;

                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between">
                        <Link
                          to={item.to}
                          className="flex-1 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 hover:text-primary rounded-md transition-colors"
                          onClick={() => !hasCategories && setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                        {hasCategories && (
                          <button
                            onClick={() => setExpandedSection(isExpanded ? null : item.section)}
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                            aria-label={isExpanded ? "Collapse" : "Expand"}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        )}
                      </div>
                      {hasCategories && isExpanded && (
                        <div className="ml-3 mt-1 space-y-1 border-l-2 border-gray-200 pl-3 animate-in slide-in-from-top-2 duration-200">
                          {section.categories.slice(0, 5).map((category) => (
                            <Link
                              key={category.slug}
                              to={`/${item.section}/${category.slug}`}
                              className="block px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 hover:text-primary rounded-md transition-colors"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {category.title}
                            </Link>
                          ))}
                          {section.categories.length > 5 && (
                            <Link
                              to={item.to}
                              className="block px-3 py-1.5 text-xs text-primary font-medium hover:bg-gray-100 rounded-md transition-colors"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              View all {section.categories.length} categories →
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Auth Links */}
            <div className="border-t border-gray-200 pt-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account</h3>
              {user ? (
                <div className="space-y-1">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary rounded-md transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block w-full px-4 py-2 text-sm font-semibold text-center text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="block w-full px-4 py-2 text-sm font-semibold text-center text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
