import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { publicSupabase } from "@/integrations/supabase/publicClient";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, ThumbsUp, MapPin, Search, TrendingUp, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { MemberReport, ReportCategory } from "@/types/memberPortal";

export default function CommunityReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<MemberReport[]>([]);
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'views'>('recent');

  useEffect(() => {
    fetchData();
  }, [sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch categories
      const { data: categoriesData } = await publicSupabase
        .from("report_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      setCategories(categoriesData || []);

      // Fetch approved reports
      let query = publicSupabase
        .from("member_reports")
        .select("*")
        .eq("status", "approved");

      // Sort
      if (sortBy === 'recent') {
        query = query.order("approved_at", { ascending: false });
      } else if (sortBy === 'popular') {
        query = query.order("upvotes_count", { ascending: false });
      } else if (sortBy === 'views') {
        query = query.order("views_count", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (reportId: string) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to upvote reports",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("report_upvotes").insert({
        report_id: reportId,
        user_id: user.id,
      });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already Upvoted",
            description: "You've already upvoted this report",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Upvoted",
          description: "Thank you for your feedback",
        });
        fetchData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(search.toLowerCase()) ||
                         report.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredReports = reports.filter(r => r.is_featured).slice(0, 3);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white py-16">
        <div className="container">
          <h1 className="font-display text-5xl font-bold mb-4">Community Intelligence Reports</h1>
          <p className="text-xl text-slate-200 max-w-3xl">
            Real field reports from our community members. Share knowledge, stay informed, and contribute to collective preparedness.
          </p>
        </div>
      </div>

      <div className="container py-12">
        {/* Featured Reports */}
        {featuredReports.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="font-display text-3xl font-bold">Featured Reports</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredReports.map(report => (
                <Card key={report.id} className="border-2 border-yellow-200 bg-yellow-50/30">
                  <CardHeader>
                    <Badge className="w-fit mb-2 bg-yellow-500">Featured</Badge>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="font-medium">{report.category}</span>
                      {report.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {report.location}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {report.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {report.views_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          {report.upvotes_count}
                        </span>
                      </div>
                      <Button size="sm" variant="outline">Read More</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No reports found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map(report => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{report.title}</CardTitle>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Badge variant="secondary">{report.category}</Badge>
                    {report.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {report.location}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-4 mb-4">
                    {report.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {report.views_count}
                      </span>
                      <button
                        onClick={() => handleUpvote(report.id)}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        {report.upvotes_count}
                      </button>
                    </div>
                    <Button size="sm" variant="outline">Read More</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(report.approved_at || report.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
