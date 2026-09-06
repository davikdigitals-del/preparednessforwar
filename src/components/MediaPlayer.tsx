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

// Spotify-like audio player for podcasts and audio content
function AudioPlayer({ url, title, isPremium, thumbnail, mediaId, type }: {
  url: string; title: string; isPremium?: boolean; thumbnail?: string; mediaId?: string; type?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);

  // Helper function to format time - moved to top to avoid hoisting issues
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Check if it's a direct audio file vs external podcast link
  const isDirectAudio = /\.(mp3|wav|ogg|aac|m4a|flac)(\?|$)/i.test(url);
  const isExternalPodcast = !isDirectAudio && (
    url.includes('spotify') ||
    url.includes('apple') ||
    url.includes('anchor') ||
    url.includes('soundcloud') ||
    url.includes('podcast') ||
    url.includes('spreaker') ||
    url.includes('buzzsprout')
  );

  // For external podcast platforms that don't allow direct streaming
  if (isExternalPodcast) {
    return (
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-6">
          {/* Album Art */}
          <div className="flex-shrink-0">
            {thumbnail ? (
              <img src={thumbnail} alt={title} className="w-32 h-32 rounded-xl object-cover shadow-xl" />
            ) : (
              <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-xl">
                <Volume2 className="w-16 h-16 text-white/80" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-4">
              <p className="text-white/80 text-sm font-medium mb-1">Introducing...</p>
              <h3 className="text-white text-xl font-bold line-clamp-2 mb-2">{title}</h3>
              <p className="text-white/70 text-sm">
                Trailer • {formatTime(duration || 0)} • The Wargame
              </p>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Save on Spotify
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm font-mono">
                {formatTime(currentTime)}
              </span>
              <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <Play className="w-5 h-5 text-blue-600 ml-0.5 fill-blue-600" />
              </button>
            </div>
          </div>

          {/* Spotify Logo */}
          <div className="flex-shrink-0">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.062 14.25c-.175.287-.55.375-.875.2-2.4-1.463-5.425-1.788-8.988-.975-.363.075-.725-.15-.8-.513-.075-.363.15-.725.513-.8 3.9-.888 7.238-.513 10.013 1.125.337.2.45.637.237.963zm1.25-2.788c-.213.363-.663.475-1.025.262-2.75-1.687-6.938-2.175-10.188-1.188-.438.125-.888-.125-1.013-.563-.125-.438.125-.888.563-1.013 3.738-1.125 8.413-.588 11.538 1.375.362.213.487.662.275 1.025zm.113-2.9c-3.3-1.963-8.738-2.138-11.888-1.188-.525.15-1.075-.15-1.225-.675-.15-.525.15-1.075.675-1.225 3.6-1.088 9.6-.888 13.425 1.375.425.25.563.8.313 1.225-.25.425-.8.563-1.225.313z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(() => {
        setAudioError(true);
      });
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const handleAudioError = () => {
    setAudioError(true);
    setPlaying(false);
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center gap-6">
        {/* Album Art */}
        <div className="flex-shrink-0">
          {thumbnail ? (
            <img src={thumbnail} alt={title} className="w-32 h-32 rounded-xl object-cover shadow-xl" />
          ) : (
            <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-xl">
              <Volume2 className="w-16 h-16 text-white/80" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <p className="text-white/80 text-sm font-medium mb-1">Now Playing</p>
            <h3 className="text-white text-xl font-bold line-clamp-2 mb-2">{title}</h3>
            <p className="text-white/70 text-sm">
              Podcast • {formatTime(duration)} • Preparedness
            </p>
          </div>

          <audio
            ref={audioRef}
            src={url}
            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
            onEnded={() => setPlaying(false)}
            onError={handleAudioError}
          />

          {audioError ? (
            <div className="flex items-center gap-4 mb-4">
              <button className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-2 rounded-full transition-colors">
                <Volume2 className="w-4 h-4" />
                Audio Error
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white text-sm underline"
              >
                Open Direct Link
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-4 mb-4">
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Save to Library
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm font-mono">
              {formatTime(currentTime)}
            </span>

            {/* Progress Bar */}
            <div className="flex-1 mx-4">
              <div
                className="w-full h-1 bg-white/20 rounded-full cursor-pointer"
                onClick={(e) => {
                  const audio = audioRef.current;
                  const bar = e.currentTarget;
                  if (!audio || !bar) return;
                  const rect = bar.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  audio.currentTime = percent * duration;
                }}>
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            </div>

            <button
              onClick={togglePlay}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              {playing ? (
                <Pause className="w-5 h-5 text-blue-600 fill-blue-600" />
              ) : (
                <Play className="w-5 h-5 text-blue-600 ml-0.5 fill-blue-600" />
              )}
            </button>
          </div>
        </div>

        {/* Spotify Logo */}
        <div className="flex-shrink-0">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.062 14.25c-.175.287-.55.375-.875.2-2.4-1.463-5.425-1.788-8.988-.975-.363.075-.725-.15-.8-.513-.075-.363.15-.725.513-.8 3.9-.888 7.238-.513 10.013 1.125.337.2.45.637.237.963zm1.25-2.788c-.213.363-.663.475-1.025.262-2.75-1.687-6.938-2.175-10.188-1.188-.438.125-.888-.125-1.013-.563-.125-.438.125-.888.563-1.013 3.738-1.125 8.413-.588 11.538 1.375.362.213.487.662.275 1.025zm.113-2.9c-3.3-1.963-8.738-2.138-11.888-1.188-.525.15-1.075-.15-1.225-.675-.15-.525.15-1.075.675-1.225 3.6-1.088 9.6-.888 13.425 1.375.425.25.563.8.313 1.225-.25.425-.8.563-1.225.313z" />
          </svg>
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