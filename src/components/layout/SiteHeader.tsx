import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Search, User, Globe, Mail, X, Video, Newspaper, LogOut, ChevronDown, ChevronUp, FileText, BookOpen, GraduationCap, ShoppingBag, Info, Crown, Radio, MapPin, Users } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { navSections } from "@/data/mockData";
import { MegaMenu, MegaMenuTrigger, MegaMenuContent } from "@/components/MegaMenu";
import type { MegaMenuConfig } from "@/components/MegaMenu";
import { useFeaturedPosts } from "@/hooks/useFeaturedPosts";
import { useNavSections } from "@/hooks/useNavSections";
import { useData } from "@/contexts/DataContext";
import { SearchModal } from "@/components/SearchModal";

// Build a MegaMenuConfig from a navSection, injecting a live featured post if available
function buildMenuConfig(
  section: (typeof navSections)[number],
  featuredPost?: { id: string; title: string; image: string | null; category: string; standfirst: string | null }
): MegaMenuConfig {
  const featuredItems = featuredPost
    ? [{
        id: featuredPost.id,
        title: featuredPost.title,
        description: featuredPost.standfirst?.replace(/<[^>]*>/g, '').substring(0, 80) || "",
        imageUrl: featuredPost.image || "/placeholder.svg",
        href: `/${section.slug}/${featuredPost.category}/${featuredPost.id}`,
      }]
    : (section.featured ?? []).map((f) => ({
        id: f.slug,
        title: f.title,
        description: "",
        imageUrl: f.image ?? "/placeholder.svg",
        href: `/${section.slug}/${f.slug}`,
      }));

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
      items: featuredItems,
    },
  };
}

// "More" mega menu config
const moreMenuConfig: MegaMenuConfig = {
  menuId: "more",
  categories: {
    heading: "Community",
    items: [
      { id: "community-reports", label: "Community Reports", href: "/community-reports" },
      { id: "about", label: "About Us", href: "/about" },
    ],
  },
  programmes: {
    heading: "Learn & Shop",
    groups: [
      { id: "courses", label: "Courses", href: "/courses" },
      { id: "my-courses", label: "My Learning", href: "/my-courses" },
      { id: "shop", label: "Shop", href: "/shop" },
    ],
  },
  featured: {
    heading: "",
    items: [],
  },
};

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const featuredMap = useFeaturedPosts();
  const { sections: dbSections } = useNavSections();
  const { banner } = useData();

  // Cmd/Ctrl+K to open search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Use DB sections for nav, fall back to static navSections
  const activeSections = dbSections.length > 0 ? dbSections : navSections;

  const mainNavItems = activeSections.map(s => ({
    label: s.title,
    to: `/${s.slug}`,
    section: s.slug,
  }));

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm relative">
      {/* Scrolling news ticker banner */}
      {banner.enabled && banner.text && (
        <div className="bg-[#1e3a5f] text-white overflow-hidden">
          <div className="flex items-center h-8">
            <div className="flex-shrink-0 bg-red-600 px-3 h-full flex items-center text-xs font-bold uppercase tracking-wider">
              LIVE
            </div>
            <div className="flex-1 overflow-hidden relative">
              <div
                className="whitespace-nowrap text-sm font-medium"
                style={{
                  display: "inline-block",
                  animation: "marquee 30s linear infinite",
                  paddingLeft: "100%",
                }}
              >
                {banner.text}
              </div>
            </div>
          </div>
        </div>
      )}
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
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors group"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
                <span className="text-xs text-gray-400 group-hover:text-primary hidden xl:inline">
                  Search... <kbd className="bg-gray-100 px-1 rounded text-[10px]">⌘K</kbd>
                </span>
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
              <div className="flex items-center gap-0">
                {mainNavItems.map((item) => (
                  <MegaMenuTrigger
                    key={item.label}
                    menuId={item.section}
                    label={item.label}
                    href={item.to}
                    className="text-gray-700 font-semibold text-xs px-2"
                  />
                ))}
                {/* More — mega menu */}
                <MegaMenuTrigger
                  menuId="more"
                  label="More"
                  className="text-gray-700 font-semibold text-xs px-2"
                />
              </div>

              {/* Dropdown panels */}
              {mainNavItems.map((item) => {
                const section = activeSections.find((s) => s.slug === item.section);
                const config = section ? buildMenuConfig(section, featuredMap[item.section]) : null;
                return config ? (
                  <MegaMenuContent
                    key={item.section}
                    menuId={item.section}
                    config={config}
                    className="border-t border-gray-200 shadow-xl"
                  />
                ) : null;
              })}

              {/* More mega menu panel */}
              <MegaMenuContent
                menuId="more"
                config={moreMenuConfig}
                className="border-t border-gray-200 shadow-xl"
              />
            </MegaMenu>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-primary"
              aria-label="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            {/* Mobile: show user avatar/dashboard if logged in, else show login */}
            {user ? (
              <Button variant="ghost" size="sm" asChild className="lg:hidden">
                <Link to="/dashboard">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" asChild className="lg:hidden">
                <Link to="/login">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </Button>
            )}

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
                <Link
                  to="/community-reports"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText className="w-4 h-4" />
                  Community Reports
                </Link>
                <Link
                  to="/courses"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <GraduationCap className="w-4 h-4" />
                  Courses
                </Link>
                <Link
                  to="/shop"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Shop
                </Link>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Main Navigation</h3>
              <nav className="space-y-1">
                {mainNavItems.map((item) => {
                  const section = activeSections.find((s) => s.slug === item.section);
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
      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
