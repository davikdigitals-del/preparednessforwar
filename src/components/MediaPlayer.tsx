import { useState, useRef, useEffect } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, PictureInPicture2,
  Download, SkipBack, SkipForward, Settings, Check, X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MediaPlayerProps {
  url: string;
  title: string;
  isPremium?: boolean;
  type?: "video" | "podcast" | "audio";
  thumbnail?: string;
  mediaId?: string;
}

function getYouTubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}
function getVimeoId(url: string) {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}
function getTikTokId(url: string) {
  // TikTok URLs: https://www.tiktok.com/@username/video/1234567890
  // or vm.tiktok.com/XXX or mobile.tiktok.com
  // Also handle short URLs like vm.tiktok.com/XXXXX
  let m = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
  if (m) return m[1];

  // Handle mobile and short URLs - extract video ID if present
  m = url.match(/tiktok\.com\/v\/(\d+)/);
  if (m) return m[1];

  // For short URLs (vm.tiktok.com), we'll just return the URL itself as we need to embed the full URL
  if (url.includes('vm.tiktok.com') || url.includes('vt.tiktok.com')) {
    return 'shorturl';
  }

  return null;
}
function getDailymotionId(url: string) {
  const m = url.match(/dailymotion\.com\/video\/([^_?]+)/);
  return m ? m[1] : null;
}
function getTwitchId(url: string) {
  const m = url.match(/twitch\.tv\/videos\/(\d+)/);
  return m ? m[1] : null;
}
function getSkyNewsId(url: string) {
  // Sky News URLs: https://news.sky.com/video/... or https://www.skynews.com.au/...
  const m = url.match(/sky.*\.com.*\/video\/[^\/]*\/(\d+)/i) || url.match(/skynews\.com\.au.*\/video\/[^\/]*\/(\w+)/i);
  return m ? m[1] : null;
}
function getBitChuteId(url: string) {
  const m = url.match(/bitchute\.com\/video\/([a-zA-Z0-9]+)/);
  return m ? m[1] : null;
}
function getRumbleId(url: string) {
  const m = url.match(/rumble\.com\/([a-zA-Z0-9]+)/);
  return m ? m[1] : null;
}
function getOdyseeId(url: string) {
  const m = url.match(/odysee\.com\/@[^\/]+\/([^:]+):/);
  return m ? m[1] : null;
}
function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)
    || url.includes('/storage/v1/object/public/post-videos')
    || url.includes('/storage/v1/object/public/course-videos')
    || url.includes('/storage/v1/object/public/videos');
}
function isDirectAudio(url: string) {
  return /\.(mp3|wav|ogg|m4a|aac|flac)(\?|$)/i.test(url)
    || url.includes('/storage/v1/object/public/post-audios')
    || url.includes('/storage/v1/object/public/podcasts');
}

// Save media to member's dashboard offline content
async function saveToDashboard(
  url: string,
  title: string,
  type: string,
  mediaId: string | undefined,
  setSaving: (v: boolean) => void,
  setSaved: (v: boolean) => void
) {
  setSaving(true);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login?redirect=/media';
      setSaving(false);
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
    setSaved(true);
  } catch (e) {
    console.error('Save to dashboard failed:', e);
  } finally {
    setSaving(false);
  }
}

