import { useState } from "react";
import { navSections, formatTimeAgo } from "@/data/mockData";
import { useData } from "@/contexts/DataContext";
import HeroSection from "@/components/home/HeroSection";
import TrendingBar from "@/components/home/TrendingBar";
import JustInFeed from "@/components/home/JustInFeed";
import ArticleGrid from "@/components/home/ArticleGrid";
import MediaLibrarySection from "@/components/home/MediaLibrarySection";
import { Link } from "react-router-dom";
import {
  ArrowRight, Video, Headphones, TrendingUp, Play,
  BookOpen, Download, Eye, Mail, Clock, Shield,
  ExternalLink, X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { MediaItem } from "@/contexts/DataContext";

/* ── YouTube embed helper (same as MediaHubPage) ── */
function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  if (url.includes("youtube.com/embed/") || url.includes("player.vimeo.com")) return url;
  const ytWatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}?autoplay=1&rel=0`;
  const ytShort = url.match(/youtu\.be\/([\w-]+)/);
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}?autoplay=1&rel=0`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) return url;
  return null;
}

/* ══════════════════════════════════════════════
   SHARED WIDGETS
══════════════════════════════════════════════ */

function SectionHeading({ title, to, label }: { title: string; to: string; label?: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-[3px] h-5 bg-primary" />
        <h2 className="font-display font-black text-base uppercase tracking-wide">{title}</h2>
        {label && (
          <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-black uppercase tracking-widest">
            {label}
          </span>
        )}
      </div>
      <Link to={to} className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline">
        More <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

function WidgetHeader({ title, icon: Icon }: { title: string; icon?: any }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-foreground">
      {Icon && <Icon className="w-3.5 h-3.5 text-primary" />}
      <span className="text-xs font-black uppercase tracking-widest text-white">{title}</span>
    </div>
  );
}

/* ── Video player modal ── */
function VideoModal({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const embedUrl = item.url ? getEmbedUrl(item.url) : null;
  const isDirect = item.url ? /\.(mp4|webm|ogg)(\?|$)/i.test(item.url) : false;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-4 pb-2">
          <DialogTitle className="text-sm font-bold line-clamp-1 pr-8">{item.title}</DialogTitle>
        </DialogHeader>

        {item.url ? (
          embedUrl && !isDirect ? (
            <div className="aspect-video">
              <iframe
                src={embedUrl}
                title={item.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : isDirect ? (
            <video controls autoPlay className="w-full" src={item.url} />
          ) : (
            <div className="aspect-video bg-muted flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Video className="w-12 h-12 opacity-30" />
              <p className="text-sm">Cannot embed this URL directly.</p>
              <a href={item.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary underline">
                <ExternalLink className="w-3 h-3" /> Open in new tab
              </a>
            </div>
          )
        ) : (
          <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground">
            <p className="text-sm">No video URL provided.</p>
          </div>
        )}

        <div className="px-5 py-3 flex items-center justify-between border-t border-border">
          <p className="text-xs text-muted-foreground">{item.author} · {item.duration}</p>
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline">
              <ExternalLink className="w-3 h-3" /> Open externally
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Most Read ── */
function MostReadWidget({ posts }: { posts: any[] }) {
  // Only show posts that actually have views — sort highest first
  const withViews = posts
    .filter((p) => p.viewCount > 0)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);

  const maxViews = withViews[0]?.viewCount || 1;

  return (
    <div className="bg-white border border-border overflow-hidden">
      <WidgetHeader title="Most Read" icon={TrendingUp} />      {withViews.length === 0 ? (
        /* Empty state — no views yet */
        <div className="px-4 py-6 text-center">
          <Eye className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground font-medium">No views recorded yet</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            Articles will appear here as readers visit them
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {withViews.map((post, i) => {
            const barWidth = Math.max(8, Math.round((post.viewCount / maxViews) * 100));
            const sec = navSections.find((s: any) => s.slug === post.section);
            return (
              <Link
                key={post.id}
                to={`/${post.section}/${post.category}/${post.id}`}
                className="flex items-start gap-3 px-4 py-3 hover:bg-primary/5 transition-colors group"
              >
                {/* Rank number */}
                <span className="font-display font-black text-2xl leading-none text-primary/20 group-hover:text-primary/40 transition-colors shrink-0 w-7 pt-0.5">
                  {i + 1}
                </span>

                <div className="min-w-0 flex-1">
                  {/* Section label */}
                  {sec && (
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest block mb-0.5">
                      {sec.title}
                    </span>
                  )}
                  <h4 className="text-xs font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h4>

                  {/* View bar + count */}
                  <div className="mt-2 space-y-1">
                    <div className="h-1 bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary/40 group-hover:bg-primary transition-colors"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                      <Eye className="w-2.5 h-2.5" />
                      <span className="font-semibold text-foreground/70">
                        {post.viewCount.toLocaleString()}
                      </span>
                      views
                      <span className="text-border">·</span>
                      {post.readTime}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Newsletter ── */
function NewsletterWidget() {
  return (
    <div className="bg-primary overflow-hidden relative">
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />
      <div className="relative p-5">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-4 h-4 text-white/80" />
          <h3 className="text-sm font-black uppercase tracking-wide text-white">Stay Informed</h3>
        </div>
        <p className="text-xs text-white/70 mb-4 leading-relaxed">
          Daily preparedness intelligence, straight to your inbox. Free, always.
        </p>
        <div className="space-y-2">
          <Input type="email" placeholder="Your email address"
            className="bg-white/15 border-white/20 text-white placeholder:text-white/40 text-sm h-9" />
          <Button className="w-full bg-white text-primary hover:bg-white/90 font-black text-xs h-9">
            Subscribe Free →
          </Button>
        </div>
        <p className="text-[10px] text-white/40 mt-3 text-center">No spam. Unsubscribe anytime.</p>
      </div>
    </div>
  );
}

/* ── Quick Access ── */
function QuickAccessWidget() {
  const links = [
    { icon: Shield, label: "Emergency Guides", to: "/emergency-news", desc: "Critical alerts & protocols" },
    { icon: BookOpen, label: "Encyclopaedia", to: "/encyclopaedia", desc: "In-depth reference" },
    { icon: Download, label: "Resource Library", to: "/library", desc: "Checklists & downloads" },
    { icon: Video, label: "Media Hub", to: "/media", desc: "Videos & podcasts" },
  ];
  return (
    <div className="bg-white border border-border overflow-hidden">
      <WidgetHeader title="Quick Access" />
      <div className="divide-y divide-border">
        {links.map(({ icon: Icon, label, to, desc }) => (
          <Link key={to} to={to}
            className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors group">
            <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
              <Icon className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold block group-hover:text-primary transition-colors">{label}</span>
              <span className="text-[10px] text-muted-foreground">{desc}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Section block: lead + compact list ── */
function SectionBlock({ section, posts }: { section: any; posts: any[] }) {
  if (posts.length === 0) return null;
  const lead = posts[0];
  const rest = posts.slice(1, 4);
  return (
    <section className="border-b border-border pb-8">
      <SectionHeading title={section.title} to={`/${section.slug}`} />
      <div className="grid grid-cols-1 md:grid-cols-[5fr_3fr] gap-5">
        <Link to={`/${lead.section}/${lead.category}/${lead.id}`}
          className="group block md:border-r md:border-border md:pr-5">
          <div className="aspect-[16/9] bg-muted overflow-hidden">
            {lead.image
              ? <img src={lead.image} alt={lead.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
              : <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <span className="text-primary/20 font-black text-4xl">{section.title[0]}</span>
                </div>
            }
          </div>
          <h3 className="font-bold text-base leading-snug mt-3 line-clamp-3 group-hover:text-primary transition-colors">
            {lead.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{lead.standfirst}</p>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
            <Clock className="w-2.5 h-2.5" />
            <span>{formatTimeAgo(lead.publishedAt)}</span>
            <span className="text-border">·</span>
            <span>{lead.author}</span>
          </div>
        </Link>
        <div className="flex flex-col divide-y divide-border">
          {rest.map((post) => (
            <Link key={post.id} to={`/${post.section}/${post.category}/${post.id}`}
              className="group flex gap-3 py-3 first:pt-0 last:pb-0">
              <div className="w-[72px] h-[52px] bg-muted shrink-0 overflow-hidden">
                {post.image
                  ? <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-primary/10" />
                }
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold leading-snug line-clamp-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h4>
                <span className="text-[10px] text-muted-foreground mt-1 block">{formatTimeAgo(post.publishedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Cross-section strip ── */
function SectionStrip({ posts }: { posts: any[] }) {
  if (posts.length === 0) return null;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border border border-border bg-white">
      {posts.slice(0, 4).map((post) => {
        const sec = navSections.find((s) => s.slug === post.section);
        return (
          <Link key={post.id} to={`/${post.section}/${post.category}/${post.id}`}
            className="group p-4 hover:bg-primary/5 transition-colors">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{sec?.title}</span>
            <h3 className="text-sm font-bold leading-snug mt-1.5 line-clamp-3 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            <span className="text-[10px] text-muted-foreground mt-2 block">{formatTimeAgo(post.publishedAt)}</span>
          </Link>
        );
      })}
    </div>
  );
}

/* ── Video row — playable ── */
function VideoRow({ videos }: { videos: MediaItem[] }) {
  const [playing, setPlaying] = useState<MediaItem | null>(null);
  if (videos.length === 0) return null;

  return (
    <>
      {playing && <VideoModal item={playing} onClose={() => setPlaying(null)} />}
      <section className="border-b border-border pb-8">
        <SectionHeading title="Featured Videos" to="/media" label="Watch" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {videos.map((video) => (
            <button key={video.id} onClick={() => setPlaying(video)} className="group text-left w-full">
              <div className="aspect-video bg-muted overflow-hidden relative">
                {video.thumbnail
                  ? <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                  : <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Video className="w-8 h-8 text-primary/30" />
                    </div>
                }
                {/* Always-visible play button */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 bg-primary group-hover:scale-110 transition-transform flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 text-white ml-0.5 fill-white" />
                  </div>
                </div>
                {video.duration && (
                  <span className="absolute bottom-1.5 right-1.5 text-[9px] bg-black/80 text-white px-1.5 py-0.5 font-semibold">
                    {video.duration}
                  </span>
                )}
              </div>
              <h3 className="text-xs font-semibold mt-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                {video.title}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{video.author}</p>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

/* ── Podcast row ── */
function PodcastRow({ podcasts }: { podcasts: MediaItem[] }) {
  const [playing, setPlaying] = useState<MediaItem | null>(null);
  if (podcasts.length === 0) return null;

  return (
    <>
      {playing && <VideoModal item={playing} onClose={() => setPlaying(null)} />}
      <section className="border-b border-border pb-8">
        <SectionHeading title="Latest Podcasts" to="/media" label="Listen" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {podcasts.map((podcast) => (
            <button key={podcast.id} onClick={() => setPlaying(podcast)}
              className="group flex gap-3 p-3 border border-border hover:border-primary hover:bg-primary/5 transition-all text-left w-full">
              <div className="w-14 h-14 bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                <Headphones className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                  {podcast.title}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1.5">{podcast.author} · {podcast.duration}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

/* ── Empty state placeholder ── */
function EmptyState({ section }: { section: any }) {
  return (
    <section className="border-b border-border pb-8">
      <SectionHeading title={section.title} to={`/${section.slug}`} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[16/9] bg-muted" />
            <div className="mt-3 space-y-2">
              <div className="h-2 bg-muted rounded w-1/4" />
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground mt-4 pb-2">
        No articles published yet —{" "}
        <Link to={`/${section.slug}`} className="text-primary hover:underline">check back soon</Link>
      </p>
    </section>
  );
}

/* ══════════════════════════════════════════════
   INDEX PAGE
══════════════════════════════════════════════ */
const Index = () => {
  const { publishedPosts: dbPosts, mediaItems, libraryItems, loading } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground font-medium">Loading…</span>
        </div>
      </div>
    );
  }

  /* ── Data prep ── */
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

  const sourcePosts = dbPosts;

  const pinnedPost = sourcePosts.find((p: any) => p.isPinned);
  const freshPosts = [...sourcePosts]
    .filter((p: any) => Date.now() - new Date(p.publishedAt).getTime() < TWENTY_FOUR_HOURS)
    .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const featuredPost = pinnedPost || freshPosts[0] || sourcePosts[0];
  const sidebarHeroPosts = sourcePosts
    .filter((p: any) => featuredPost && p.id !== featuredPost.id)
    .slice(0, 6);

  const usedIds = new Set([featuredPost?.id, ...sidebarHeroPosts.map((p: any) => p.id)]);

  const trendingTopics = navSections.slice(0, 8).map((s) => ({ label: s.title, link: `/${s.slug}` }));

  const justInPosts = [...sourcePosts]
    .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 15);

  const mostReadPosts = [...sourcePosts]
    .sort((a: any, b: any) => b.viewCount - a.viewCount)
    .slice(0, 10);

  const featuredVideos = mediaItems.filter((m) => m.type === "video").slice(0, 4);
  const featuredPodcasts = mediaItems.filter((m) => m.type === "podcast").slice(0, 4);

  const stripPosts = navSections.slice(0, 4)
    .map((s) => sourcePosts.find((p: any) => p.section === s.slug && !usedIds.has(p.id)))
    .filter(Boolean) as any[];

  return (
    <div className="bg-white min-h-screen">

      {/* TRENDING BAR */}
      <TrendingBar topics={trendingTopics} />

      {/* HERO */}
      {featuredPost && (
        <HeroSection
          featuredPost={featuredPost}
          sidebarPosts={sidebarHeroPosts}
          allPosts={sourcePosts}
        />
      )}

      {/* VIDEOS — top of feed */}
      {featuredVideos.length > 0 && (
        <div className="container pt-6">
          <VideoRow videos={featuredVideos} />
        </div>
      )}

      {/* CROSS-SECTION STRIP */}
      {stripPosts.length > 0 && (
        <div className="container pt-6">
          <SectionStrip posts={stripPosts} />
        </div>
      )}

      {/* MAIN 2-COLUMN LAYOUT */}
      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

          {/* LEFT */}
          <div className="space-y-6">
            {navSections.slice(0, 4).map((section) => {
              const posts = sourcePosts
                .filter((p: any) => p.section === section.slug && !usedIds.has(p.id))
                .slice(0, 4);
              return posts.length > 0
                ? <SectionBlock key={section.slug} section={section} posts={posts} />
                : <EmptyState key={section.slug} section={section} />;
            })}

            {navSections.slice(4).map((section) => {
              const posts = sourcePosts
                .filter((p: any) => p.section === section.slug && !usedIds.has(p.id))
                .slice(0, 3);
              if (posts.length === 0) return null;
              return (
                <section key={section.slug} className="border-b border-border pb-8">
                  <SectionHeading title={section.title} to={`/${section.slug}`} />
                  <ArticleGrid posts={posts} columns={3} />
                </section>
              );
            })}

            {featuredPodcasts.length > 0 && <PodcastRow podcasts={featuredPodcasts} />}
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-5">
            <JustInFeed posts={justInPosts} />
            <MostReadWidget posts={mostReadPosts} />
            <NewsletterWidget />
            <QuickAccessWidget />
          </aside>
        </div>
      </div>

      {/* DARK MEDIA & LIBRARY STRIP */}
      <MediaLibrarySection mediaItems={mediaItems} libraryItems={libraryItems} />
    </div>
  );
};

export default Index;
