import { useRef, useMemo, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Images, Video, Headphones, Link2 } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  const { toast } = useToast();
  const [isUploadingCarousel, setIsUploadingCarousel] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);

  // Single image upload handler with caption support
  const imageHandler = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }

      try {
        // Show loading toast
        toast({
          title: 'Uploading image...',
          description: 'Please wait',
        });

        // Upload to Supabase storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`; // Just filename, bucket handles the rest

        const { data, error } = await supabase.storage
          .from('post-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);

        const imageUrl = urlData.publicUrl;

        // Prompt for caption
        const caption = prompt('Add image caption (optional):');

        // Insert image with caption as a figure element
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);

          // Create HTML structure for image with caption
          const figureHTML = caption
            ? `<figure class="image-with-caption">
                 <img src="${imageUrl}" alt="${caption}" />
                 <figcaption>${caption}</figcaption>
               </figure>`
            : `<img src="${imageUrl}" alt="Article image" />`;

          // Insert the HTML
          quill.clipboard.dangerouslyPasteHTML(range.index, figureHTML);

          // Move cursor after the inserted content
          quill.setSelection(range.index + 1, 0);
        }

        toast({
          title: 'Image uploaded',
          description: caption ? 'Image with caption added' : 'Image added',
        });
      } catch (error: any) {
        console.error('Error uploading image:', error);
        console.error('Error details:', {
          message: error.message,
          statusCode: error.statusCode,
          error: error.error,
          full: error
        });
        toast({
          title: 'Upload failed',
          description: error.message || error.error || 'Failed to upload image',
          variant: 'destructive',
        });
      }
    };
  };

  // Single image upload handler with caption support

  // Video handler - opens dialog with upload and link options
  const videoHandler = () => {
    setVideoDialogOpen(true);
  };

  // Video upload handler (for dialog tab)
  const handleVideoUpload = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'video/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a video smaller than 100MB',
          variant: 'destructive',
        });
        return;
      }

      try {
        setIsUploadingVideo(true);
        toast({
          title: 'Uploading video...',
          description: 'Please wait',
        });

        // Upload to Supabase storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
          .from('post-videos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('post-videos')
          .getPublicUrl(filePath);

        const videoUrl = urlData.publicUrl;

        // Insert video into editor
        insertVideoIntoEditor(videoUrl, 'direct', file.name);

        toast({
          title: 'Video uploaded',
          description: 'Video has been added to your content',
        });

        // Close dialog
        setVideoDialogOpen(false);
      } catch (error: any) {
        console.error('Error uploading video:', error);
        toast({
          title: 'Upload failed',
          description: error.message || 'Failed to upload video',
          variant: 'destructive',
        });
      } finally {
        setIsUploadingVideo(false);
      }
    };
  };

  // Process video URL and determine type
  const processVideoURL = (url: string) => {
    const trimmedUrl = url.trim();

    // Direct video files
    if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(trimmedUrl)) {
      return { type: 'direct', url: trimmedUrl };
    }

    // YouTube
    if (trimmedUrl.includes('youtube.com') || trimmedUrl.includes('youtu.be')) {
      return { type: 'youtube', url: trimmedUrl };
    }

    // Vimeo
    if (trimmedUrl.includes('vimeo.com')) {
      return { type: 'vimeo', url: trimmedUrl };
    }

    // External videos (Sky News, BBC, etc.)
    if (trimmedUrl.includes('sky') || trimmedUrl.includes('bbc') ||
      trimmedUrl.includes('cnn') || trimmedUrl.includes('news')) {
      return { type: 'external', url: trimmedUrl };
    }

    // Default to external for unknown URLs
    return { type: 'external', url: trimmedUrl };
  };

  // Insert video HTML into editor
  const insertVideoIntoEditor = (url: string, type: string, title?: string) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const range = quill.getSelection(true);
    let videoHTML = '';

    switch (type) {
      case 'direct':
        videoHTML = `
          <video controls style="width: 100%; max-width: 600px; height: auto; margin: 16px 0; border-radius: 8px;">
            <source src="${url}" type="video/${url.split('.').pop()?.split('?')[0]}">
            Your browser does not support the video tag.
          </video>
        `;
        break;

      case 'youtube':
      case 'vimeo':
        videoHTML = `
          <div class="video-embed" data-video-url="${url}" style="
            border: 2px dashed #cbd5e0;
            border-radius: 8px;
            padding: 24px;
            margin: 16px 0;
            text-align: center;
            background: #f7fafc;
          ">
            <div style="
              width: 48px;
              height: 48px;
              margin: 0 auto 12px;
              background: #4299e1;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 20px;
            ">▶</div>
            <p style="margin: 0 0 8px 0; font-weight: bold; color: #2d3748; font-size: 14px;">
              ${type === 'youtube' ? 'YouTube' : 'Vimeo'} Video
            </p>
            <p style="margin: 0; font-size: 12px; color: #718096; word-break: break-all;">${url}</p>
            <p style="margin: 8px 0 0 0; font-size: 10px; color: #a0aec0; text-transform: uppercase;">
              Video will display as player on frontend
            </p>
          </div>
        `;
        break;

      default: // external
        videoHTML = `
          <div class="external-video" data-video-url="${url}" style="
            border: 2px dashed #f56565;
            border-radius: 8px;
            padding: 24px;
            margin: 16px 0;
            text-align: center;
            background: #fed7d7;
          ">
            <div style="
              width: 48px;
              height: 48px;
              margin: 0 auto 12px;
              background: #e53e3e;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 20px;
            ">▶</div>
            <p style="margin: 0 0 8px 0; font-weight: bold; color: #2d3748; font-size: 14px;">
              External Video Link
            </p>
            <p style="margin: 0; font-size: 12px; color: #718096; word-break: break-all;">${url}</p>
            <p style="margin: 8px 0 0 0; font-size: 10px; color: #a0aec0; text-transform: uppercase;">
              Will open as external link on frontend
            </p>
          </div>
        `;
    }

    // Insert the video HTML
    quill.clipboard.dangerouslyPasteHTML(range.index, videoHTML);
    quill.setSelection(range.index + 1, 0);
  };

  // Handle video URL insertion
  const handleVideoUrlInsert = () => {
    if (!videoUrl.trim()) {
      toast({
        title: 'URL Required',
        description: 'Please enter a valid video URL',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessingUrl(true);

    try {
      const { type, url } = processVideoURL(videoUrl);
      insertVideoIntoEditor(url, type);

      toast({
        title: 'Video added',
        description: 'Video link has been embedded in the content',
      });

      // Reset and close dialog
      setVideoUrl('');
      setVideoDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process video URL',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingUrl(false);
    }
  };

  // Audio upload handler
  const audioHandler = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'audio/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      // Check file size (max 50MB for audio)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an audio file smaller than 50MB',
          variant: 'destructive',
        });
        return;
      }

      try {
        setIsUploadingAudio(true);

        // Show uploading toast
        toast({
          title: 'Uploading audio...',
          description: 'Please wait while your audio is being uploaded',
        });

        // Upload to Supabase storage
        const fileExt = file.name.split('.').pop();
        const fileName = `audio_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `rich-text-audios/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        const audioUrl = urlData.publicUrl;

        // Insert audio HTML into editor
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);

          const audioHTML = `
            <div class="audio-player-container" style="margin: 16px 0; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc;">
              <audio controls style="width: 100%;" preload="metadata">
                <source src="${audioUrl}" type="${file.type}">
                Your browser does not support the audio element.
              </audio>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b; text-align: center;">${file.name}</p>
            </div>
          `;

          quill.clipboard.dangerouslyPasteHTML(range.index, audioHTML);
          quill.setSelection(range.index + 1, 0);
        }

        toast({
          title: 'Audio uploaded',
          description: 'Audio has been added to your content',
        });
      } catch (error: any) {
        console.error('Audio upload error:', error);
        toast({
          title: 'Upload failed',
          description: error.message || 'Failed to upload audio',
          variant: 'destructive',
        });
      } finally {
        setIsUploadingAudio(false);
      }
    };
  };

  const carouselHandler = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.setAttribute('multiple', 'true');
    input.click();

    input.onchange = async () => {
      const files = Array.from(input.files || []);
      if (files.length === 0) return;

      // Check if any file is too large
      const oversizedFiles = files.filter(f => f.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast({
          title: 'Some files too large',
          description: 'Please select images smaller than 5MB each',
          variant: 'destructive',
        });
        return;
      }

      try {
        setIsUploadingCarousel(true);
        toast({
          title: `Uploading ${files.length} images...`,
          description: 'Please wait',
        });

        // Upload all images
        const uploadPromises = files.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
          const filePath = `${fileName}`; // Just filename, bucket handles the rest

          const { error } = await supabase.storage
            .from('post-images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (error) throw error;

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('post-images')
            .getPublicUrl(filePath);

          return urlData.publicUrl;
        });

        const imageUrls = await Promise.all(uploadPromises);

        // Create carousel HTML with data attribute
        const carouselId = `carousel-${Date.now()}`;
        const carouselHTML = `
          <div class="image-carousel" data-carousel-id="${carouselId}" data-images='${JSON.stringify(imageUrls)}'>
            <div class="carousel-container">
              <img src="${imageUrls[0]}" alt="Slide 1" class="carousel-image active" />
              ${imageUrls.slice(1).map((url, index) =>
          `<img src="${url}" alt="Slide ${index + 2}" class="carousel-image" />`
        ).join('')}
            </div>
            <div class="carousel-controls">
              <button class="carousel-btn prev">❮</button>
              <div class="carousel-dots">
                ${imageUrls.map((_, index) =>
          `<span class="carousel-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`
        ).join('')}
              </div>
              <button class="carousel-btn next">❯</button>
            </div>
          </div>
        `;

        // Insert carousel into editor
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);
          const currentContents = quill.getContents();
          quill.clipboard.dangerouslyPasteHTML(range.index, carouselHTML);
        }

        toast({
          title: 'Carousel created',
          description: `${imageUrls.length} images uploaded successfully`,
        });
      } catch (error: any) {
        console.error('Error uploading carousel images:', error);
        toast({
          title: 'Upload failed',
          description: error.message || 'Failed to upload images',
          variant: 'destructive',
        });
      } finally {
        setIsUploadingCarousel(false);
      }
    };
  };

  // Quill modules configuration
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ align: [] }],
          ['link', 'image', 'video'],
          [{ color: [] }, { background: [] }],
          ['blockquote', 'code-block'],
          ['clean'],
        ],
        handlers: {
          image: imageHandler,
          video: videoHandler,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'indent',
    'align',
    'link',
    'image',
    'video',
    'color',
    'background',
    'blockquote',
    'code-block',
  ];

  return (
    <div className="rich-text-editor">
      <div className="mb-2 flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={carouselHandler}
          disabled={isUploadingCarousel}
          className="gap-2"
        >
          <Images className="h-4 w-4" />
          {isUploadingCarousel ? 'Uploading...' : 'Add Image Carousel'}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={videoHandler}
          disabled={isUploadingVideo}
          className="gap-2"
        >
          <Video className="h-4 w-4" />
          {isUploadingVideo ? 'Uploading...' : 'Upload Video'}
        </Button>
      </div>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Write your content here...'}
        className="bg-white"
      />
      <style>{`
        .rich-text-editor .ql-container {
          min-height: 300px;
          font-size: 16px;
          font-family: inherit;
        }
        .rich-text-editor .ql-editor {
          min-height: 300px;
        }
        .rich-text-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
        }
        
        /* Image with caption styling */
        .ql-editor .image-with-caption {
          margin: 24px auto;
          max-width: 100%;
        }
        .ql-editor .image-with-caption img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 0;
          display: block;
        }
        .ql-editor .image-with-caption figcaption {
          margin-top: 12px;
          font-size: 15px;
          color: #8B1538;
          line-height: 1.6;
          text-align: left;
        }
        
        .rich-text-editor .ql-toolbar {
          background: #f8f9fa;
          border: 1px solid #e2e8f0;
          border-radius: 8px 8px 0 0;
        }
        .rich-text-editor .ql-container {
          border: 1px solid #e2e8f0;
          border-radius: 0 0 8px 8px;
        }

        /* Carousel Styles in Editor */
        .ql-editor .image-carousel {
          margin: 24px 0;
          border-radius: 12px;
          overflow: hidden;
          background: #f8f9fa;
          padding: 16px;
          border: 2px dashed #cbd5e0;
          position: relative;
        }
        .ql-editor .image-carousel::before {
          content: '📷 Image Carousel';
          display: block;
          text-align: center;
          font-size: 12px;
          font-weight: bold;
          color: #718096;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .ql-editor .carousel-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
        }
        .ql-editor .carousel-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .ql-editor .carousel-image.active {
          opacity: 1;
        }
        .ql-editor .carousel-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 12px;
        }
        .ql-editor .carousel-btn {
          background: #fff;
          border: 1px solid #cbd5e0;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          color: #4a5568;
          transition: all 0.2s;
        }
        .ql-editor .carousel-btn:hover {
          background: #f7fafc;
          border-color: #a0aec0;
        }
        .ql-editor .carousel-dots {
          display: flex;
          gap: 8px;
        }
        .ql-editor .carousel-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #cbd5e0;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ql-editor .carousel-dot.active {
          background: #4299e1;
          width: 12px;
          height: 12px;
        }

        /* Video placeholder styling */
        .ql-editor .video-placeholder {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .ql-editor .video-placeholder:hover {
          border-color: #4299e1 !important;
          background: #ebf8ff !important;
        }
      `}</style>

      {/* Video Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Video</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Video</TabsTrigger>
              <TabsTrigger value="link">Video Link</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div>
                <Label>Upload Video File</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleVideoUpload}
                  disabled={isUploadingVideo}
                  className="w-full mt-2"
                >
                  {isUploadingVideo ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4 mr-2" />
                      Choose Video File
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Supports MP4, WebM, OGG up to 100MB
                </p>
              </div>
            </TabsContent>

            <TabsContent value="link" className="space-y-4">
              <div>
                <Label htmlFor="video-url">Video URL</Label>
                <Input
                  id="video-url"
                  type="url"
                  placeholder="https://youtube.com/watch?v=... or https://news.sky.com/story/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVideoUrlInsert()}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Supports YouTube, Vimeo, Sky News, BBC, direct video files (.mp4, .webm, etc.)
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setVideoDialogOpen(false);
                    setVideoUrl('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleVideoUrlInsert}
                  disabled={isProcessingUrl || !videoUrl.trim()}
                >
                  {isProcessingUrl ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-2" />
                      Insert Video
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

    </div>
  );
}
