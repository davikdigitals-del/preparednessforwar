import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Image,
  Video,
  BookOpen,
  Library,
  Megaphone,
  Globe,
  Settings,
  CreditCard,
  Users,
  Flag,
  MessageSquare,
  BarChart3,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

export default function AdminLayout() {
  const { user, logout, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Set a maximum timeout for loading (5 seconds)
    const timeout = setTimeout(() => {
      if (isChecking) {
        console.warn("Auth check timeout - forcing check completion");
        setIsChecking(false);
        
        // If still no user after timeout, redirect to login
        if (!user) {
          navigate("/admin-login");
        } else if (!isAdmin) {
          console.warn("User not admin after timeout");
          navigate("/");
        }
      }
    }, 5000);

    // Wait for auth to finish loading
    if (authLoading) {
      return () => clearTimeout(timeout);
    }

    // If no user, redirect to login
    if (!user) {
      console.log("No user found, redirecting to login");
      navigate("/admin-login");
      setIsChecking(false);
      clearTimeout(timeout);
      return;
    }
    
    // Check if user is actually an admin
    if (!isAdmin) {
      console.warn("Non-admin user attempted to access admin panel");
      navigate("/");
      setIsChecking(false);
      clearTimeout(timeout);
      return;
    }

    // User is authenticated and is admin
    console.log("✅ Admin access granted");
    setIsChecking(false);
    clearTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [user, isAdmin, authLoading, navigate, isChecking]);

  const handleSignOut = async () => {
    try {
      await logout();
      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate("/admin-login");
    } catch (error) {
      console.error("Logout error:", error);
      // Navigate anyway
      navigate("/admin-login");
    }
  };

  // Show loading state while checking authentication
  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  const menuSections = [
    {
      title: "OVERVIEW",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
        { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
      ],
    },
    {
      title: "CONTENT",
      items: [
        { icon: FileText, label: "Posts", path: "/admin/posts" },
        { icon: FolderOpen, label: "Categories", path: "/admin/categories" },
        { icon: BookOpen, label: "Sections", path: "/admin/sections" },
        { icon: FileText, label: "Pages", path: "/admin/pages" },
        { icon: BookOpen, label: "Encyclopaedia", path: "/admin/encyclopaedia" },
        { icon: BookOpen, label: "Preparedness Templates", path: "/admin/preparedness-templates" },
      ],
    },
    {
      title: "MEDIA",
      items: [
        { icon: Image, label: "File Manager", path: "/admin/media" },
        { icon: Video, label: "Videos & Podcasts", path: "/admin/podcast-videos" },
        { icon: Library, label: "Library", path: "/admin/library" },
      ],
    },
    {
      title: "MONETISATION",
      items: [
        { icon: CreditCard, label: "Subscriptions", path: "/admin/subscriptions" },
        { icon: Users, label: "Members", path: "/admin/members" },
        { icon: BookOpen, label: "Courses", path: "/admin/courses" },
        { icon: Users, label: "Enrollments", path: "/admin/enrollments" },
        { icon: Globe, label: "Affiliate Products", path: "/admin/affiliate-products" },
        { icon: Image, label: "Ads", path: "/admin/ads" },
        { icon: Megaphone, label: "Sponsorships", path: "/admin/sponsorships" },
        { icon: BarChart3, label: "Revenue", path: "/admin/revenue" },
      ],
    },
    {
      title: "MODERATION",
      items: [
        { icon: Flag, label: "Reports", path: "/admin/reports" },
        { icon: MessageSquare, label: "Comments", path: "/admin/comments" },
        { icon: FileText, label: "Member Reports", path: "/admin/member-reports" },
      ],
    },
    {
      title: "SITE",
      items: [
        { icon: Megaphone, label: "Banner", path: "/admin/banner" },
        { icon: Globe, label: "Countries", path: "/admin/countries" },
        { icon: Settings, label: "Site Settings", path: "/admin/settings" },
      ],
    },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-3 sm:px-4 h-14 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="font-display font-black text-base sm:text-xl">Admin Portal</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-4">
            <Link
              to="/"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 rounded"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">View Site</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 rounded"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-14 sm:top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto transition-transform lg:translate-x-0 z-20 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-4 space-y-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                        active
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-14 sm:pt-16">
        <div className="p-3 sm:p-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
