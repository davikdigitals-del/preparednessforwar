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

  // Helper functions to convert URLs to embed formats
  const getYouTubeEmbedUrl = (url: string): string | null => {
    // Handle YouTube share links: https://youtu.be/VIDEO_ID
    if (url.includes('youtu.be/')) {
      const shareRegex = /youtu\.be\/([a-zA-Z0-9_-]{11})/;
      const match = url.match(shareRegex);
      if (match) {
        const videoId = match[1];
        return `https://www.youtube.com/embed/${videoId}?rel=0`;
      }
    }

    // Handle regular YouTube URLs
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    if (match) {
      const videoId = match[1];
      return `https://www.youtube.com/embed/${videoId}?rel=0`;
    }
    return null;
  };

  const getVimeoEmbedUrl = (url: string): string | null => {
    const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/;
    const match = url.match(vimeoRegex);
    if (match) {
      const videoId = match[1];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return null;
  };

  const getTikTokEmbedUrl = (url: string): string | null => {
    if (url.includes('tiktok.com')) {
      // Handle TikTok share links: https://vm.tiktok.com/...
      if (url.includes('vm.tiktok.com') || url.includes('tiktok.com/t/')) {
        // For share links, we need to get the actual video URL first
        // For now, try to extract any video ID pattern
        const shareRegex = /(?:vm\.tiktok\.com\/|tiktok\.com\/t\/)([a-zA-Z0-9]+)/;
        const match = url.match(shareRegex);
        if (match) {
          // Share links need to be resolved to full URLs first
          return `https://www.tiktok.com/embed/v2/${match[1]}`;
        }
      }

      // Handle regular TikTok URLs
      const tiktokRegex = /tiktok\.com\/@[^\/]+\/video\/(\d+)/;
      const match = url.match(tiktokRegex);
      if (match) {
        const videoId = match[1];
        return `https://www.tiktok.com/embed/v2/${videoId}`;
      }
    }
    return null;
  };

  const getTwitterEmbedUrl = (url: string): string | null => {
    if (url.includes('twitter.com') || url.includes('x.com')) {
      // Handle Twitter share links and regular links
      const tweetRegex = /(?:twitter\.com|x\.com)\/[^\/]+\/status\/(\d+)/;
      const match = url.match(tweetRegex);
      if (match) {
        const tweetId = match[1];
        return `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`;
      }
    }
    return null;
  };

  const getDailymotionEmbedUrl = (url: string): string | null => {
    if (url.includes('dailymotion.com')) {
      const dailymotionRegex = /dailymotion\.com\/video\/([a-zA-Z0-9]+)/;
      const match = url.match(dailymotionRegex);
      if (match) {
        const videoId = match[1];
        return `https://www.dailymotion.com/embed/video/${videoId}`;
      }
    }
    return null;
  };

  const getTwitchEmbedUrl = (url: string): string | null => {
    if (url.includes('twitch.tv')) {
      const twitchRegex = /twitch\.tv\/videos\/(\d+)|twitch\.tv\/([^\/]+)\/clip\/([a-zA-Z0-9-_]+)/;
      const match = url.match(twitchRegex);
      if (match) {
        if (match[1]) { // Video
          const videoId = match[1];
          return `https://player.twitch.tv/?video=${videoId}&parent=${window.location.hostname}`;
        } else if (match[2] && match[3]) { // Clip
          const clipSlug = match[3];
          return `https://clips.twitch.tv/embed?clip=${clipSlug}&parent=${window.location.hostname}`;
        }
      }
    }
    return null;
  };

  const getFacebookEmbedUrl = (url: string): string | null => {
    if (url.includes('facebook.com') || url.includes('fb.watch')) {
      // Handle Facebook share links (fb.watch/...)
      if (url.includes('fb.watch/')) {
        const shareRegex = /fb\.watch\/([a-zA-Z0-9_-]+)/;
        const match = url.match(shareRegex);
        if (match) {
          const videoId = match[1];
          const fullUrl = `https://www.facebook.com/watch/?v=${videoId}`;
          const encodedUrl = encodeURIComponent(fullUrl);
          return `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=734&height=411&appId`;
        }
      }

      // Handle regular Facebook video URLs
      if (url.includes('/videos/') || url.includes('/watch/')) {
        const encodedUrl = encodeURIComponent(url);
        return `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=734&height=411&appId`;
      }
    }
    return null;
  };

  const getInstagramEmbedUrl = (url: string): string | null => {
    if (url.includes('instagram.com')) {
      // Handle Instagram share links (instagram.com/p/... or instagram.com/reel/...)
      if (url.includes('/p/') || url.includes('/reel/')) {
        // Remove any query parameters from share links
        const cleanUrl = url.split('?')[0];
        return `${cleanUrl}embed/`;
      }
    }
    return null;
  };

  // News platforms that might have embed support
  const getNewsEmbedUrl = (url: string): string | null => {
    // Sky News embeds - handle both regular and share links
    if (url.includes('news.sky.com') || url.includes('sky.com/share/')) {
      // Handle Sky News share links
      if (url.includes('sky.com/share/')) {
        const shareRegex = /sky\.com\/share\/(\d+)/;
        const match = url.match(shareRegex);
        if (match) {
          const storyId = match[1];
          return `https://www.skynews.com/embed/video/${storyId}`;
        }
      }

      // Sky News story URLs: https://news.sky.com/story/title-12345678
      const skyRegex = /news\.sky\.com\/story\/[^\/]+-(\d+)/;
      const match = url.match(skyRegex);
      if (match) {
        const storyId = match[1];
        return `https://www.skynews.com/embed/video/${storyId}`;
      }

      // Sky News video URLs: https://news.sky.com/video/title-12345678
      const skyVideoRegex = /news\.sky\.com\/video\/[^\/]+-(\d+)/;
      const videoMatch = url.match(skyVideoRegex);
      if (videoMatch) {
        const videoId = videoMatch[1];
        return `https://www.skynews.com/embed/video/${videoId}`;
      }
    }

    // CNN embeds
    if (url.includes('cnn.com') && url.includes('/videos/')) {
      return url.replace('/videos/', '/embed/videos/');
    }

    // BBC iPlayer embeds (UK only typically)
    if (url.includes('bbc.co.uk/iplayer')) {
      const episodeRegex = /iplayer\/episode\/([a-zA-Z0-9]+)/;
      const match = url.match(episodeRegex);
      if (match) {
        return `https://www.bbc.co.uk/iplayer/embed/${match[1]}`;
      }
    }

    // Reuters video embeds
    if (url.includes('reuters.com') && url.includes('/video/')) {
      return url.replace('reuters.com/video/', 'reuters.com/video/embed/');
    }

    return null;
  };

  // Check what type of URL we're dealing with
  const youtubeEmbed = getYouTubeEmbedUrl(url);
  const vimeoEmbed = getVimeoEmbedUrl(url);
  const tiktokEmbed = getTikTokEmbedUrl(url);
  const twitterEmbed = getTwitterEmbedUrl(url);
  const dailymotionEmbed = getDailymotionEmbedUrl(url);
  const twitchEmbed = getTwitchEmbedUrl(url);
  const facebookEmbed = getFacebookEmbedUrl(url);
  const instagramEmbed = getInstagramEmbedUrl(url);
  const newsEmbed = getNewsEmbedUrl(url);

  const embedUrl = youtubeEmbed || vimeoEmbed || tiktokEmbed || twitterEmbed || dailymotionEmbed || twitchEmbed || facebookEmbed || instagramEmbed || newsEmbed;

  // Check if it's a direct video file
  const isDirectVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);

  // Check if it's an embeddable platform
  const isEmbeddableVideo = embedUrl !== null;

  // Check if it's a non-embeddable external URL (reduced to only truly non-embeddable platforms)
  const isExternalVideo = !isDirectVideo && !isEmbeddableVideo && (
    url.includes('bbc') ||
    (url.includes('news') && !url.includes('cnn') && !url.includes('reuters') && !url.includes('sky'))
  );

  // Check if it's an incomplete or invalid URL
  const isIncompleteUrl = url.includes('/share') || url.endsWith('/share') || url.length < 10;

  // For embeddable videos (YouTube, Vimeo, TikTok, Twitter, CNN, Reuters, etc.)
  if (isEmbeddableVideo && embedUrl) {
    const getPlatformName = () => {
      if (youtubeEmbed) return 'YouTube';
      if (vimeoEmbed) return 'Vimeo';
      if (tiktokEmbed) return 'TikTok';
      if (twitterEmbed) return 'Twitter/X';
      if (dailymotionEmbed) return 'Dailymotion';
      if (twitchEmbed) return 'Twitch';
      if (facebookEmbed) return 'Facebook';
      if (instagramEmbed) return 'Instagram';
      if (newsEmbed) {
        if (url.includes('sky')) return 'Sky News';
        if (url.includes('cnn')) return 'CNN';
        if (url.includes('reuters')) return 'Reuters';
        if (url.includes('bbc')) return 'BBC';
        return 'News Video';
      }
      return 'Video';
    };

    return (
      <div className="my-6">
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
          <iframe
            src={embedUrl}
            title={title || `${getPlatformName()} Video`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{
              border: 'none',
              outline: 'none'
            }}
          />

          {/* Platform badge */}
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/70 text-white text-xs font-bold uppercase tracking-wide rounded">
            {getPlatformName()}
          </div>

          {/* Overlay controls for embedded videos */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: title || `${getPlatformName()} Video`,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="text-white hover:text-gray-300 transition-colors"
              >
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

  // For external videos that can't be embedded, show a link preview
  if (isExternalVideo) {
    // Detect specific news sources for better branding
    const isSkynews = url.includes('sky');
    const isBBC = url.includes('bbc');
    const isCNN = url.includes('cnn');

    return (
      <div className="my-6">
        <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden border border-gray-700">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Play className="w-8 h-8 text-primary fill-primary" />
            </div>
            <h3 className="text-lg font-bold text-center mb-2 line-clamp-2">
              {title || 'External Video'}
            </h3>
            {isIncompleteUrl ? (
              <div className="text-center">
                <p className="text-sm text-red-400 mb-2">⚠️ Incomplete URL</p>
                <p className="text-xs text-gray-400 mb-4">
                  Sky News URLs should be full story links like:<br />
                  https://news.sky.com/story/title-12345
                </p>
              </div>
            ) : (
              <div className="text-center mb-6">
                <p className="text-sm text-gray-400 mb-2">
                  {isSkynews ? '🏛️ Sky News' : isBBC ? '🏛️ BBC News' : isCNN ? '📺 CNN' :
                    (() => {
                      try {
                        return new URL(url).hostname;
                      } catch {
                        return url.length > 50 ? url.substring(0, 50) + '...' : url;
                      }
                    })()}
                </p>
                <p className="text-xs text-gray-500">
                  {isSkynews || isBBC ? 'Opens on news website - videos cannot be embedded due to licensing' :
                    'External video link'}
                </p>
              </div>
            )}
            <a
              href={isIncompleteUrl ? '#' : url}
              target={isIncompleteUrl ? '_self' : '_blank'}
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${isIncompleteUrl
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : isSkynews ? 'bg-blue-600 hover:bg-blue-500 text-white' :
                  isBBC ? 'bg-red-600 hover:bg-red-500 text-white' :
                    'bg-primary hover:bg-primary/90 text-white'
                }`}
              onClick={isIncompleteUrl ? (e) => e.preventDefault() : undefined}
            >
              <Play className="w-5 h-5 fill-current" />
              {isIncompleteUrl ? 'Invalid URL' :
                isSkynews ? 'Watch on Sky News' :
                  isBBC ? 'Watch on BBC' :
                    'Watch Video'}
            </a>
            <p className="text-xs text-gray-500 mt-3 text-center">
              {isIncompleteUrl
                ? 'Please provide a complete news story URL'
                : 'Opens in new tab - videos cannot be embedded due to copyright restrictions'}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
    const video = videoRef.current;
    if (!container || !video) return;

    // Check if we're on mobile
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!document.fullscreenElement) {
      // Enter fullscreen
      const enterFullscreen = () => {
        setFullscreen(true);

        // Try to rotate to landscape on mobile
        if (isMobile && screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape-primary').catch(() => {
            // Fallback to any landscape orientation if primary fails
            screen.orientation.lock('landscape').catch(() => {
              console.log('Screen rotation not supported or denied');
            });
          });
        }
      };

      // Try different fullscreen methods for better mobile compatibility
      if (container.requestFullscreen) {
        container.requestFullscreen().then(enterFullscreen).catch(console.error);
      } else if ((container as any).webkitRequestFullscreen) {
        // Safari
        (container as any).webkitRequestFullscreen();
        enterFullscreen();
      } else if ((container as any).mozRequestFullScreen) {
        // Firefox
        (container as any).mozRequestFullScreen();
        enterFullscreen();
      } else if ((container as any).msRequestFullscreen) {
        // Edge/IE
        (container as any).msRequestFullscreen();
        enterFullscreen();
      } else if (isMobile && (video as any).webkitEnterFullscreen) {
        // iOS Safari fallback - use video's native fullscreen
        (video as any).webkitEnterFullscreen();
        enterFullscreen();
      } else {
        // Fallback: just rotate to landscape without fullscreen
        if (isMobile && screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape').catch(() => {
            console.log('Screen rotation not supported');
          });
        }
        setFullscreen(true);
      }
    } else {
      // Exit fullscreen
      const exitFullscreen = () => {
        setFullscreen(false);

        // Unlock screen orientation when exiting fullscreen
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
      };

      if (document.exitFullscreen) {
        document.exitFullscreen().then(exitFullscreen).catch(console.error);
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
        exitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
        exitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
        exitFullscreen();
      } else {
        exitFullscreen();
      }
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

  // Handle orientation and fullscreen changes
  useEffect(() => {
    const handleOrientationChange = () => {
      // If user manually rotates to landscape, consider going fullscreen
      if (screen.orientation) {
        const isLandscape = screen.orientation.angle === 90 || screen.orientation.angle === -90;

        if (isLandscape && !document.fullscreenElement && playing) {
          // Auto-suggest fullscreen when rotated to landscape during playback
          // This could be enhanced with a toast notification
          console.log('Landscape detected - consider fullscreen');
        }
      }
    };

    const handleFullscreenChange = () => {
      // Update fullscreen state when user exits via browser controls or gesture
      setFullscreen(!!document.fullscreenElement);

      // Unlock orientation when exiting fullscreen via browser/gesture
      if (!document.fullscreenElement && screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    };

    // Listen for orientation changes
    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange);
    }

    // Listen for fullscreen changes (browser controls, gestures, etc.)
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', handleOrientationChange);
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [playing]);

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
            <div className="flex items-center gap-2 md:gap-4 flex-wrap">
              {/* Left controls */}
              <button onClick={() => skipTime(-10)} className="text-white hover:text-gray-300 transition-colors">
                <SkipBack className="w-4 h-4 md:w-6 md:h-6" />
              </button>

              <button onClick={togglePlay} className="text-white hover:text-gray-300 transition-colors">
                {playing ? <Pause className="w-6 h-6 md:w-8 md:h-8" /> : <Play className="w-6 h-6 md:w-8 md:h-8" />}
              </button>

              <button onClick={() => skipTime(10)} className="text-white hover:text-gray-300 transition-colors">
                <SkipForward className="w-4 h-4 md:w-6 md:h-6" />
              </button>

              {/* Time display */}
              <span className="text-white text-xs md:text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <div className="flex-1" />

              {/* Right controls */}
              <div className="flex items-center gap-1 md:gap-2">
                <button onClick={toggleMute} className="text-white hover:text-gray-300 transition-colors">
                  {muted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
                </button>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-12 md:w-20 h-1 accent-white cursor-pointer"
                />
              </div>

              <button className="text-white hover:text-gray-300 transition-colors hidden md:block">
                <Captions className="w-5 h-5" />
              </button>

              <div className="relative hidden md:block">
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
                <PictureInPicture2 className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              <button onClick={shareVideo} className="text-white hover:text-gray-300 transition-colors">
                <Share2 className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              <button onClick={toggleFullscreen} className="text-white hover:text-gray-300 transition-colors">
                {fullscreen ? <Minimize className="w-4 h-4 md:w-5 md:h-5" /> : <Maximize className="w-4 h-4 md:w-5 md:h-5" />}
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