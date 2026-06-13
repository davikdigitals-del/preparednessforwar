import { useState, useRef, useEffect } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Download, SkipBack, SkipForward, Settings, Check
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
function getDailymotionId(url: string) {
  const m = url.match(/dailymotion\.com\/video\/([^_?]+)/);
  return m ? m[1] : null;
}
function getTwitchId(url: string) {
  const m = url.match(/twitch\.tv\/videos\/(\d+)/);
  return m ? m[1] : null;
}
function getSpotifyId(url: string) {
  const m = url.match(/spotify\.com\/episode\/([a-zA-Z0-9]+)/);
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
  const hideTimer = useRef<NodeJS.Timeout>();

  const resetHideTimer = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    if (!isAudio) hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => { resetHideTimer(); return () => clearTimeout(hideTimer.current); }, []);

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
        el.requestFullscreen().then(() => {
          setFullscreen(true);
        }).catch((err) => {
          console.error("Fullscreen request failed:", err);
        });
      } else {
        document.exitFullscreen().then(() => {
          setFullscreen(false);
        }).catch((err) => {
          console.error("Exit fullscreen failed:", err);
        });
      }
    } catch (err) {
      console.error("Fullscreen toggle error:", err);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
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
      className={`relative bg-black select-none ${isAudio ? "rounded-xl overflow-hidden" : "w-full"}`}
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
            className="w-full aspect-video"
            poster={thumbnail}
            onTimeUpdate={() => setCurrentTime(mediaRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setDuration(mediaRef.current?.duration || 0)}
            onEnded={() => setPlaying(false)}
            onClick={(e) => e.stopPropagation()}
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
        className={`${isAudio ? "" : "absolute bottom-0 left-0 right-0"} bg-gradient-to-t from-black/90 to-transparent px-4 pb-3 pt-8 transition-opacity duration-300 ${showControls || isAudio ? "opacity-100" : "opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
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
          {!isAudio && (
            <button onClick={toggleFullscreen} className="text-white/80 hover:text-white transition-colors">
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
  return (
    <div className="relative bg-black">
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent px-4 py-2 pointer-events-none">
        <p className="text-white text-sm font-semibold line-clamp-1">{title}</p>
      </div>
      <div className="aspect-video">
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share"
          allowFullScreen
        />
      </div>
      {!isPremium && (
        <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
          <span className="text-gray-400 text-xs">Free content</span>
          <button
            onClick={() => saveToDashboard(originalUrl, title, type || 'video', mediaId, setSaving, setSaved)}
            disabled={saving || saved}
            className="flex items-center gap-1.5 text-xs text-white bg-primary hover:bg-primary/90 disabled:opacity-50 px-3 py-1.5 rounded transition-colors"
          >
            {saving ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : saved ? <Check className="w-3.5 h-3.5 text-green-300" />
              : <Download className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save to Dashboard'}
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
  const dailymotionId = getDailymotionId(url);
  const twitchId = getTwitchId(url);
  const spotifyId = getSpotifyId(url);
  const directVideo = isDirectVideo(url);
  const directAudio = isDirectAudio(url) || type === "podcast" || type === "audio";

  if (ytId) {
    const embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&color=white`;
    return <EmbeddedPlayer embedUrl={embedUrl} title={title} isPremium={isPremium} originalUrl={url} mediaId={mediaId} type={type} />;
  }
  if (vimeoId) {
    const embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0&badge=0`;
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
    const embedUrl = `https://open.spotify.com/embed/episode/${spotifyId}?utm_source=generator&theme=0`;
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
