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
  AlertTriangle,
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/admin-login");
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    await logout();
    navigate("/admin-login");
  };

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
        { icon: FileText, label: "Pages", path: "/admin/pages" },
        { icon: BookOpen, label: "Encyclopaedia", path: "/admin/encyclopaedia" },
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
      ],
    },
    {
      title: "MODERATION",
      items: [
        { icon: Flag, label: "Reports", path: "/admin/reports" },
        { icon: MessageSquare, label: "Comments", path: "/admin/comments" },
      ],
    },
    {
      title: "SITE",
      items: [
        { icon: AlertTriangle, label: "Emergency Alerts", path: "/admin/alerts" },
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="font-display font-black text-xl">Admin Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded"
            >
              <ExternalLink className="w-4 h-4" />
              View Site
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto transition-transform lg:translate-x-0 z-20 ${
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
      <main className="lg:ml-64 pt-16">
        <div className="p-6">
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
