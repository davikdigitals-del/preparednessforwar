import { useState, useEffect } from "react";
import { Download, Check, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { OfflineService } from "@/services/OfflineService";
import { useAuth } from "@/contexts/AuthContext";

interface DownloadButtonProps {
  contentType: 'course' | 'video' | 'podcast' | 'library' | 'article';
  contentId: string;
  contentTitle: string;
  contentUrl: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function DownloadButton({
  contentType,
  contentId,
  contentTitle,
  contentUrl,
  variant = "outline",
  size = "sm",
  className = "",
}: DownloadButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkIfDownloaded();
  }, [contentId, user]);

  const checkIfDownloaded = async () => {
    if (!user) return;
    
    setChecking(true);
    const downloaded = await OfflineService.isContentOffline(user.id, contentId);
    setIsDownloaded(downloaded);
    setChecking(false);
  };

  const handleDownload = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to download content",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const result = await OfflineService.downloadContent(
      user.id,
      contentType,
      contentId,
      contentTitle,
      contentUrl
    );

    setIsLoading(false);

    if (result.success) {
      setIsDownloaded(true);
      toast({
        title: "Downloaded Successfully",
        description: `${contentTitle} is now available offline`,
      });
    } else {
      toast({
        title: "Download Failed",
        description: result.error || "Failed to download content",
        variant: "destructive",
      });
    }
  };

  const handleRemove = async () => {
    if (!user) return;

    setIsLoading(true);

    const result = await OfflineService.removeContent(user.id, contentId, contentUrl);

    setIsLoading(false);

    if (result.success) {
      setIsDownloaded(false);
      toast({
        title: "Removed from Offline",
        description: `${contentTitle} removed from offline storage`,
      });
    } else {
      toast({
        title: "Remove Failed",
        description: result.error || "Failed to remove content",
        variant: "destructive",
      });
    }
  };

  if (checking) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  if (isDownloaded) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleRemove}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Trash2 className="w-4 h-4 mr-2" />
        )}
        Remove Offline
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      Save Offline
    </Button>
  );
}
