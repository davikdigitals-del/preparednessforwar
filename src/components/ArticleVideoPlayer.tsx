interface ArticleVideoPlayerProps {
  url: string;
  title: string;
}

export function ArticleVideoPlayer({ url, title }: ArticleVideoPlayerProps) {
  if (!url) return null;

  // Check if it's a YouTube URL
  const getYouTubeId = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^#&?\/]{11})/,
      /youtube\.com\/shorts\/([^#&?\/]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Check if it's a Vimeo URL
  const getVimeoId = (url: string) => {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
  };

  // Check if it's a Dailymotion URL
  const getDailymotionId = (url: string) => {
    const match = url.match(/dailymotion\.com\/video\/([^_]+)/);
    return match ? match[1] : null;
  };

  // Check if it's a Twitch URL
  const getTwitchId = (url: string) => {
    const match = url.match(/twitch\.tv\/videos\/(\d+)/);
    return match ? match[1] : null;
  };

  // Check if it's a direct video file
  const isDirectVideo = (url: string) => {
    return /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(url);
  };

  // Check if it's a direct audio file (podcast)
  const isDirectAudio = (url: string) => {
    return /\.(mp3|wav|ogg|m4a|aac|flac)(\?|$)/i.test(url);
  };

  // Check if it's a Spotify podcast
  const getSpotifyEpisodeId = (url: string) => {
    const match = url.match(/spotify\.com\/episode\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  // Check if it's an Apple Podcast
  const isApplePodcast = (url: string) => {
    return url.includes('podcasts.apple.com');
  };

  // Check if it's an Anchor.fm podcast
  const isAnchorPodcast = (url: string) => {
    return url.includes('anchor.fm');
  };

  const youtubeId = getYouTubeId(url);
  const vimeoId = getVimeoId(url);
  const dailymotionId = getDailymotionId(url);
  const twitchId = getTwitchId(url);
  const spotifyEpisodeId = getSpotifyEpisodeId(url);

  // YouTube
  if (youtubeId) {
    return (
      <div className="relative w-full h-full">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  // Vimeo
  if (vimeoId) {
    return (
      <div className="relative w-full h-full">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  // Dailymotion
  if (dailymotionId) {
    return (
      <div className="relative w-full h-full">
        <iframe
          src={`https://www.dailymotion.com/embed/video/${dailymotionId}`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  // Twitch
  if (twitchId) {
    return (
      <div className="relative w-full h-full">
        <iframe
          src={`https://player.twitch.tv/?video=${twitchId}&parent=${window.location.hostname}`}
          title={title}
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  // Spotify Podcast
  if (spotifyEpisodeId) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
        <div className="w-full max-w-2xl" style={{ height: '232px' }}>
          <iframe
            src={`https://open.spotify.com/embed/episode/${spotifyEpisodeId}`}
            title={title}
            allow="encrypted-media"
            className="w-full h-full"
          />
        </div>
      </div>
    );
  }

  // Apple Podcast (iframe embed)
  if (isApplePodcast(url)) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
        <div className="w-full max-w-2xl" style={{ height: '175px' }}>
          <iframe
            src={url}
            title={title}
            allow="encrypted-media"
            sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
            className="w-full h-full"
          />
        </div>
      </div>
    );
  }

  // Anchor.fm Podcast
  if (isAnchorPodcast(url)) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
        <div className="w-full max-w-2xl" style={{ height: '102px' }}>
          <iframe
            src={url}
            title={title}
            allow="encrypted-media"
            className="w-full h-full"
          />
        </div>
      </div>
    );
  }

  // Direct audio file (podcast MP3, etc.)
  if (isDirectAudio(url)) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-900 p-6">
        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Podcast Audio</p>
              <p className="text-gray-400 text-xs">{title}</p>
            </div>
          </div>
          <audio
            controls
            className="w-full"
            preload="metadata"
            style={{ filter: 'invert(1) hue-rotate(180deg)' }}
          >
            <source src={url} type="audio/mpeg" />
            <source src={url} type="audio/ogg" />
            <source src={url} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    );
  }

  // Direct video file
  if (isDirectVideo(url)) {
    return (
      <div className="relative w-full h-full">
        <video
          controls
          className="w-full h-full"
          preload="metadata"
        >
          <source src={url} type="video/mp4" />
          <source src={url} type="video/webm" />
          <source src={url} type="video/ogg" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Generic iframe for any other URL (works with most video/podcast platforms)
  if (url.startsWith('http')) {
    return (
      <div className="relative w-full h-full">
        <iframe
          src={url}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  return null;
}
