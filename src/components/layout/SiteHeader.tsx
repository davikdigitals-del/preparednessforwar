import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Search, User, Globe, Mail, X, Video, Newspaper, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { navSections } from "@/data/mockData";

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

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
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
                <span className="text-blue-900 text-xl sm:text-2xl font-black">
                  PH
                </span>
                <span className="font-black text-sm sm:text-xl tracking-tight text-gray-900">
                  <span className="hidden sm:inline">preparedness</span>
                  <span className="sm:hidden">prep</span>
                  <span className="font-light">4</span>
                  <span className="hidden sm:inline">war</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="px-3 xl:px-4 py-2 text-sm font-semibold text-gray-700 hover:text-primary hover:bg-gray-100 rounded transition-colors"
              >
                {item.label}
              </Link>
            ))}
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 lg:hidden z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white lg:hidden z-50 overflow-y-auto shadow-xl">
            <div className="p-4">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <span className="font-black text-lg text-gray-900">Menu</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Links */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Access</h3>
                <div className="space-y-1">
                  <Link
                    to="/library"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Newspaper className="w-4 h-4" />
                    Library
                  </Link>
                  <Link
                    to="/encyclopaedia"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Newspaper className="w-4 h-4" />
                    Encyclopaedia
                  </Link>
                  <Link
                    to="/media"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Video className="w-4 h-4" />
                    Media Hub
                  </Link>
                  <Link
                    to="/countries"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Globe className="w-4 h-4" />
                    Countries
                  </Link>
                  <Link
                    to="/newsletter"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Mail className="w-4 h-4" />
                    Newsletter
                  </Link>
                </div>
              </div>

              {/* Main Sections */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Sections</h3>
                <nav className="space-y-1">
                  {mainNavItems.map((item) => {
                    const section = navSections.find(s => s.slug === item.section);
                    const hasCategories = section && section.categories.length > 0;

                    return (
                      <div key={item.label}>
                        <Link
                          to={item.to}
                          className="block px-3 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100 hover:text-primary rounded-md transition-colors"
                          onClick={() => !hasCategories && setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                        {hasCategories && (
                          <div className="ml-3 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
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
                                View all →
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
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Account</h3>
                {user ? (
                  <div className="space-y-1">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary rounded-md transition-colors"
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
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary rounded-md transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block w-full px-4 py-2.5 text-sm font-semibold text-center text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link
                      to="/signup"
                      className="block w-full px-4 py-2.5 text-sm font-semibold text-center text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
