import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { natoCountries, navSections } from "@/data/mockData";
import { PostCard } from "@/components/PostCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User, Globe, BookOpen, Bell, Search, FileText, Shield, LogOut, Crown } from "lucide-react";
import { useState, useEffect } from "react";

export default function MemberDashboard() {
  const { user, logout, notifications, markAllNotificationsRead, loading, isAdmin } = useAuth();
  const { publishedPosts } = useData();
  const { isPremium, plan: currentPlan } = usePremiumStatus();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  if (loading) return <div className="container py-16 text-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/login" replace />;

  const userCountry = natoCountries.find(c => c.code === user.country);
  const isNato = !!userCountry;

  const countryPosts = publishedPosts.filter(p => {
    if (p.category === "nato-updates") return isNato;
    return true;
  });

  const filteredPosts = search
    ? countryPosts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    : countryPosts;

  const recentNotifications = notifications.filter(n => !n.read).slice(0, 5);

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <User className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl">Welcome, {user.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {userCountry && (
                <Link to="/countries" className="hover:text-primary transition-colors">
                  {userCountry.flag} {userCountry.name}
                </Link>
              )}
              <Badge variant="secondary" className="text-xs">{user.role}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button variant="outline" asChild>
              <Link to="/admin"><Shield className="w-4 h-4 mr-1" /> Admin Panel</Link>
            </Button>
          )}
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-1" /> Sign Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">
          {/* Current Subscription Status */}
          {isPremium && currentPlan && (
            <Card className="border-2 border-primary">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Crown className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Premium Member</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentPlan.name} - Active
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline">
                    <Link to="/my-subscription">Manage Subscription</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upgrade CTA for Free Users */}
          {!isPremium && (
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Crown className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Upgrade to Premium</h3>
                      <p className="text-sm text-muted-foreground">
                        Unlock exclusive content, videos, and resources
                      </p>
                    </div>
                  </div>
                  <Button asChild>
                    <Link to="/my-subscription">
                      <Crown className="w-4 h-4 mr-2" />
                      View Plans
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search all posts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: FileText, label: "Available Posts", value: countryPosts.length },
              { icon: Bell, label: "Notifications", value: recentNotifications.length },
              { icon: Globe, label: "Country", value: userCountry?.name || "Other" },
              { icon: BookOpen, label: "Sections", value: navSections.length },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-3 flex items-center gap-3">
                  <s.icon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {isNato && (
            <div>
              <h2 className="font-display font-bold text-xl mb-4">Posts for {userCountry?.name} {userCountry?.flag}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {publishedPosts.filter(p => p.category === "nato-updates" || p.tags.some(t => t.toLowerCase() === userCountry?.name.toLowerCase())).slice(0, 4).map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="font-display font-bold text-xl mb-4">Latest Posts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPosts.slice(0, 8).map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            {filteredPosts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No posts found.</p>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</CardTitle>
                {recentNotifications.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={markAllNotificationsRead}>
                    Mark all read
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentNotifications.length === 0 && <p className="text-sm text-muted-foreground">All caught up!</p>}
              {recentNotifications.map(n => (
                <div key={n.id} className="border-b border-border pb-2 last:border-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Browse Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {navSections.map(s => (
                <Link key={s.slug} to={`/${s.slug}`} className="block text-sm py-1.5 hover:text-primary transition-colors font-medium">
                  {s.title}
                </Link>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
