import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Link2, X, Loader2, Image as ImageIcon, Video } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FileUploadProps {
  type: "image" | "video";
  currentUrl?: string;
  onUrlChange: (url: string) => void;
  label?: string;
}

export function FileUpload({ type, currentUrl = "", onUrlChange, label }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(currentUrl);
  const [preview, setPreview] = useState(currentUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Sync when parent changes currentUrl (e.g. switching between edit/create)
  useEffect(() => {
    setUrlInput(currentUrl);
    setPreview(currentUrl);
  }, [currentUrl]);

  const bucket = type === "image" ? "post-images" : "post-videos";
  const accept = type === "image" 
    ? "image/jpeg,image/png,image/gif,image/webp"
    : "video/mp4,video/webm,video/ogg";
  const maxSize = type === "image" ? 5 * 1024 * 1024 : 100 * 1024 * 1024; // 5MB for images, 100MB for videos

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: `${type === "image" ? "Images" : "Videos"} must be under ${type === "image" ? "5MB" : "100MB"}`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      setUrlInput(publicUrl);
      onUrlChange(publicUrl);

      toast({
        title: "Upload Successful",
        description: `${type === "image" ? "Image" : "Video"} uploaded successfully`,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setPreview(urlInput);
    onUrlChange(urlInput);
    toast({
      title: "URL Added",
      description: `${type === "image" ? "Image" : "Video"} URL added successfully`,
    });
  };

  const handleClear = () => {
    setPreview("");
    setUrlInput("");
    onUrlChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label || `${type === "image" ? "Image" : "Video"}`}</Label>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="url">
            <Link2 className="w-4 h-4 mr-2" />
            From URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-3">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id={`file-upload-${type}`}
            />
            <label
              htmlFor={`file-upload-${type}`}
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </>
              ) : (
                <>
                  {type === "image" ? (
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <Video className="w-8 h-8 text-muted-foreground" />
                  )}
                  <p className="text-sm font-medium">
                    Click to upload {type === "image" ? "image" : "video"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {type === "image" 
                      ? "PNG, JPG, GIF, WEBP up to 5MB"
                      : "MP4, WEBM, OGG up to 100MB"}
                  </p>
                </>
              )}
            </label>
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder={`Enter ${type} URL (e.g., https://example.com/${type}.${type === "image" ? "jpg" : "mp4"})`}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
            />
            <Button type="button" onClick={handleUrlSubmit} variant="secondary">
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {type === "video" && "Supports YouTube, Vimeo, and direct video URLs"}
          </p>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      {preview && (
        <div className="relative border border-border rounded-lg overflow-hidden">
          {type === "image" ? (
            <div className="aspect-video bg-muted">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => {
                  toast({
                    title: "Invalid Image",
                    description: "Failed to load image preview",
                    variant: "destructive",
                  });
                }}
              />
            </div>
          ) : (
            <div className="aspect-video bg-muted flex items-center justify-center">
              <div className="text-center">
                <Video className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Video URL added</p>
                <p className="text-xs text-muted-foreground mt-1 px-4 truncate max-w-md">
                  {preview}
                </p>
              </div>
            </div>
          )}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleClear}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
