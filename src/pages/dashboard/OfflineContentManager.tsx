import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { OfflineService } from "@/services/OfflineService";
import { Download, Trash2, HardDrive, Video, BookOpen, Headphones, FileText, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { OfflineContent, OfflineContentStats } from "@/types/memberPortal";
import { PortalBreadcrumb } from "@/components/PortalBreadcrumb";

export default function OfflineContentManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState<OfflineContent[]>([]);
  const [stats, setStats] = useState<OfflineContentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchContent();
    }
  }, [user]);

  const fetchContent = async () => {
    if (!user) return;

    setLoading(true);
    const [contentData, statsData] = await Promise.all([
      OfflineService.getUserOfflineContent(user.id),
      OfflineService.getOfflineStats(user.id),
    ]);

    setContent(contentData);
    setStats(statsData);
    setLoading(false);
  };

  const handleRemove = async (item: OfflineContent) => {
    if (!user) return;

    setRemoving(item.id);

    const result = await OfflineService.removeContent(
      user.id,
      item.content_id,
      `/${item.content_type}/${item.content_id}` // Simplified URL
    );

    setRemoving(null);

    if (result.success) {
      toast({
        title: "Removed",
        description: `${item.content_title} removed from offline storage`,
      });
      fetchContent();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to remove content",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = async () => {
    if (!user) return;

    if (!confirm("Are you sure you want to remove all offline content? This cannot be undone.")) {
      return;
    }

    const result = await OfflineService.clearAllContent(user.id);

    if (result.success) {
      toast({
        title: "Cleared",
        description: "All offline content has been removed",
      });
      fetchContent();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to clear content",
        variant: "destructive",
      });
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'course': return <GraduationCap className="w-5 h-5 text-[#1d70b8]" />;
      case 'video': return <Video className="w-5 h-5 text-[#d4351c]" />;
      case 'podcast': return <Headphones className="w-5 h-5 text-[#1d70b8]" />;
      case 'library': return <BookOpen className="w-5 h-5 text-[#00703c]" />;
      case 'article': return <FileText className="w-5 h-5 text-[#f47738]" />;
      default: return <Download className="w-5 h-5 text-[#505a5f]" />;
    }
  };

  const storageUsedPercentage = stats ? Math.min((stats.totalSize / (5 * 1024 * 1024 * 1024)) * 100, 100) : 0;

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading offline content...</p>
      </div>
    );
  }

  return (
    <div className="container py-6 sm:py-8 px-4 sm:px-6">
      <PortalBreadcrumb items={[{ label: "Offline Content" }]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">Offline Content Manager</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage content saved for offline access
          </p>
        </div>
        <OfflineIndicator />
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Used: {OfflineService.formatBytes(stats?.totalSize || 0)}</span>
                  <span>Limit: 5 GB</span>
                </div>
                <Progress value={storageUsedPercentage} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{stats?.totalItems || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Space Used</p>
                  <p className="text-2xl font-bold">{storageUsedPercentage.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: 'course', label: 'Courses', icon: GraduationCap, color: 'text-[#1d70b8]' },
                { type: 'video', label: 'Videos', icon: Video, color: 'text-[#d4351c]' },
                { type: 'podcast', label: 'Podcasts', icon: Headphones, color: 'text-[#1d70b8]' },
                { type: 'library', label: 'Library', icon: BookOpen, color: 'text-[#00703c]' },
                { type: 'article', label: 'Articles', icon: FileText, color: 'text-[#f47738]' },
              ].map(({ type, label, icon: Icon, color }) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-sm">{label}</span>
                  </div>
                  <Badge variant="secondary">
                    {stats?.byType[type as keyof typeof stats.byType] || 0}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Offline Content ({content.length})</CardTitle>
            {content.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleClearAll}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {content.length === 0 ? (
            <div className="text-center py-12">
              <Download className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Offline Content</h3>
              <p className="text-muted-foreground mb-6">
                Download courses, videos, and other content to access them offline
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {content.map(item => (
                <div
                  key={item.id}
                  className="flex items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-[#f3f2f1] transition-colors gap-2"
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 mt-0.5 sm:mt-0">{getContentIcon(item.content_type)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate text-sm sm:text-base">{item.content_title || 'Untitled'}</h4>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-xs sm:text-sm text-muted-foreground mt-0.5">
                        <Badge variant="outline" className="text-xs">
                          {item.content_type}
                        </Badge>
                        <span>Downloaded {new Date(item.downloaded_at).toLocaleDateString()}</span>
                        {item.content_size && (
                          <span>{OfflineService.formatBytes(item.content_size)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(item)}
                    disabled={removing === item.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <div className="mt-6 p-4 bg-[#e8f0f8] border border-[#1d70b8]/30 rounded-lg">
        <h3 className="font-semibold text-[#003078] mb-2">About Offline Access</h3>
        <ul className="text-sm text-[#003078] space-y-1">
          <li>• Content is cached in your browser for offline access</li>
          <li>• Downloaded content stays in your portal, not your computer files</li>
          <li>• Storage limit is 5 GB per member</li>
          <li>• Content remains accessible even without internet connection</li>
          <li>• Clearing browser data will remove offline content</li>
        </ul>
      </div>
    </div>
  );
}
