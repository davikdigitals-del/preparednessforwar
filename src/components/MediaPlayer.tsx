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

  // Helper function to construct proper Supabase URL if needed
  const getValidUrl = (inputUrl: string): string => {
    // If it's already a full URL, return as-is
    if (inputUrl.startsWith('http')) {
      return inputUrl;
    }

    // If it looks like a Supabase storage filename, construct the full URL
    if (inputUrl.includes('-') && inputUrl.includes('.')) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl) {
        // Audio files are now stored in post-videos bucket (along with videos)
        if (inputUrl.match(/\.(mp3|wav|ogg|aac|m4a|flac|mp4|webm|mov)$/i)) {
          return `${supabaseUrl}/storage/v1/object/public/post-videos/${inputUrl}`;
        } else {
          return `${supabaseUrl}/storage/v1/object/public/media/${inputUrl}`;
        }
      }
    }

    return inputUrl;
  };

  // Get the properly formatted URL
  const validUrl = getValidUrl(url);

  // Debug logging for URL issues
  console.log('MediaPlayer AudioPlayer:', { originalUrl: url, validUrl, isDirectAudio: /\.(mp3|wav|ogg|aac|m4a|flac)(\?|$)/i.test(validUrl) });

  // Check if it's a direct audio file vs external podcast link
  const isDirectAudio = /\.(mp3|wav|ogg|aac|m4a|flac)(\?|$)/i.test(validUrl);

  // Helper function to convert Spotify share URLs to embed URLs
  const getSpotifyEmbedUrl = (url: string): string | null => {
    // Handle Spotify share links: https://open.spotify.com/episode/... or https://spotify.link/...
    if (url.includes('spotify.link/') || url.includes('open.spotify.com/share/')) {
      // These are share links that typically redirect - we'll try to convert them
      // For now, assume they follow similar patterns to regular Spotify URLs
      return url.replace('spotify.link/', 'open.spotify.com/embed/')
        .replace('/share/', '/embed/');
    }

    // Convert regular Spotify URLs to embed format
    if (url.includes('open.spotify.com') && !url.includes('/embed/')) {
      return url.replace('open.spotify.com', 'open.spotify.com/embed');
    }

    if (url.includes('open.spotify.com/embed/')) {
      return url;
    }
    return null;
  };

  // Helper function to get SoundCloud embed URL
  const getSoundCloudEmbedUrl = (url: string): string | null => {
    if (url.includes('soundcloud.com') && !url.includes('widget')) {
      const trackUrl = encodeURIComponent(url);
      return `https://w.soundcloud.com/player/?url=${trackUrl}&auto_play=false&show_artwork=true`;
    }
    return url.includes('soundcloud.com') ? url : null;
  };

  // Helper function to get Apple Podcasts embed URL
  const getAppleEmbedUrl = (url: string): string | null => {
    if (url.includes('podcasts.apple.com')) {
      // Apple Podcasts can be embedded using their embed format
      return url.replace('podcasts.apple.com', 'embed.podcasts.apple.com');
    }
    return null;
  };

  // Helper function to get Sky News podcast embed URL
  const getSkyNewsEmbedUrl = (url: string): string | null => {
    if (url.includes('news.sky.com') && url.includes('podcast')) {
      // Sky News podcast URLs can often be embedded
      const podcastRegex = /news\.sky\.com\/.*podcast.*\/([^\/]+)/;
      const match = url.match(podcastRegex);
      if (match) {
        return `https://www.skynews.com/embed/podcast/${match[1]}`;
      }
      // If no specific match, try generic Sky News embed
      return url.replace('news.sky.com', 'www.skynews.com/embed');
    }
    return null;
  };

  // Check for embeddable platforms
  const spotifyEmbedUrl = getSpotifyEmbedUrl(validUrl);
  const soundcloudEmbedUrl = getSoundCloudEmbedUrl(validUrl);
  const appleEmbedUrl = getAppleEmbedUrl(validUrl);
  const skyNewsEmbedUrl = getSkyNewsEmbedUrl(validUrl);

  const isEmbeddablePodcast = spotifyEmbedUrl || soundcloudEmbedUrl || appleEmbedUrl || skyNewsEmbedUrl || validUrl.includes('anchor.fm');

  const isExternalPodcast = !isDirectAudio && !isEmbeddablePodcast && (
    validUrl.includes('podcast') ||
    validUrl.includes('spreaker') ||
    validUrl.includes('buzzsprout')
  );

  // For embeddable podcast platforms (Spotify, SoundCloud, Anchor)
  if (isEmbeddablePodcast) {
    let embedUrl = validUrl;
    let height = '152'; // Default Spotify height

    if (spotifyEmbedUrl) {
      embedUrl = spotifyEmbedUrl;
      height = '152';
    } else if (soundcloudEmbedUrl) {
      embedUrl = soundcloudEmbedUrl;
      height = '166';
    } else if (appleEmbedUrl) {
      embedUrl = appleEmbedUrl;
      height = '175';
    } else if (skyNewsEmbedUrl) {
      embedUrl = skyNewsEmbedUrl;
      height = '200';
    } else if (validUrl.includes('anchor.fm')) {
      // Anchor.fm episodes can often be embedded directly
      embedUrl = validUrl;
      height = '102';
    }

    return (
      <div className="my-6">
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-6 shadow-2xl">
          <div className="mb-4">
            <h3 className="text-white text-lg font-bold mb-2">{title}</h3>
            <p className="text-white/70 text-sm mb-4">
              {spotifyEmbedUrl ? '🎵 Spotify' : soundcloudEmbedUrl ? '🎧 SoundCloud' : appleEmbedUrl ? '🍎 Apple Podcasts' : skyNewsEmbedUrl ? '🏛️ Sky News' : validUrl.includes('anchor') ? '⚓ Anchor' : 'Podcast'}
            </p>
          </div>

          <div className="bg-black/20 rounded-xl overflow-hidden">
            <iframe
              src={embedUrl}
              width="100%"
              height={height}
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={title}
              className="w-full"
            />
          </div>

          {isPremium && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => saveToDashboard(validUrl, title, type || 'podcast', mediaId)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Save to Library
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // For external podcast platforms that can't be embedded (Apple Podcasts, etc.)
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
              <p className="text-white/80 text-sm font-medium mb-1">{validUrl.includes('spotify') ? 'Available on Spotify' : validUrl.includes('apple') ? 'Available on Apple Podcasts' : 'External Podcast'}</p>
              <h3 className="text-white text-xl font-bold line-clamp-2 mb-2">{title}</h3>
              <p className="text-white/70 text-sm">
                Podcast • {formatTime(duration || 0)} • {validUrl.includes('spotify') ? 'Spotify' : validUrl.includes('apple') ? 'Apple Podcasts' : 'External Platform'}
              </p>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <a
                href={validUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Open in {validUrl.includes('spotify') ? 'Spotify' : validUrl.includes('apple') ? 'Apple Podcasts' : 'Platform'}
              </a>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm font-mono">
                External Link
              </span>
              <a
                href={validUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
              >
                <Play className="w-5 h-5 text-blue-600 ml-0.5 fill-blue-600" />
              </a>
            </div>
          </div>

          {/* Platform Logo - Only show for external podcast platforms */}
          {validUrl.includes('spotify') && (
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.062 14.25c-.175.287-.55.375-.875.2-2.4-1.463-5.425-1.788-8.988-.975-.363.075-.725-.15-.8-.513-.075-.363.15-.725.513-.8 3.9-.888 7.238-.513 10.013 1.125.337.2.45.637.237.963zm1.25-2.788c-.213.363-.663.475-1.025.262-2.75-1.687-6.938-2.175-10.188-1.188-.438.125-.888-.125-1.013-.563-.125-.438.125-.888.563-1.013 3.738-1.125 8.413-.588 11.538 1.375.362.213.487.662.275 1.025zm.113-2.9c-3.3-1.963-8.738-2.138-11.888-1.188-.525.15-1.075-.15-1.225-.675-.15-.525.15-1.075.675-1.225 3.6-1.088 9.6-.888 13.425 1.375.425.25.563.8.313 1.225-.25.425-.8.563-1.225.313z" />
              </svg>
            </div>
          )}
          {validUrl.includes('apple') && (
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
            </div>
          )}
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

  const handleAudioError = (event?: any) => {
    console.error('Audio loading error:', { url, validUrl, error: event?.target?.error });
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
              Podcast • {formatTime(duration)} • {validUrl.includes('spotify') ? 'Spotify' : validUrl.includes('apple') ? 'Apple Podcasts' : 'Audio Content'}
            </p>
          </div>

          <audio
            ref={audioRef}
            src={validUrl}
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
                href={validUrl}
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

        {/* Platform Logo - Only show for specific platforms */}
        {validUrl.includes('spotify') && (
          <div className="flex-shrink-0">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.062 14.25c-.175.287-.55.375-.875.2-2.4-1.463-5.425-1.788-8.988-.975-.363.075-.725-.15-.8-.513-.075-.363.15-.725.513-.8 3.9-.888 7.238-.513 10.013 1.125.337.2.45.637.237.963zm1.25-2.788c-.213.363-.663.475-1.025.262-2.75-1.687-6.938-2.175-10.188-1.188-.438.125-.888-.125-1.013-.563-.125-.438.125-.888.563-1.013 3.738-1.125 8.413-.588 11.538 1.375.362.213.487.662.275 1.025zm.113-2.9c-3.3-1.963-8.738-2.138-11.888-1.188-.525.15-1.075-.15-1.225-.675-.15-.525.15-1.075.675-1.225 3.6-1.088 9.6-.888 13.425 1.375.425.25.563.8.313 1.225-.25.425-.8.563-1.225.313z" />
            </svg>
          </div>
        )}
        {validUrl.includes('apple') && (
          <div className="flex-shrink-0">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
          </div>
        )}
        {!validUrl.includes('spotify') && !validUrl.includes('apple') && (
          <div className="flex-shrink-0">
            <Volume2 className="w-8 h-8 text-white/60" />
          </div>
        )}
      </div>
    </div>
  );
}

export function MediaPlayer({ url, title, isPremium = false, type, thumbnail, mediaId }: MediaPlayerProps) {
  if (!url) return null;

  // Enhanced type detection - check both explicit type and URL patterns
  const isAudioContent = type === "podcast" || type === "audio" ||
    // Only consider audio if it's explicitly set as podcast/audio OR has audio file extension
    (/\.(mp3|wav|ogg|aac|m4a|flac)(\?|$)/i.test(url) && type !== "video") ||
    // Additional podcast/audio platform detection (but only if type isn't explicitly video)
    (type !== "video" && (
      url.includes('spotify.com') ||
      url.includes('soundcloud.com') ||
      url.includes('anchor.fm') ||
      url.includes('podcasts.apple.com') ||
      url.includes('podcast')
    ));

  console.log('MediaPlayer type detection:', {
    url,
    type,
    isAudioContent,
    hasAudioExtension: /\.(mp3|wav|ogg|aac|m4a|flac)(\?|$)/i.test(url),
    hasVideoExtension: /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(url)
  });

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