function fmt(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function CustomPlayer({ url, title, isPremium, isAudio, thumbnail, mediaId, type }: {
  url: string; title: string; isPremium?: boolean; isAudio?: boolean; thumbnail?: string; mediaId?: string; type?: string;
}) {
  const mediaRef = useRef<HTMLVideoElement & HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pipSupported, setPipSupported] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const hideTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setPipSupported(document.pictureInPictureEnabled || false);
  }, []);

  const resetHideTimer = () => {
    setShowControls(true);
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    // Hide controls after 5 seconds when in fullscreen or playing
    if (!isAudio && (fullscreen || playing)) {
      const timeout = setTimeout(() => setShowControls(false), 5000);
      setControlsTimeout(timeout);
      hideTimer.current = timeout;
    }
  };

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (controlsTimeout) clearTimeout(controlsTimeout);
    };
  }, [fullscreen, playing]);

  const togglePlay = () => {
    const m = mediaRef.current;
    if (!m) return;
    if (m.paused) { m.play(); setPlaying(true); } else { m.pause(); setPlaying(false); }
    resetHideTimer();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    const m = mediaRef.current;
    if (!bar || !m) return;
    m.currentTime = ((e.clientX - bar.getBoundingClientRect().left) / bar.getBoundingClientRect().width) * duration;
    resetHideTimer();
  };

  const skip = (secs: number) => {
    const m = mediaRef.current;
    if (m) m.currentTime = Math.max(0, Math.min(duration, m.currentTime + secs));
    resetHideTimer();
  };

  const changeVolume = (v: number) => {
    const m = mediaRef.current;
    if (m) { m.volume = v; setVolume(v); setMuted(v === 0); }
  };

  const toggleMute = () => {
    const m = mediaRef.current;
    if (!m) return;
    m.muted = !m.muted;
    setMuted(m.muted);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;

    try {
      if (!document.fullscreenElement) {
        // Try to lock orientation to landscape on mobile
        el.requestFullscreen().then(async () => {
          setFullscreen(true);
          // Lock to landscape on mobile devices
          if (window.screen?.orientation?.lock) {
            try {
              await window.screen.orientation.lock('landscape');
            } catch (err) {
              console.log('Orientation lock not supported');
            }
          }
        }).catch((err) => {
          console.error("Fullscreen request failed:", err);
        });
      } else {
        document.exitFullscreen().then(() => {
          setFullscreen(false);
          // Unlock orientation
          if (window.screen?.orientation?.unlock) {
            try {
              window.screen.orientation.unlock();
            } catch (err) {
              console.log('Orientation unlock failed');
            }
          }
        }).catch((err) => {
          console.error("Exit fullscreen failed:", err);
        });
      }
    } catch (err) {
      console.error("Fullscreen toggle error:", err);
    }
  };

  const togglePip = async () => {
    const video = mediaRef.current;
    if (!video || isAudio) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP toggle error:", err);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      setFullscreen(isFullscreen);

      // Unlock orientation when exiting fullscreen
      if (!isFullscreen && window.screen?.orientation?.unlock) {
        try {
          window.screen.orientation.unlock();
        } catch (err) {
          // Ignore
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const changeSpeed = (s: number) => {
    const m = mediaRef.current;
    if (m) { m.playbackRate = s; setSpeed(s); }
    setShowSpeed(false);
  };

  const pct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black select-none ${isAudio ? "rounded-xl overflow-hidden" : "w-full"
        }`}
      onMouseMove={resetHideTimer}
      onClick={isAudio ? undefined : togglePlay}
    >
      {isAudio ? (
        <>
          <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-b from-gray-900 to-black">
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
            ref={mediaRef as any}
            src={url}
            onTimeUpdate={() => setCurrentTime(mediaRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setDuration(mediaRef.current?.duration || 0)}
            onEnded={() => setPlaying(false)}
          />
        </>
      ) : (
        <>
          <video
            ref={mediaRef as any}
            src={url}
            className="w-full h-full object-contain"
            poster={thumbnail}
            onTimeUpdate={() => setCurrentTime(mediaRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setDuration(mediaRef.current?.duration || 0)}
            onEnded={() => setPlaying(false)}
            onClick={(e) => {
              e.stopPropagation();
              // Toggle controls on tap (like MX Player)
              if (fullscreen) {
                setShowControls(!showControls);
                if (!showControls) {
                  resetHideTimer();
                }
              }
            }}
          />
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
            </div>
          )}
        </>
      )}

      <div
        className={`${isAudio ? "" : "absolute bottom-0 left-0 right-0"} bg-gradient-to-t from-black/90 to-transparent px-4 pb-3 pt-8 transition-opacity duration-300 ${showControls || isAudio ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={(e) => e.stopPropagation()}
        onMouseMove={resetHideTimer}
        onTouchStart={resetHideTimer}
      >
        <div ref={progressRef} className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-3 group" onClick={seek}>
          <div className="h-full bg-primary rounded-full relative" style={{ width: `${pct}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => skip(-10)} className="text-white/80 hover:text-white transition-colors"><SkipBack className="w-4 h-4" /></button>
          <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
            {playing ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
          </button>
          <button onClick={() => skip(10)} className="text-white/80 hover:text-white transition-colors"><SkipForward className="w-4 h-4" /></button>
          <span className="text-white/70 text-xs font-mono">{fmt(currentTime)} / {fmt(duration)}</span>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5">
            <button onClick={toggleMute} className="text-white/80 hover:text-white transition-colors">
              {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              className="w-16 h-1 accent-primary cursor-pointer" />
          </div>
          <div className="relative">
            <button onClick={() => setShowSpeed(s => !s)} className="text-white/80 hover:text-white text-xs font-bold transition-colors flex items-center gap-1">
              <Settings className="w-3.5 h-3.5" />{speed}x
            </button>
            {showSpeed && (
              <div className="absolute bottom-8 right-0 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-xl z-50">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
                  <button key={s} onClick={() => changeSpeed(s)}
                    className={`block w-full px-4 py-1.5 text-xs text-left hover:bg-gray-700 transition-colors ${speed === s ? "text-primary font-bold" : "text-white"}`}>
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>
          {!isPremium && (
            <button
              onClick={() => saveToDashboard(url, title, type || 'video', mediaId, setSaving, setSaved)}
              disabled={saving || saved}
              className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
              title={saved ? "Saved to dashboard" : "Save to dashboard"}
            >
              {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin block" />
                : saved ? <Check className="w-4 h-4 text-green-400" />
                  : <Download className="w-4 h-4" />}
            </button>
          )}
          {!isAudio && pipSupported && (
            <button onClick={togglePip} className="text-white/80 hover:text-white transition-colors" title="Picture-in-Picture">
              <PictureInPicture2 className="w-4 h-4" />
            </button>
          )}
          {!isAudio && (
            <button onClick={toggleFullscreen} className="text-white/80 hover:text-white transition-colors" title="Fullscreen">
              {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmbeddedPlayer({ embedUrl, title, isPremium, originalUrl, mediaId, type }: {
  embedUrl: string; title: string; isPremium?: boolean; originalUrl: string; mediaId?: string; type?: string;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Detect platform for targeted overlay positioning
  const platform = originalUrl.includes('tiktok') ? 'tiktok'
    : originalUrl.includes('youtube') || originalUrl.includes('youtu.be') ? 'youtube'
      : originalUrl.includes('vimeo') ? 'vimeo'
        : originalUrl.includes('spotify') ? 'spotify'
          : originalUrl.includes('sky') ? 'skynews'
            : originalUrl.includes('bitchute') ? 'bitchute'
              : originalUrl.includes('rumble') ? 'rumble'
                : originalUrl.includes('odysee') ? 'odysee'
                  : 'other';

  return (
    <div className="relative bg-black w-full">
      <div className="w-full">
        {loadError ? (
          <div className="w-full min-h-[400px] aspect-video bg-gray-900 flex flex-col items-center justify-center text-white p-8">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">Video Unavailable</p>
              <p className="text-sm text-gray-400 mb-4">
                This content is currently unavailable. Please try again later.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative w-full overflow-hidden">
            <iframe
              src={embedUrl}
              title={title}
              className="w-full min-h-[400px] aspect-video border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen={true}
              onError={() => setLoadError(true)}
              style={{
                border: 'none',
                outline: 'none',
                background: '#000'
              }}
            />

            {/* Platform-specific overlay system to hide branding */}
            {platform === 'tiktok' && (
              <>
                {/* TikTok logo - top right corner */}
                <div className="absolute top-3 right-3 w-10 h-8 bg-black rounded opacity-90 pointer-events-none z-20" />

                {/* TikTok watermark/username - left side */}
                <div className="absolute bottom-20 left-4 w-28 h-6 bg-black rounded opacity-90 pointer-events-none z-20" />

                {/* TikTok sound credit - bottom center */}
                <div className="absolute bottom-4 left-4 right-4 h-8 bg-black/90 rounded pointer-events-none z-20" />

                {/* TikTok promotional overlay - bottom area for "original sound" text */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-20" />

                {/* Additional overlay for @username watermarks */}
                <div className="absolute bottom-32 left-2 w-20 h-5 bg-black rounded opacity-90 pointer-events-none z-20" />
              </>
            )}

            {platform === 'youtube' && (
              <>
                {/* YouTube logo - top left */}
                <div className="absolute top-3 left-3 w-20 h-6 bg-black rounded opacity-90 pointer-events-none z-20" />

                {/* YouTube watermark - bottom right */}
                <div className="absolute bottom-3 right-3 w-16 h-5 bg-black rounded opacity-90 pointer-events-none z-20" />

                {/* YouTube branding - top right */}
                <div className="absolute top-3 right-3 w-12 h-8 bg-black rounded opacity-90 pointer-events-none z-20" />
              </>
            )}

            {platform === 'vimeo' && (
              <>
                {/* Vimeo branding - top right */}
                <div className="absolute top-3 right-3 w-12 h-6 bg-black rounded opacity-90 pointer-events-none z-20" />

                {/* Vimeo logo - bottom right */}
                <div className="absolute bottom-3 right-3 w-10 h-4 bg-black rounded opacity-90 pointer-events-none z-20" />
              </>
            )}

            {platform === 'skynews' && (
              <>
                {/* Sky News logo - top left */}
                <div className="absolute top-3 left-3 w-16 h-6 bg-black rounded opacity-90 pointer-events-none z-20" />

                {/* Sky News branding - bottom */}
                <div className="absolute bottom-3 left-3 right-3 h-6 bg-black rounded opacity-90 pointer-events-none z-20" />
              </>
            )}

            {platform === 'bitchute' && (
              <>
                {/* BitChute logo - top right */}
                <div className="absolute top-3 right-3 w-14 h-6 bg-black rounded opacity-90 pointer-events-none z-20" />

                {/* BitChute watermark */}
                <div className="absolute bottom-3 right-3 w-12 h-5 bg-black rounded opacity-90 pointer-events-none z-20" />
              </>
            )}

            {platform === 'rumble' && (
              <>
                {/* Rumble logo - top left */}
                <div className="absolute top-3 left-3 w-16 h-6 bg-black rounded opacity-90 pointer-events-none z-20" />

                {/* Rumble branding */}
                <div className="absolute bottom-3 left-3 w-14 h-5 bg-black rounded opacity-90 pointer-events-none z-20" />
              </>
            )}

            {platform === 'odysee' && (
              <>
                {/* Odysee logo - top right */}
                <div className="absolute top-3 right-3 w-12 h-6 bg-black rounded opacity-90 pointer-events-none z-20" />

                {/* Odysee branding */}
                <div className="absolute bottom-3 right-3 w-10 h-4 bg-black rounded opacity-90 pointer-events-none z-20" />
              </>
            )}

            {/* Universal corner overlays for any remaining platform logos */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute top-0 right-0 w-16 h-12 bg-gradient-to-bl from-black/70 to-transparent" />
              <div className="absolute top-0 left-0 w-16 h-12 bg-gradient-to-br from-black/50 to-transparent" />
              <div className="absolute bottom-0 right-0 w-20 h-10 bg-gradient-to-tl from-black/60 to-transparent" />
            </div>
          </div>
        )}
      </div>
      {!isPremium && (
        <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
          <span className="text-gray-400 text-xs">Premium content available</span>
          <button
            onClick={() => saveToDashboard(originalUrl, title, type || 'video', mediaId, setSaving, setSaved)}
            disabled={saving || saved}
            className="flex items-center gap-1.5 text-xs text-white bg-primary hover:bg-primary/90 disabled:opacity-50 px-3 py-1.5 rounded transition-colors"
          >
            {saving ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : saved ? <Check className="w-3.5 h-3.5 text-green-300" />
                : <Download className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save to Library'}
          </button>
        </div>
      )}
    </div>
  );
}

export function MediaPlayer({ url, title, isPremium = false, type, thumbnail, mediaId }: MediaPlayerProps) {
  if (!url) return null;

  const ytId = getYouTubeId(url);
  const vimeoId = getVimeoId(url);
  const tiktokId = getTikTokId(url);
  const dailymotionId = getDailymotionId(url);
  const twitchId = getTwitchId(url);
  const spotifyId = getSpotifyId(url);
  const skyNewsId = getSkyNewsId(url);
  const bitchuteId = getBitChuteId(url);
  const rumbleId = getRumbleId(url);
  const odyseeId = getOdyseeId(url);
  const directVideo = isDirectVideo(url);
  const directAudio = isDirectAudio(url) || type === "podcast" || type === "audio";

  if (ytId) {
    const embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&color=white&controls=1&disablekb=1&fs=1&cc_load_policy=0&hl=en&loop=0&wmode=opaque&origin=${window.location.origin}&widget_referrer=${window.location.origin}`;
    return <EmbeddedPlayer embedUrl={embedUrl} title={title} isPremium={isPremium} originalUrl={url} mediaId={mediaId} type={type} />;
  }
  if (vimeoId) {
    const embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0&badge=0&color=ffffff&transparent=0&loop=0&speed=0&keyboard=1&pip=1&playsInline=1&controls=1`;
    return <EmbeddedPlayer embedUrl={embedUrl} title={title} isPremium={isPremium} originalUrl={url} mediaId={mediaId} type={type} />;
  }
  if (tiktokId) {
    // TikTok embed - use minimal branding approach
    let embedUrl: string;
    if (tiktokId === 'shorturl') {
      embedUrl = url; // Use original URL as fallback
    } else {
      // Use TikTok's embed with minimal branding parameters
      embedUrl = `https://www.tiktok.com/embed/${tiktokId}?hideCaption=1&hideCounts=1&transparent=1`;
    }
    return <EmbeddedPlayer embedUrl={embedUrl} title={title} isPremium={isPremium} originalUrl={url} mediaId={mediaId} type={type} />;
  }
  if (dailymotionId) {
    const embedUrl = `https://www.dailymotion.com/embed/video/${dailymotionId}?autoplay=1`;
    return <EmbeddedPlayer embedUrl={embedUrl} title={title} isPremium={isPremium} originalUrl={url} mediaId={mediaId} type={type} />;
  }
  if (twitchId) {
    const embedUrl = `https://player.twitch.tv/?video=${twitchId}&parent=${window.location.hostname}&autoplay=true`;
    return <EmbeddedPlayer embedUrl={embedUrl} title={title} isPremium={isPremium} originalUrl={url} mediaId={mediaId} type={type} />;
  }
  if (spotifyId) {
    const embedUrl = `https://open.spotify.com/embed/episode/${spotifyId}?utm_source=generator&theme=0&t=0&utm_medium=embed_player_v1&show_artwork=true&frameborder=0`;
    return <EmbeddedPlayer embedUrl={embedUrl} title={title} isPremium={isPremium} originalUrl={url} mediaId={mediaId} type={type} />;
  }
  if (skyNewsId) {
    // For Sky News, try to embed directly or fallback to iframe with the full URL
    const embedUrl = url.includes('skynews.com.au')
      ? `https://www.skynews.com.au/embed/${skyNewsId}`
      : `https://news.sky.com/embed/${skyNewsId}`;
    return <EmbeddedPlayer embedUrl={embedUrl} title={title} isPremium={isPremium} originalUrl={url} mediaId={mediaId} type={type} />;
  }
  if (bitchuteId) {
    const embedUrl = `https://www.bitchute.com/embed/${bitchuteId}/`;
    return <EmbeddedPlayer embedUrl={embedUrl} title={title} isPremium={isPremium} originalUrl={url} mediaId={mediaId} type={type} />;
  }
  if (rumbleId) {
    const embedUrl = `https://rumble.com/embed/${rumbleId}/`;
    return <EmbeddedPlayer embedUrl={embedUrl} title={title} isPremium={isPremium} originalUrl={url} mediaId={mediaId} type={type} />;
  }
  if (odyseeId) {
    const embedUrl = `https://odysee.com/$/embed/${odyseeId}`;
    return <EmbeddedPlayer embedUrl={embedUrl} title={title} isPremium={isPremium} originalUrl={url} mediaId={mediaId} type={type} />;
  }
  if (directVideo && type !== "podcast" && type !== "audio") {
    return <CustomPlayer url={url} title={title} isPremium={isPremium} isAudio={false} thumbnail={thumbnail} mediaId={mediaId} type={type} />;
  }
  if (directAudio || type === "podcast" || type === "audio") {
    return <CustomPlayer url={url} title={title} isPremium={isPremium} isAudio={true} thumbnail={thumbnail} mediaId={mediaId} type={type} />;
  }
  return <EmbeddedPlayer embedUrl={url} title={title} isPremium={isPremium} originalUrl={url} mediaId={mediaId} type={type} />;
}
