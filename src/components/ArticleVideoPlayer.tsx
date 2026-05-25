import { MediaPlayer } from "./MediaPlayer";

interface ArticleVideoPlayerProps {
  url: string;
  title: string;
  isPremium?: boolean;
  thumbnail?: string;
}

export function ArticleVideoPlayer({ url, title, isPremium, thumbnail }: ArticleVideoPlayerProps) {
  return <MediaPlayer url={url} title={title} isPremium={isPremium} thumbnail={thumbnail} />;
}
