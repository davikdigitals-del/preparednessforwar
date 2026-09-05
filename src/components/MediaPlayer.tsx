import { useState, useRef } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { ArticleVideo } from "@/components/ArticleVideo";
import { supabase } from "@/integrations/supabase/client";

interface MediaPlayerProps {
  url: string;
  title: string;
  isPremium?: boolean;
  type?: "video" | "podcast" | "audio";
  thumbnail?: string;
  mediaId?: string;
}

// Save media to member's dashboard offline content
async function saveToDashboard(
  url: string,
  title: string,
  type: string,
  mediaId: string | undefined
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login?redirect=/media';
      return;
    }
    const contentId = mediaId || url;
    const contentType = (type === 'podcast' || type === 'audio') ? 'podcast' : 'video';
    const { error } = await supabase.from('offline_content').upsert({
      user_id: user.id,
      content_type: contentType,
      content_id: contentId,
      content_title: title,
      content_url: url,
      downloaded_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,content_type,content_id' });
    if (error) throw error;
  } catch (e) {
    console.error('Save to dashboard failed:', e);
  }
}

// Simple audio player for podcasts and audio content
function AudioPlayer({ url, title, isPremium, thumbnail, mediaId, type }: {
  url: string; title: string; isPremium?: boolean; thumbnail?: string; mediaId?: string; type?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl p-6">
      <div className="flex flex-col items-center gap-4">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-40 h-40 rounded-xl object-cover shadow-2xl" />
        ) : (
          <div className="w-40 h-40 rounded-xl bg-gray-800 flex items-center justify-center">
            <Volume2 className="w-16 h-16 text-gray-600" />
          </div>
        )}
        <p className="text-white font-semibold text-center text-sm line-clamp-2">{title}</p>
      </div>

      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
      />

      <div className="mt-4 bg-black/30 rounded-lg p-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
            {playing ? <Pause className="w-8 h-8 fill-white" /> : <Play className="w-8 h-8 fill-white ml-1" />}
          </button>
          <span className="text-white/70 text-sm font-mono flex-1">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="w-full h-2 bg-white/20 rounded-full cursor-pointer"
          onClick={(e) => {
            const audio = audioRef.current;
            const bar = e.currentTarget;
            if (!audio || !bar) return;
            const rect = bar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audio.currentTime = percent * duration;
          }}>
          <div className="h-full bg-primary rounded-full"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }} />
        </div>
      </div>
    </div>
  );
}

export function MediaPlayer({ url, title, isPremium = false, type, thumbnail, mediaId }: MediaPlayerProps) {
  if (!url) return null;

  // Enhanced type detection - check both explicit type and URL patterns
  const isAudioContent = type === "podcast" || type === "audio" ||
    /\.(mp3|wav|ogg|aac|m4a|flac)(\?|$)/i.test(url) ||
    // Additional podcast/audio platform detection
    url.includes('spotify') || url.includes('soundcloud') ||
    url.includes('anchor.fm') || url.includes('podcast');

  // For audio/podcast content, use the AudioPlayer
  if (isAudioContent) {
    return <AudioPlayer url={url} title={title} isPremium={isPremium} thumbnail={thumbnail} mediaId={mediaId} type={type || 'podcast'} />;
  }

  // For all video content, use the new ArticleVideo component
  return (
    <div className="relative">
      <ArticleVideo url={url} title={title} />
      {!isPremium && (
        <div className="bg-gray-900 px-4 py-2 flex items-center justify-between mt-2 rounded-b-lg">
          <span className="text-gray-400 text-xs">Premium content available</span>
          <button
            onClick={() => saveToDashboard(url, title, type || 'video', mediaId)}
            className="flex items-center gap-1.5 text-xs text-white bg-primary hover:bg-primary/90 px-3 py-1.5 rounded transition-colors"
          >
            Save to Library
          </button>
        </div>
      )}
    </div>
  );
}