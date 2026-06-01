import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Clock, Eye, Share2, ChevronRight, Tag, ArrowLeft, Play,
  ExternalLink, Pin, Copy, Check, Link2, Star, Flag, Bookmark, BookmarkCheck,
} from "lucide-react";
import { FaXTwitter, FaFacebook, FaWhatsapp, FaTelegram } from "react-icons/fa6";
import { navSections, formatDate, formatTimeAgo } from "@/data/mockData";
import { PostCard } from "@/components/PostCard";
import { SidebarModules } from "@/components/SidebarModules";
import { PremiumGate } from "@/components/PremiumGate";
import { ArticleVideoPlayer } from "@/components/ArticleVideoPlayer";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { idb, STORES } from "@/services/IndexedDBService";

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ARTICLE PAGE
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const ArticlePage = () => {
  const { section, category, id } = useParams();
  const { publishedPosts, incrementView, loading: dataLoading } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [shareCopied, setShareCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Check if article is already bookmarked
  useEffect(() => {
    if (user && id) {
      idb.get(STORES.SAVED_ARTICLES, id).then(saved => {
        if (saved) setBookmarked(true);
      });
    }
  }, [user, id]);

  const post = publishedPosts.find((p: any) => p.id === id);
  const sectionData = navSections.find((s) => s.slug === section);
  const categoryData = sectionData?.categories.find((c) => c.slug === category);

  // Set page title to post title
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Preparedness For War`;
    }
    
    // Reset title when leaving page
    return () => {
      document.title = "Preparedness For War - Latest News & Updates";
    };
  }, [post]);

  useEffect(() => {
    if (!id) return;
    const key = `viewed_${id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    incrementView(id);
  }, [id, incrementView]);

  const handleBookmark = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Sign in to save articles to your bunker", variant: "destructive" });
      return;
    }
    if (!post) return;
    setBookmarking(true);
    try {
      const articleData = {
        id: post.id,
        post_id: post.id,
        post_title: post.title,
        post_url: `/${post.section}/${post.category}/${post.id}`,
        post_image: post.image || null,
        post_section: post.section,
        post_excerpt: post.standfirst || null,
        user_id: user.id,
        saved_at: new Date().toISOString(),
      };
      if (bookmarked) {
        // Remove bookmark
        await idb.removeSavedArticle(post.id);
        if (navigator.onLine) {
          await supabase.from("saved_articles").delete().eq("user_id", user.id).eq("post_id", post.id);
        }
        setBookmarked(false);
        toast({ title: "Removed from bunker" });
      } else {
        // Add bookmark
        await idb.saveArticle(articleData);
        if (navigator.onLine) {
          await supabase.from("saved_articles").upsert({ ...articleData, id: undefined }, { onConflict: "user_id,post_id" });
        }
        setBookmarked(true);
        toast({ title: "Saved to My Bunker", description: "Available offline in your bunker" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setBookmarking(false);
    }
  };

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

  const openShare = (_url: string) => {}; // kept for safety, unused

  if (dataLoading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container py-8">
          <div className="animate-pulse space-y-4 max-w-3xl">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="aspect-[16/9] bg-gray-200 rounded" />
            <div className="space-y-3 pt-4">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

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
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(post.title);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
    } catch {
      // Fallback: use a detached textarea (never appended to DOM)
      try {
        const el = document.createElement("textarea");
        el.value = pageUrl;
        el.style.position = "fixed";
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
        // Append to a safe container outside React's root
        const container = document.getElementById("google_translate_element") || document.documentElement;
        container.appendChild(el);
        el.focus();
        el.select();
        document.execCommand("copy");
        container.removeChild(el);
      } catch {}
    }
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.standfirst || post.title, url: pageUrl });
        return;
      } catch {}
    }
    setShareOpen(o => !o);
  };

  // Share links — using <a> tags so browsers never block them
  const shareLinks = [
    {
      label: "Share on X (Twitter)",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: <FaXTwitter className="w-4 h-4 text-black" />,
      bg: "hover:bg-gray-100",
    },
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <FaFacebook className="w-4 h-4 text-[#1877F2]" />,
      bg: "hover:bg-blue-50",
    },
    {
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(post.title + "\n" + pageUrl)}`,
      icon: <FaWhatsapp className="w-4 h-4 text-[#25D366]" />,
      bg: "hover:bg-green-50",
    },
    {
      label: "Share on Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <FaTelegram className="w-4 h-4 text-[#229ED9]" />,
      bg: "hover:bg-sky-50",
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="container py-8">
        {/* Breadcrumb - Enhanced */}
        <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap bg-white px-4 py-3 border border-gray-200">
          <Link to="/" className="text-blue-900 hover:text-blue-700 font-semibold transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {sectionData && <Link to={`/${section}`} className="text-blue-900 hover:text-blue-700 font-semibold transition-colors">{sectionData.title}</Link>}
          {categoryData && (<><ChevronRight className="w-4 h-4 text-gray-400" /><Link to={`/${section}/${category}`} className="text-blue-900 hover:text-blue-700 font-semibold transition-colors">{categoryData.title}</Link></>)}
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700 font-medium line-clamp-1 max-w-[200px]">{post.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <article className="bg-white border border-gray-200">

            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
                MOBILE LAYOUT (hidden on lg+)
            â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
            <div className="lg:hidden">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1 text-xs px-4 pt-4 pb-2 flex-wrap text-gray-500">
                <Link to="/" className="hover:text-primary">Home</Link>
                <ChevronRight className="w-3 h-3" />
                {sectionData && <Link to={`/${section}`} className="hover:text-primary">{sectionData.title}</Link>}
                {categoryData && (<><ChevronRight className="w-3 h-3" /><span>{categoryData.title}</span></>)}
              </nav>

              {/* Title */}
              <h1 className="font-display font-black text-2xl leading-tight text-gray-900 px-4 pb-3">
                {post.title}
              </h1>

              {/* Full-width image â€” edge to edge */}
              <div className="w-full bg-gray-100 overflow-hidden relative">
                {post.image && (
                  <img src={post.image} alt={post.title} className="w-full object-cover" />
                )}
                {((post as any).videoUrl || (post as any).video_url) && !videoPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer"
                       onClick={() => setVideoPlaying(true)}>
                    <div className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center shadow-2xl">
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                  </div>
                )}
                {((post as any).videoUrl || (post as any).video_url) && videoPlaying && (
                  <div className="aspect-video bg-black">
                    <ArticleVideoPlayer url={(post as any).videoUrl || (post as any).video_url} title={post.title} />
                  </div>
                )}
              </div>

              {/* Author + date */}
              <div className="px-4 pt-3 pb-2 space-y-1">
                <p className="text-sm text-gray-700">
                  By <span className="text-blue-600 font-semibold">{post.author}</span>
                </p>
                <p className="text-xs text-gray-500">
                  <span title={formatDate(post.publishedAt)}>{formatTimeAgo(post.publishedAt)}</span>
                  {post.readTime && <span> · {post.readTime} read</span>}
                </p>
              </div>

              {/* Share / Bookmark / Report bar */}
              <div className="flex items-center gap-3 px-4 py-3 border-t border-b border-gray-200 mb-4">
                <button
                  onClick={handleNativeShare}
                  className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 border border-blue-200 rounded px-3 py-1.5"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button
                  onClick={handleBookmark}
                  disabled={bookmarking}
                  className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 border border-blue-200 rounded px-3 py-1.5"
                >
                  {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  {bookmarked ? "Saved" : "Save"}
                </button>
                <button
                  onClick={() => setReportOpen(true)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 border border-gray-200 rounded px-3 py-1.5 ml-auto"
                >
                  <Flag className="w-4 h-4" /> Report
                </button>
              </div>

              {/* Share panel (mobile) — shown below bar when native share unavailable */}
              {shareOpen && (
                <div className="mx-4 mb-4 bg-white border border-gray-200 shadow-lg rounded overflow-hidden">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Article link</p>
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded">
                      <Link2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-500 truncate flex-1 font-mono">{pageUrl}</span>
                    </div>
                  </div>
                  <div className="p-2 space-y-0.5">
                    <button onClick={copyLink} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold hover:bg-gray-50 text-left rounded">
                      {shareCopied ? <><Check className="w-4 h-4 text-green-600" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy link</>}
                    </button>
                    {shareLinks.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShareOpen(false)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-left rounded ${s.bg}`}
                      >
                        {s.icon} {s.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Standfirst */}
              <p className="px-4 pb-4 text-base font-bold leading-snug text-gray-900">
                {post.standfirst}
              </p>

              {/* Article body */}
              <div className="px-4 pb-6">
                <PremiumGate
                  isPremium={post.isPremium || false}
                  contentType="article"
                  showPreview={true}
                  previewContent={<p className="text-base leading-relaxed text-gray-700">{post.standfirst}</p>}
                >
                  <div className="prose prose-base max-w-none">
                    {post.body ? (
                      <div className="text-base leading-relaxed text-gray-800 space-y-4"
                        dangerouslySetInnerHTML={{ __html: post.body.replace(/\n/g, "<br/>") }} />
                    ) : (
                      <div className="space-y-4 text-base leading-relaxed text-gray-800">
                        <p>{post.standfirst}</p>
                        <p>This article provides comprehensive guidance on <strong>{post.title.toLowerCase()}</strong>. In an era of increasing uncertainty, being prepared is not just advisable â€” it's essential for every household.</p>
                        <h2 className="font-bold text-xl mt-6 mb-3">Key Points</h2>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                          <li>Understanding the current threat landscape and risk assessment</li>
                          <li>Practical steps for immediate implementation in your household</li>
                          <li>Long-term strategies for sustained preparedness</li>
                          <li>Resources and tools for further learning</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </PremiumGate>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 px-4 pb-6 pt-2 border-t border-gray-200">
                  <Tag className="w-4 h-4 text-blue-900" />
                  {post.tags.map((tag: string) => (
                    <Link key={tag} to={`/tag/${encodeURIComponent(tag)}`}
                      className="px-3 py-1 bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200 hover:bg-blue-100 transition-colors">
                      {tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Related on mobile */}
              {relatedPosts.length > 0 && (
                <div className="border-t border-gray-200 px-4 py-6">
                  <h3 className="font-bold text-lg mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedPosts.map((p: any) => (
                      <Link key={p.id} to={`/${p.section}/${p.category}/${p.id}`} className="flex gap-3 group">
                        <div className="w-24 h-16 bg-gray-100 shrink-0 overflow-hidden">
                          {p.image && <img src={p.image} alt={p.title} className="w-full h-full object-cover" />}
                        </div>
                        <h4 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors line-clamp-3">{p.title}</h4>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
                DESKTOP LAYOUT (hidden on mobile)
            â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
            <div className="hidden lg:block">
              {/* Labels */}
              <div className="flex items-center gap-2 mb-4 flex-wrap px-6 pt-6">
                <span className="px-3 py-1.5 bg-blue-900 text-white text-xs font-bold uppercase tracking-wide">
                  {sectionData?.title || section}
                </span>
                {categoryData && <span className="text-sm text-gray-600 font-semibold">{categoryData.title}</span>}
                {post.isPinned && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 text-white text-xs font-bold uppercase tracking-wide">
                    <Pin className="w-3 h-3" /> Featured
                  </span>
                )}
                {post.isPremium && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-800 text-white text-xs font-bold uppercase tracking-wide">
                    <Star className="w-3 h-3 fill-white" /> Premium
                  </span>
                )}
              </div>

              <h1 className="font-display font-black text-3xl md:text-4xl lg:text-5xl leading-tight text-gray-900 px-6">{post.title}</h1>
              <p className="text-lg text-gray-600 mt-4 leading-relaxed border-l-2 border-blue-900 pl-5 bg-blue-50/50 py-3 mx-6">{post.standfirst}</p>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 mt-6 pt-5 border-t border-gray-200 text-sm px-6">
                <span className="font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-900 flex items-center justify-center text-white text-xs font-bold">
                    {post.author.charAt(0)}
                  </div>
                  {post.author}
                </span>
                <span className="flex items-center gap-1.5 text-gray-600"><Clock className="w-4 h-4 text-blue-900" />{post.readTime}</span>
                <span className="text-gray-600" title={formatDate(post.publishedAt)}>{formatTimeAgo(post.publishedAt)}</span>
                <span className="flex items-center gap-1.5 text-gray-600"><Eye className="w-4 h-4 text-blue-900" />{post.viewCount?.toLocaleString()} views</span>

                {/* Share dropdown */}
                <div ref={shareRef} className="ml-auto relative">
                  <button
                    onClick={() => setShareOpen(o => !o)}
                    className={`flex items-center gap-2 text-sm font-bold px-4 py-2 transition-all ${shareOpen ? "bg-blue-900 text-white" : "bg-white border-2 border-blue-900 text-blue-900 hover:bg-blue-50"}`}>
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                  {shareOpen && (
                    <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-gray-200 shadow-xl z-50">
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Article link</p>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2">
                          <Link2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="text-xs text-gray-500 truncate flex-1 font-mono">{pageUrl}</span>
                        </div>
                      </div>
                      <div className="p-2 space-y-0.5">
                        <button
                          onClick={copyLink}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-colors text-left rounded ${shareCopied ? "bg-green-50 text-green-700" : "hover:bg-gray-50"}`}>
                          {shareCopied ? <><Check className="w-4 h-4 text-green-600 shrink-0" /> Copied!</> : <><Copy className="w-4 h-4 shrink-0" /> Copy link</>}
                        </button>
                        {shareLinks.map((s) => (
                          <a
                            key={s.label}
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShareOpen(false)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-colors text-left rounded ${s.bg}`}
                          >
                            {s.icon} {s.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Report button */}
                <button onClick={() => setReportOpen(true)}
                  className="flex items-center gap-2 text-sm font-bold px-4 py-2 bg-white border-2 border-blue-900 text-blue-900 hover:bg-blue-50 transition-all">
                  <Flag className="w-4 h-4" /> Report
                </button>
              </div>

              {/* Hero image */}
              <div className="aspect-[16/9] bg-gray-100 overflow-hidden relative mt-6">
                {post.image && (
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                )}
                {((post as any).videoUrl || (post as any).video_url) && !videoPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer group hover:bg-black/50 transition-colors"
                       onClick={() => setVideoPlaying(true)}>
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-900 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 md:w-12 md:h-12 text-white fill-white ml-1" />
                    </div>
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 fill-white" /> Click to Play Video
                    </div>
                  </div>
                )}
                {((post as any).videoUrl || (post as any).video_url) && videoPlaying && (
                  <div className="absolute inset-0 bg-black">
                    <ArticleVideoPlayer url={(post as any).videoUrl || (post as any).video_url} title={post.title} />
                  </div>
                )}
              </div>

              {/* Article body */}
              <div className="p-6 md:p-8">
                <PremiumGate
                  isPremium={post.isPremium || false}
                  contentType="article"
                  showPreview={true}
                  previewContent={
                    <div className="prose prose-lg max-w-none">
                      <p className="text-lg leading-relaxed text-gray-700">{post.standfirst}</p>
                    </div>
                  }
                >
                  <div className="prose prose-lg max-w-none prose-img:rounded-lg prose-img:shadow-md prose-img:my-6">
                    {post.body ? (
                      <div className="text-lg leading-relaxed text-gray-800 space-y-5"
                        dangerouslySetInnerHTML={{ __html: post.body.replace(/\n/g, "<br/>") }} />
                    ) : (
                      <div className="space-y-6 text-lg leading-relaxed text-gray-800">
                        <p>{post.standfirst} This article provides comprehensive guidance on the topic of <strong>{post.title.toLowerCase()}</strong>. In an era of increasing uncertainty, being prepared is not just advisable â€” it's essential for every household.</p>
                        <h2 className="font-display font-bold text-2xl mt-10 mb-4 text-gray-900 border-l-2 border-blue-900 pl-4 bg-blue-50 py-2">Key Points</h2>
                        <ul className="list-disc pl-6 space-y-3 text-gray-700">
                          <li>Understanding the current threat landscape and risk assessment</li>
                          <li>Practical steps for immediate implementation in your household</li>
                          <li>Long-term strategies for sustained preparedness</li>
                          <li>Resources and tools for further learning and community engagement</li>
                        </ul>
                        <h2 className="font-display font-bold text-2xl mt-10 mb-4 text-gray-900 border-l-2 border-blue-900 pl-4 bg-blue-50 py-2">Why This Matters</h2>
                        <p>Preparedness is a community effort. When individuals and families are equipped with the right knowledge and supplies, entire communities become more resilient.</p>
                        <h2 className="font-display font-bold text-2xl mt-10 mb-4 text-gray-900 border-l-2 border-blue-900 pl-4 bg-blue-50 py-2">Next Steps</h2>
                        <p>Review the related resources in our Library and Encyclopaedia sections. Stay informed through our Just In feed for the latest updates.</p>
                      </div>
                    )}
                  </div>
                </PremiumGate>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3 mt-10 pt-6 border-t border-gray-200">
                    <Tag className="w-5 h-5 text-blue-900" />
                    {post.tags.map((tag: string) => (
                      <Link key={tag} to={`/tag/${encodeURIComponent(tag)}`}
                        className="px-4 py-2 bg-blue-50 text-blue-900 text-sm font-bold border border-blue-900 hover:bg-blue-100 transition-colors cursor-pointer">
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Related Articles â€” desktop */}
              {relatedPosts.length > 0 && (
                <div className="bg-white border-t border-gray-200 p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-0.5 w-12 bg-blue-900"></div>
                    <h3 className="font-display font-bold text-2xl text-gray-900">Related Articles</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {relatedPosts.map((p: any) => <PostCard key={p.id} post={p} />)}
                  </div>
                </div>
              )}
            </div>{/* end desktop layout */}

          </article>

          <div className="hidden lg:block">
            <SidebarModules />
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-md">
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
