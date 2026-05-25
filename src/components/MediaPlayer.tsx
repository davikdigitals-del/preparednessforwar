import { useState, useRef, useEffect } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Download, SkipBack, SkipForward, Settings
} from "lucide-react";

interface MediaPlayerProps {
  url: string;
  title: string;
  isPremium?: boolean;
  type?: "video" | "podcast" | "audio";
  thumbnail?: string;
}

/* ── URL type detection ── */
function getYouTubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}
function getVimeoId(url: string) {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}
function getSpotifyId(url: string) {
  const m = url.match(/spotify\.com\/episode\/([a-zA-Z0-9]+)/);
  return m ? m[1] : null;
}
function isDirectVideo(url: string) { return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url); }
function isDirectAudio(url: string) { return /\.(mp3|wav|ogg|m4a|aac|flac)(\?|$)/i.test(url); }

/* ── Download helper — proxies through edge function for direct files ── */
async function downloadViaProxy(url: string, title: string, setDownloading?: (v: boolean) => void) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  setDownloading?.(true);

  // For YouTube/Vimeo/Spotify — can't proxy, open externally
  const blocked = ['youtube.com', 'youtu.be', 'vimeo.com', 'spotify.com', 'apple.com'];
  if (blocked.some(b => url.includes(b))) {
    window.open(url, '_blank', 'noopener');
    setDownloading?.(false);
    return;
  }

  try {
    // Step 1: silently fetch via proxy
    const res = await fetch(`${supabaseUrl}/functions/v1/download-media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': anonKey },
      body: JSON.stringify({ url, filename: title.replace(/[^a-z0-9\s]/gi, '').trim().substring(0, 60) }),
    });

    if (!res.ok) throw new Error('proxy failed');

    // Step 2: trigger real download from blob
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = title.replace(/[^a-z0-9\s]/gi, '').trim() || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    // Fallback: direct link
    const a = document.createElement('a');
    a.href = url;
    a.download = title;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    setDownloading?.(false);
  }
}
function fmt(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/* ══════════════════════════════════════════
   CUSTOM HTML5 PLAYER (video + audio)
══════════════════════════════════════════ */
function CustomPlayer({ url, title, isPremium, isAudio, thumbnail }: {
  url: string; title: string; isPremium?: boolean; isAudio?: boolean; thumbnail?: string;
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
  const [downloading, setDownloading] = useState(false);
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
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    m.currentTime = pct * duration;
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
    if (!document.fullscreenElement) { el.requestFullscreen(); setFullscreen(true); }
    else { document.exitFullscreen(); setFullscreen(false); }
  };

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
      {/* Video element */}
      {isAudio ? (
        <>
          {/* Audio player with artwork */}
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
            className="w-full aspect-video object-cover"
            poster={thumbnail}
            style={thumbnail ? { backgroundImage: `url(${thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            onTimeUpdate={() => setCurrentTime(mediaRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setDuration(mediaRef.current?.duration || 0)}
            onEnded={() => setPlaying(false)}
            onClick={(e) => e.stopPropagation()}
          />
          {/* Click overlay for play/pause */}
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
            </div>
          )}
        </>
      )}

      {/* Controls bar */}
      <div
        className={`${isAudio ? "" : "absolute bottom-0 left-0 right-0"} bg-gradient-to-t from-black/90 to-transparent px-4 pb-3 pt-8 transition-opacity duration-300 ${showControls || isAudio ? "opacity-100" : "opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-3 group"
          onClick={seek}
        >
          <div className="h-full bg-primary rounded-full relative" style={{ width: `${pct}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Buttons row */}
        <div className="flex items-center gap-3">
          {/* Skip back */}
          <button onClick={() => skip(-10)} className="text-white/80 hover:text-white transition-colors">
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play/Pause */}
          <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
            {playing ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
          </button>

          {/* Skip forward */}
          <button onClick={() => skip(10)} className="text-white/80 hover:text-white transition-colors">
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Time */}
          <span className="text-white/70 text-xs font-mono">{fmt(currentTime)} / {fmt(duration)}</span>

          <div className="flex-1" />

          {/* Volume */}
          <div className="flex items-center gap-1.5">
            <button onClick={toggleMute} className="text-white/80 hover:text-white transition-colors">
              {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              className="w-16 h-1 accent-primary cursor-pointer"
            />
          </div>

          {/* Speed */}
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

          {/* Download */}
          {!isPremium && (
            <button
              onClick={() => downloadViaProxy(url, title, setDownloading)}
              disabled={downloading}
              className="text-white/80 hover:text-white transition-colors disabled:opacity-50" title={downloading ? "Downloading..." : "Download"}>
              {downloading
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin block" />
                : <Download className="w-4 h-4" />}
            </button>
          )}

          {/* Fullscreen (video only) */}
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

/* ══════════════════════════════════════════
   EMBEDDED PLAYER (YouTube, Vimeo, etc.)
   Hides branding with overlay
══════════════════════════════════════════ */
function EmbeddedPlayer({ embedUrl, title, isPremium, originalUrl }: {
  embedUrl: string; title: string; isPremium?: boolean; originalUrl: string;
}) {
  const [downloading, setDownloading] = useState(false);
  return (
    <div className="relative bg-black">
      {/* Title bar overlay — covers YouTube/Vimeo branding at top */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent px-4 py-2 pointer-events-none">
        <p className="text-white text-sm font-semibold line-clamp-1">{title}</p>
      </div>

      {/* iframe */}
      <div className="aspect-video">
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share"
          allowFullScreen
        />
      </div>

      {/* Download bar below player */}
      {!isPremium && (
        <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
          <span className="text-gray-400 text-xs">Free content</span>
          <button
            onClick={() => downloadViaProxy(originalUrl, title, setDownloading)}
            disabled={downloading}
            className="flex items-center gap-1.5 text-xs text-white bg-primary hover:bg-primary/90 disabled:opacity-50 px-3 py-1.5 rounded transition-colors"
          >
            {downloading
              ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Download className="w-3.5 h-3.5" />}
            {downloading ? 'Downloading...' : 'Download'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN MEDIA PLAYER EXPORT
══════════════════════════════════════════ */
export function MediaPlayer({ url, title, isPremium = false, type, thumbnail }: MediaPlayerProps) {
  if (!url) return null;

  const ytId = getYouTubeId(url);
  const vimeoId = getVimeoId(url);
  const spotifyId = getSpotifyId(url);
  const directVideo = isDirectVideo(url);
  const directAudio = isDirectAudio(url) || type === "podcast" || type === "audio";

  // YouTube
  if (ytId) {
    const embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&color=white`;
    return <EmbeddedPlayer embedUrl={embedUrl} title={title} isPremium={isPremium} originalUrl={url} />;
  }

  // Vimeo
  if (vimeoId) {
    const embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0&badge=0`;
    return <EmbeddedPlayer embedUrl={embedUrl} title={title} isPremium={isPremium} originalUrl={url} />;
  }

  // Spotify
  if (spotifyId) {
    const embedUrl = `https://open.spotify.com/embed/episode/${spotifyId}?utm_source=generator&theme=0`;
    return <EmbeddedPlayer embedUrl={embedUrl} title={title} isPremium={isPremium} originalUrl={url} />;
  }

  // Direct video file
  if (directVideo && type !== "podcast" && type !== "audio") {
    return <CustomPlayer url={url} title={title} isPremium={isPremium} isAudio={false} thumbnail={thumbnail} />;
  }

  // Direct audio / podcast (including when type is explicitly podcast/audio)
  if (directAudio || type === "podcast" || type === "audio") {
    return <CustomPlayer url={url} title={title} isPremium={isPremium} isAudio={true} thumbnail={thumbnail} />;
  }

  // Generic iframe for any other platform (Apple Podcasts, Anchor, Dailymotion, etc.)
  return <EmbeddedPlayer embedUrl={url} title={title} isPremium={isPremium} originalUrl={url} />;
}
