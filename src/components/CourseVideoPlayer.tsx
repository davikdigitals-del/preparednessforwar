import { useState, useRef, useEffect } from "react";
import { MediaPlayer } from "./MediaPlayer";

interface CourseVideoPlayerProps {
  url: string;
  title: string;
  thumbnail?: string;
  courseId?: string;
}

export function CourseVideoPlayer({ url, title, thumbnail, courseId }: CourseVideoPlayerProps) {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [pipSupported, setPipSupported] = useState(false);

  // Check if PiP is supported
  useEffect(() => {
    setPipSupported(document.pictureInPictureEnabled || false);
  }, []);

  useEffect(() => {
    // Setup Intersection Observer to detect when video scrolls out of view
    if (!videoContainerRef.current || !pipSupported) return;

    observerRef.current = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        
        // Find the video element (could be in iframe or native video tag)
        const videoEl = videoContainerRef.current?.querySelector('video');
        if (!videoEl) return;
        
        videoElementRef.current = videoEl as HTMLVideoElement;

        // If video is less than 30% visible, enable native PiP
        if (entry.intersectionRatio < 0.3 && !document.pictureInPictureElement) {
          try {
            await videoEl.requestPictureInPicture();
          } catch (error) {
            console.log('PiP not available:', error);
          }
        }
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        rootMargin: "-50px 0px -50px 0px",
      }
    );

    observerRef.current.observe(videoContainerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [pipSupported]);

  return (
    <div
      ref={videoContainerRef}
      className="relative bg-black rounded-lg overflow-hidden w-full"
    >
      <MediaPlayer
        url={url}
        title={title}
        isPremium={true}
        type="video"
        thumbnail={thumbnail}
        mediaId={courseId}
      />
    </div>
  );
}
