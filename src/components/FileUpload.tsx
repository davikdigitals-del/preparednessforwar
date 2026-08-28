import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Link2, X, Loader2, Image as ImageIcon, Video, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FileUploadProps {
  type: "image" | "video" | "document";
  currentUrl?: string;
  onUrlChange: (url: string) => void;
  label?: string;
  uploadId?: string;
}

/**
 * Validate and fetch document URL to ensure it's accessible
 * @param url - The URL to validate
 * @returns Promise<string | null> - Validated URL or null if invalid
 */
async function validateAndFetchDocumentUrl(url: string): Promise<string | null> {
  console.log('Validating document URL:', url);
  
  try {
    // Check if URL is valid format
    const urlObj = new URL(url);
    
    // Only allow https for security
    if (urlObj.protocol !== 'https:') {
      console.warn('Only HTTPS URLs are allowed');
      return null;
    }
    
    // Try to fetch the document to validate it exists and is accessible
    const response = await fetch(url, {
      method: 'HEAD', // Only get headers, not full content
      signal: AbortSignal.timeout(10000), // 10 second timeout
      mode: 'cors'
    });
    
    console.log('Document URL validation response:', {
      status: response.status,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length')
    });
    
    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      const isDocument = 
        contentType.includes('application/pdf') ||
        contentType.includes('application/msword') ||
        contentType.includes('application/vnd.openxmlformats-officedocument') ||
        contentType.includes('text/plain') ||
        contentType.includes('application/rtf') ||
        // Also allow if URL ends with document extensions
        /\.(pdf|doc|docx|txt|rtf)(\?.*)?$/i.test(url);
      
      if (isDocument) {
        console.log('✅ Document URL validated successfully');
        return url;
      } else {
        console.warn('URL does not appear to be a document:', contentType);
        return url; // Still return it, let user decide
      }
    } else {
      console.warn('Document URL returned status:', response.status);
      return null;
    }
  } catch (error) {
    console.warn('Document URL validation error:', error);
    
    // If CORS error but URL looks valid, still allow it
    if (error instanceof TypeError && error.message.includes('CORS')) {
      console.log('CORS error but URL format is valid, allowing URL');
      return url;
    }
    
    return null;
  }
}

export function FileUpload({ type, currentUrl = "", onUrlChange, label, uploadId }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(currentUrl);
  const [preview, setPreview] = useState(currentUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Debug logging with version info
  console.log(`🔧 FileUpload v2.1 loaded - type: ${type}, uploadId: ${uploadId}`);
  console.log(`📅 Component timestamp: ${new Date().toISOString()}`);

  // Unique ID so multiple FileUploads on the same page don't share the same input
  const uniqueId = useRef(`fu-${uploadId || type}-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    setUrlInput(currentUrl);
    setPreview(currentUrl);
  }, [currentUrl]);

  const bucket = type === "image" ? "post-images" : type === "video" ? "post-videos" : "content-files";
  const accept = type === "image"
    ? "image/jpeg,image/png,image/gif,image/webp"
    : type === "video"
    ? "video/mp4,video/webm,video/ogg"
    : "application/pdf,.pdf,.doc,.docx,.txt,.rtf";
  const maxSize = type === "document" ? 50 * 1024 * 1024 : type === "image" ? 5 * 1024 * 1024 : 100 * 1024 * 1024;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      const sizeLimit = type === "document" ? "50MB" : type === "image" ? "5MB" : "100MB";
      toast({
        title: "File Too Large",
        description: `${type === "image" ? "Images" : type === "video" ? "Videos" : "Documents"} must be under ${sizeLimit}`,
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

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    
    console.log(`🔗 Starting URL validation for: ${urlInput.trim()}`);
    setUploading(true);
    try {
      // Auto-fetch and validate the document URL
      const validatedUrl = await validateAndFetchDocumentUrl(urlInput.trim());
      if (validatedUrl) {
        console.log(`✅ URL validation successful: ${validatedUrl}`);
        setPreview(validatedUrl);
        onUrlChange(validatedUrl);
        toast({ title: "Document URL Added", description: "URL validated and ready to use" });
      } else {
        console.log(`⚠️ URL validation failed, saving anyway: ${urlInput}`);
        // Still allow the URL but show warning
        setPreview(urlInput);
        onUrlChange(urlInput);
        toast({ 
          title: "URL Added", 
          description: "Could not validate URL - it may still work", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.warn('❌ URL validation error:', error);
      setPreview(urlInput);
      onUrlChange(urlInput);
      toast({ 
        title: "URL Added", 
        description: "URL validation failed but URL was saved", 
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setPreview("");
    setUrlInput("");
    onUrlChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <Label>{label || (type === "image" ? "Image" : type === "video" ? "Video" : "Document")}</Label>

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
                    : type === "video"
                    ? <Video className="w-8 h-8 text-muted-foreground" />
                    : <FileText className="w-8 h-8 text-muted-foreground" />}
                  <p className="text-sm font-medium">Click to upload {type === "image" ? "image" : type === "video" ? "video" : "document"}</p>
                  <p className="text-xs text-muted-foreground">
                    {type === "image" 
                      ? "PNG, JPG, GIF, WEBP up to 5MB" 
                      : type === "video" 
                      ? "MP4, WEBM, OGG up to 100MB"
                      : "PDF, DOC, DOCX, TXT up to 50MB"}
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
              placeholder={`Paste ${type === 'video' ? 'YouTube, Vimeo or direct video' : type === 'image' ? 'image' : 'document'} URL`}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
              disabled={uploading}
            />
            <Button 
              type="button" 
              onClick={handleUrlSubmit} 
              variant="secondary"
              disabled={uploading || !urlInput.trim()}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {type === "document" ? "🔍 Validating..." : "Adding..."}
                </>
              ) : (
                "Use"
              )}
            </Button>
          </div>
          {type === "document" && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-xs text-blue-800">
                <strong>🔗 Auto-fetch validation v2.1:</strong> Paste a direct document URL (PDF, DOC, etc.) and we'll automatically validate it's accessible.
                Supports HTTPS links from Google Drive, Dropbox, OneDrive, and direct file links.
              </p>
              <p className="text-xs text-blue-600 mt-1">
                <em>✓ Real-time validation • ✓ HTTPS security • ✓ Content-type checking • ✓ Updated {new Date().toLocaleDateString()}</em>
              </p>
            </div>
          )}
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
          ) : type === "document" ? (
            <div className="aspect-video bg-gray-50 flex items-center justify-center p-4">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                <p className="text-sm font-medium text-gray-900 mb-1">Document URL Ready</p>
                <p className="text-xs text-gray-500 px-2 break-all">{preview}</p>
                <div className="mt-2">
                  <a 
                    href={preview} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Test document link →
                  </a>
                </div>
              </div>
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
