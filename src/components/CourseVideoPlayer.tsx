import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { MediaPlayer } from "./MediaPlayer";

interface CourseVideoPlayerProps {
  url: string;
  title: string;
  thumbnail?: string;
  courseId?: string;
}

export function CourseVideoPlayer({ url, title, thumbnail, courseId }: CourseVideoPlayerProps) {
  const [isPiP, setIsPiP] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Setup Intersection Observer to detect when video scrolls out of view
    if (!videoContainerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // If video is less than 30% visible and user has scrolled down, enable PiP
        if (entry.intersectionRatio < 0.3) {
          setIsPiP(true);
        }
        // If video is more than 60% visible, disable PiP
        else if (entry.intersectionRatio > 0.6) {
          setIsPiP(false);
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
  }, []);

  const closePiP = () => {
    setIsPiP(false);
    // Scroll back to video smoothly
    videoContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <>
      {/* Main Video Container */}
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

      {/* Picture-in-Picture Floating Video - Only for course videos */}
      {isPiP && (
        <>
          {/* Backdrop overlay for mobile */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={closePiP}
          />
          
          {/* Floating PiP Container */}
          <div 
            className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm sm:max-w-md lg:max-w-lg shadow-2xl rounded-lg overflow-hidden border-2 border-primary bg-black animate-in slide-in-from-bottom-4 duration-300"
            style={{ maxHeight: 'calc(100vh - 8rem)' }}
          >
            {/* PiP Header with close button */}
            <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/95 via-black/70 to-transparent px-3 py-2 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-white text-xs sm:text-sm font-semibold truncate">
                  {title}
                </p>
              </div>
              <button
                onClick={closePiP}
                className="ml-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-md transition-colors flex-shrink-0 pointer-events-auto shadow-lg"
                title="Close floating video"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PiP Video */}
            <div className="aspect-video bg-black">
              <MediaPlayer
                url={url}
                title={title}
                isPremium={true}
                type="video"
                thumbnail={thumbnail}
                mediaId={courseId}
              />
            </div>

            {/* Click area to return to main video */}
            <div
              onClick={closePiP}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 cursor-pointer hover:from-black/90 transition-all"
            >
              <p className="text-white text-xs text-center">
                Click to return to main video
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
