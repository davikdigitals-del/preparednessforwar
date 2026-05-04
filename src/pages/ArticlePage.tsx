import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Clock, Eye, Share2, ChevronRight, Tag, ArrowLeft, Play,
  ExternalLink, Pin, Copy, Check, Twitter, Facebook, Link2, Star, Flag,
} from "lucide-react";
import { navSections, formatDate, formatTimeAgo } from "@/data/mockData";
import { PostCard } from "@/components/PostCard";
import { SidebarModules } from "@/components/SidebarModules";
import { PremiumGate } from "@/components/PremiumGate";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

/* ── Embed URL resolver ── */
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

/* ── Inline video player ── */
function ArticleVideoPlayer({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  const embedUrl = getEmbedUrl(url);
  const isDirect = /\.(mp4|webm|ogg)(\?|$)/i.test(url);

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="group relative w-full aspect-video bg-foreground flex items-center justify-center overflow-hidden mt-6 hover:opacity-95 transition-opacity">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-foreground/80" />
        <div className="relative flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-primary flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 text-white ml-1 fill-white" />
          </div>
          <span className="text-white text-sm font-semibold">Watch Video</span>
        </div>
        <span className="absolute bottom-3 right-3 text-[10px] text-white/60 bg-black/40 px-2 py-0.5">Click to play</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0">
          <DialogHeader className="px-5 pt-4 pb-3 border-b border-border">
            <DialogTitle className="text-sm font-bold line-clamp-1 pr-8">{title}</DialogTitle>
          </DialogHeader>
          {embedUrl && !isDirect ? (
            <div className="aspect-video">
              <iframe src={embedUrl} title={title} className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          ) : isDirect ? (
            <video controls autoPlay className="w-full max-h-[60vh] bg-black" src={url} />
          ) : (
            <div className="aspect-video bg-muted flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <p className="text-sm">Cannot embed this URL.</p>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Open externally
              </a>
            </div>
          )}
          <div className="px-5 py-3 border-t border-border flex justify-end">
            {url && <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline"><ExternalLink className="w-3 h-3" /> Open externally</a>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ══════════════════════════════════════════════
   ARTICLE PAGE
══════════════════════════════════════════════ */
const ArticlePage = () => {
  const { section, category, id } = useParams();
  const { publishedPosts, incrementView } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [shareCopied, setShareCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const post = publishedPosts.find((p: any) => p.id === id);
  const sectionData = navSections.find((s) => s.slug === section);
  const categoryData = sectionData?.categories.find((c) => c.slug === category);

  useEffect(() => {
    if (!id) return;
    const key = `viewed_${id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    incrementView(id);
  }, [id, incrementView]);

  const handleReport = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to report content.",
        variant: "destructive",
      });
      return;
    }

    if (!reportReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for reporting this post.",
        variant: "destructive",
      });
      return;
    }

    setReportSubmitting(true);

    try {
      const { error } = await supabase.from("reports").insert({
        type: "post",
        reason: "Reported post: " + post?.title,
        description: reportReason,
        reported_item_id: id,
        reported_by: user.id,
        status: "pending",
        priority: "medium",
      });

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Thank you for reporting. Our team will review this content.",
      });

      setReportOpen(false);
      setReportReason("");
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setReportSubmitting(false);
    }
  };

  if (!post) {
    return (
      <div className="container py-16 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="font-display font-bold text-3xl mb-3">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">This article may have been removed or the link is incorrect.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const relatedPosts = publishedPosts.filter((p: any) => p.id !== post.id && p.section === post.section).slice(0, 3);
  const pageUrl = window.location.href;

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(pageUrl); } catch { /* fallback */ }
    setShareCopied(true);
    setTimeout(() => { setShareCopied(false); setShareOpen(false); }, 2000);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          {sectionData && <Link to={`/${section}`} className="hover:text-foreground transition-colors">{sectionData.title}</Link>}
          {categoryData && (<><ChevronRight className="w-3 h-3" /><Link to={`/${section}/${category}`} className="hover:text-foreground transition-colors">{categoryData.title}</Link></>)}
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground line-clamp-1 max-w-[200px]">{post.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <article className="bg-white border border-border p-6 md:p-8">
            {/* Labels */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="px-2.5 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest">
                {sectionData?.title || section}
              </span>
              {categoryData && <span className="text-xs text-muted-foreground">{categoryData.title}</span>}
              {post.isPinned && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest">
                  <Pin className="w-2.5 h-2.5" /> Featured
                </span>
              )}
              {post.isPremium && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-[10px] font-black uppercase tracking-widest">
                  <Star className="w-2.5 h-2.5 fill-white" /> Premium
                </span>
              )}
            </div>

            <h1 className="font-display font-black text-2xl md:text-3xl lg:text-4xl leading-tight">{post.title}</h1>
            <p className="text-base text-muted-foreground mt-3 leading-relaxed border-l-4 border-primary pl-4">{post.standfirst}</p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mt-5 py-4 border-y border-border text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{post.author}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
              <span>Published {formatDate(post.publishedAt)}</span>
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{post.viewCount?.toLocaleString()} views</span>

              {/* Share dropdown */}
              <div ref={shareRef} className="ml-auto relative">
                <button onClick={() => setShareOpen(o => !o)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border transition-colors ${shareOpen ? "border-primary text-primary bg-primary/5" : "border-border hover:border-primary hover:text-primary"}`}>
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
                {shareOpen && (
                  <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-border shadow-xl z-50 animate-slide-down">
                    <div className="p-3 border-b border-border">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Article link</p>
                      <div className="flex items-center gap-2 bg-muted px-3 py-2">
                        <Link2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground truncate flex-1 font-mono">{pageUrl}</span>
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      <button onClick={copyLink}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-colors text-left ${shareCopied ? "bg-green-50 text-green-700" : "hover:bg-primary/5 hover:text-primary"}`}>
                        {shareCopied ? <><Check className="w-4 h-4 text-green-600 shrink-0" /> Copied!</> : <><Copy className="w-4 h-4 shrink-0" /> Copy link</>}
                      </button>
                      <button onClick={() => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(pageUrl)}`, "_blank", "noopener"); setShareOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold hover:bg-primary/5 hover:text-primary transition-colors text-left">
                        <Twitter className="w-4 h-4 shrink-0" /> Share on X (Twitter)
                      </button>
                      <button onClick={() => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, "_blank", "noopener"); setShareOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold hover:bg-primary/5 hover:text-primary transition-colors text-left">
                        <Facebook className="w-4 h-4 shrink-0" /> Share on Facebook
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Report button */}
              <button onClick={() => setReportOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-border hover:border-red-500 hover:text-red-600 transition-colors">
                <Flag className="w-3.5 h-3.5" /> Report
              </button>
            </div>

            {/* Hero image */}
            {post.image && (
              <div className="aspect-[16/9] bg-muted mt-6 overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Video player */}
            {(post as any).videoUrl && <ArticleVideoPlayer url={(post as any).videoUrl} title={post.title} />}

            {/* Premium gate OR body */}
            <PremiumGate
              isPremium={post.isPremium || false}
              contentType="article"
              showPreview={true}
              previewContent={
                <div className="prose prose-sm max-w-none">
                  <p className="text-base leading-relaxed">{post.standfirst}</p>
                  <p className="text-base leading-relaxed mt-4">
                    This article provides comprehensive guidance on {post.title.toLowerCase()}...
                  </p>
                </div>
              }
            >
              <div className="mt-8 prose prose-sm max-w-none">
                {post.body ? (
                  <div className="text-base leading-relaxed text-foreground space-y-4"
                    dangerouslySetInnerHTML={{ __html: post.body.replace(/\n/g, "<br/>") }} />
                ) : (
                  <div className="space-y-4 text-base leading-relaxed">
                    <p>{post.standfirst} This article provides comprehensive guidance on the topic of <strong>{post.title.toLowerCase()}</strong>. In an era of increasing uncertainty, being prepared is not just advisable — it's essential for every household.</p>
                    <h2 className="font-display font-bold text-xl mt-8 mb-3">Key Points</h2>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Understanding the current threat landscape and risk assessment</li>
                      <li>Practical steps for immediate implementation in your household</li>
                      <li>Long-term strategies for sustained preparedness</li>
                      <li>Resources and tools for further learning and community engagement</li>
                    </ul>
                    <h2 className="font-display font-bold text-xl mt-8 mb-3">Why This Matters</h2>
                    <p>Preparedness is a community effort. When individuals and families are equipped with the right knowledge and supplies, entire communities become more resilient.</p>
                    <h2 className="font-display font-bold text-xl mt-8 mb-3">Next Steps</h2>
                    <p>Review the related resources in our Library and Encyclopaedia sections. Stay informed through our Just In feed for the latest updates.</p>
                  </div>
                )}
              </div>
            </PremiumGate>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-border">
                <Tag className="w-4 h-4 text-muted-foreground" />
                {post.tags.map((tag: string) => (
                  <span key={tag} className="px-2.5 py-0.5 bg-muted text-muted-foreground text-xs font-semibold">{tag}</span>
                ))}
              </div>
            )}

            {/* Related */}
            {relatedPosts.length > 0 && (
              <div className="mt-10 pt-8 border-t border-border">
                <h3 className="font-display font-bold text-xl mb-5">Related Articles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {relatedPosts.map((p: any) => <PostCard key={p.id} post={p} />)}
                </div>
              </div>
            )}
          </article>

          <div className="hidden lg:block">
            <SidebarModules />
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-600" />
              Report Post
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Help us maintain quality content. Please explain why you're reporting this post.
            </p>
            <div>
              <Label htmlFor="report-reason" className="text-sm font-semibold">
                Reason for Report
              </Label>
              <Textarea
                id="report-reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Describe the issue (e.g., inappropriate content, factual errors, spam, etc.)"
                rows={4}
                className="mt-2"
              />
            </div>
            <div className="bg-muted/50 border border-border rounded p-3">
              <p className="text-xs text-muted-foreground">
                <strong>Reporting:</strong> {post?.title}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleReport}
                disabled={reportSubmitting || !reportReason.trim()}
                className="flex-1"
                variant="destructive"
              >
                {reportSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
              <Button
                onClick={() => {
                  setReportOpen(false);
                  setReportReason("");
                }}
                variant="outline"
                disabled={reportSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArticlePage;
