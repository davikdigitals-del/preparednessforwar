import { useRef, useMemo, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Images } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  const { toast } = useToast();
  const [isUploadingCarousel, setIsUploadingCarousel] = useState(false);

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

  // Multiple images upload handler for carousel
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
      <div className="mb-2">
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
      `}</style>
    </div>
  );
}
