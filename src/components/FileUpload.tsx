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
  uploadId?: string;
}

export function FileUpload({ type, currentUrl = "", onUrlChange, label, uploadId }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(currentUrl);
  const [preview, setPreview] = useState(currentUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Unique ID so multiple FileUploads on the same page don't share the same input
  const uniqueId = useRef(`fu-${uploadId || type}-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    setUrlInput(currentUrl);
    setPreview(currentUrl);
  }, [currentUrl]);

  const bucket = type === "image" ? "post-images" : "post-videos";
  const accept = type === "image"
    ? "image/jpeg,image/png,image/gif,image/webp"
    : "video/mp4,video/webm,video/ogg";
  const maxSize = type === "image" ? 5 * 1024 * 1024 : 100 * 1024 * 1024;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);

      setPreview(publicUrl);
      setUrlInput(publicUrl);
      onUrlChange(publicUrl);
      toast({ title: "Upload Successful" });
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    setPreview(urlInput);
    onUrlChange(urlInput);
    toast({ title: "URL Added" });
  };

  const handleClear = () => {
    setPreview("");
    setUrlInput("");
    onUrlChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <Label>{label || (type === "image" ? "Image" : "Video")}</Label>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">
            <Upload className="w-4 h-4 mr-2" /> Upload File
          </TabsTrigger>
          <TabsTrigger value="url">
            <Link2 className="w-4 h-4 mr-2" /> From URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-3">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
            <input
              ref={fileInputRef}
              id={uniqueId.current}
              type="file"
              accept={accept}
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
            <label htmlFor={uniqueId.current} className="cursor-pointer flex flex-col items-center gap-2">
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </>
              ) : (
                <>
                  {type === "image"
                    ? <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    : <Video className="w-8 h-8 text-muted-foreground" />}
                  <p className="text-sm font-medium">Click to upload {type === "image" ? "image" : "video"}</p>
                  <p className="text-xs text-muted-foreground">
                    {type === "image" ? "PNG, JPG, GIF, WEBP up to 5MB" : "MP4, WEBM, OGG up to 100MB"}
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
              placeholder={`Paste ${type === 'video' ? 'YouTube, Vimeo or direct video' : 'image'} URL`}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
              onBlur={() => urlInput.trim() && handleUrlSubmit()}
            />
            <Button type="button" onClick={handleUrlSubmit} variant="secondary">Use</Button>
          </div>
          {type === "video" && (
            <p className="text-xs text-muted-foreground">Supports YouTube, Vimeo, and direct video URLs. Paste URL — it saves automatically.</p>
          )}
        </TabsContent>
      </Tabs>

      {preview && (
        <div className="relative border border-border rounded-lg overflow-hidden">
          {type === "image" ? (
            <div className="aspect-video bg-muted">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-video bg-black flex items-center justify-center">
              {/youtube|youtu\.be|vimeo|dailymotion|twitch|spotify/i.test(preview) ? (
                <div className="text-center text-white">
                  <Video className="w-10 h-10 mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-medium">Embedded video URL saved</p>
                  <p className="text-xs text-gray-400 mt-1 px-4 break-all">{preview}</p>
                </div>
              ) : (
                <video
                  src={preview}
                  controls
                  className="w-full h-full"
                  preload="metadata"
                >
                  <p className="text-white text-sm p-4">
                    URL saved: {preview}
                  </p>
                </video>
              )}
            </div>
          )}
          <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={handleClear}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
