import { useState, useRef, useEffect } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { MediaPlayer } from "./MediaPlayer";

interface CourseVideoPlayerProps {
  url: string;
  title: string;
  thumbnail?: string;
  courseId?: string;
}

export function CourseVideoPlayer({ url, title, thumbnail, courseId }: CourseVideoPlayerProps) {
  const [isPiP, setIsPiP] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Setup Intersection Observer to detect when video scrolls out of view
    if (!videoContainerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // If video is less than 20% visible, enable PiP
        if (entry.intersectionRatio < 0.2 && !isPiP) {
          setIsPiP(true);
        }
        // If video is more than 50% visible, disable PiP
        if (entry.intersectionRatio > 0.5 && isPiP) {
          setIsPiP(false);
        }
      },
      {
        threshold: [0, 0.2, 0.5, 1],
      }
    );

    observerRef.current.observe(videoContainerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isPiP]);

  const closePiP = () => {
    setIsPiP(false);
    // Scroll back to video
    videoContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const toggleFullWidth = () => {
    setIsFullWidth(!isFullWidth);
  };

  return (
    <>
      {/* Main Video Container */}
      <div
        ref={videoContainerRef}
        className={`relative bg-black rounded-lg overflow-hidden transition-all duration-300 ${
          isFullWidth ? "w-screen -mx-3 sm:-mx-6 md:-mx-8 lg:-mx-12" : "w-full"
        }`}
      >
        {/* Full Width Toggle Button */}
        <button
          onClick={toggleFullWidth}
          className="absolute top-3 right-3 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur transition-colors"
          title={isFullWidth ? "Exit full width" : "Full width"}
        >
          {isFullWidth ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        <MediaPlayer
          url={url}
          title={title}
          isPremium={true}
          type="video"
          thumbnail={thumbnail}
          mediaId={courseId}
        />
      </div>

      {/* Picture-in-Picture Floating Video */}
      {isPiP && (
        <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 shadow-2xl rounded-lg overflow-hidden border-2 border-primary animate-in slide-in-from-bottom-4 duration-300">
          {/* PiP Header */}
          <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/90 to-transparent px-3 py-2 flex items-center justify-between">
            <p className="text-white text-xs font-semibold truncate flex-1">{title}</p>
            <button
              onClick={closePiP}
              className="ml-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded transition-colors flex-shrink-0"
              title="Close floating video"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* PiP Video */}
          <div className="aspect-video">
            <MediaPlayer
              url={url}
              title={title}
              isPremium={true}
              type="video"
              thumbnail={thumbnail}
              mediaId={courseId}
            />
          </div>

          {/* Click to return to main video */}
          <button
            onClick={closePiP}
            className="absolute inset-0 cursor-pointer hover:bg-black/10 transition-colors"
            title="Return to main video"
          />
        </div>
      )}
    </>
  );
}
