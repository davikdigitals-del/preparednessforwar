import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, PictureInPicture2, Share2, SkipBack, SkipForward, Settings, Captions } from 'lucide-react';

interface ArticleVideoProps {
  url: string;
  title?: string;
}

export function ArticleVideo({ url, title }: ArticleVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isPiPActive, setIsPiPActive] = useState(false);

  // Check if it's a direct video file or needs embedding
  const isDirectVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = e.currentTarget;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const newVolume = parseFloat(e.target.value);

    if (video) {
      video.volume = newVolume;
      setVolume(newVolume);
      setMuted(newVolume === 0);
    }
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setFullscreen(true);
      }).catch(console.error);
    } else {
      document.exitFullscreen().then(() => {
        setFullscreen(false);
      }).catch(console.error);
    }
  };

  const togglePictureInPicture = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.error('Picture-in-Picture error:', error);
    }
  };

  // Handle PiP events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPiP = () => {
      setIsPiPActive(true);
    };

    const handleLeavePiP = () => {
      setIsPiPActive(false);
      // Ensure video is still playing and visible in main player
      if (!video.paused) {
        setPlaying(true);
      }
      // Force re-render to show video back in main container
      setShowControls(true);
    };

    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, []);

  const shareVideo = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Video',
          url: window.location.href
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSettings(false);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (isDirectVideo) {
    // Display direct video files with full controls
    return (
      <div className="my-6 relative group">
        <div
          className="relative bg-black rounded-lg overflow-hidden"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(true)}
        >
          <video
            ref={videoRef}
            className="w-full h-auto max-w-full"
            style={{ maxHeight: '500px' }}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onClick={togglePlay}
          >
            <source src={url} />
            Your browser does not support the video tag.
          </video>

          {/* Video Controls Overlay */}
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>

            {/* Progress Bar */}
            <div
              className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-4 group"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-white rounded-full relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-4">
              {/* Left controls */}
              <button onClick={() => skipTime(-10)} className="text-white hover:text-gray-300 transition-colors">
                <SkipBack className="w-6 h-6" />
              </button>

              <button onClick={togglePlay} className="text-white hover:text-gray-300 transition-colors">
                {playing ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </button>

              <button onClick={() => skipTime(10)} className="text-white hover:text-gray-300 transition-colors">
                <SkipForward className="w-6 h-6" />
              </button>

              {/* Time display */}
              <span className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <div className="flex-1" />

              {/* Right controls */}
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="text-white hover:text-gray-300 transition-colors">
                  {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 accent-white cursor-pointer"
                />
              </div>

              <button className="text-white hover:text-gray-300 transition-colors">
                <Captions className="w-5 h-5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {showSettings && (
                  <div className="absolute bottom-8 right-0 bg-black/90 rounded-lg p-2 min-w-[120px]">
                    <div className="text-white text-sm mb-2">Speed</div>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => changePlaybackRate(rate)}
                        className={`block w-full text-left px-3 py-1 text-sm rounded hover:bg-white/20 transition-colors ${playbackRate === rate ? 'text-blue-400' : 'text-white'}`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={togglePictureInPicture} className={`text-white hover:text-gray-300 transition-colors ${isPiPActive ? 'bg-white/20 rounded p-1' : ''}`}>
                <PictureInPicture2 className="w-5 h-5" />
              </button>

              <button onClick={shareVideo} className="text-white hover:text-gray-300 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>

              <button onClick={toggleFullscreen} className="text-white hover:text-gray-300 transition-colors">
                {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {title && (
          <p className="text-sm text-gray-600 mt-2 text-center italic">
            {title}
          </p>
        )}
      </div>
    );
  }

  // For embedded videos (YouTube, TikTok, etc.), display as simple iframe with overlay controls
  return (
    <div className="my-6">
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
        <iframe
          src={url}
          title={title || 'Video'}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            border: 'none',
            outline: 'none'
          }}
        />

        {/* Overlay controls for embedded videos */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center justify-end gap-3">
            <button onClick={shareVideo} className="text-white hover:text-gray-300 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
              <Maximize className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {title && (
        <p className="text-sm text-gray-600 mt-2 text-center italic">
          {title}
        </p>
      )}
    </div>
  );
}