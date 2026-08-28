import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  is_published: boolean;
}

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);

    supabase
      .from("pages")
      .select("id, slug, title, content, is_published")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          setPage(data as Page);
        }
        setLoading(false);
      });
  }, [slug]);

  // Extract <style> blocks and inject into <head> so CSS applies globally
  useEffect(() => {
    if (!page?.content) return;

    if (styleRef.current) {
      styleRef.current.remove();
      styleRef.current = null;
    }

    const styleMatches = [...page.content.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
    if (styleMatches.length > 0) {
      const el = document.createElement("style");
      el.setAttribute("data-dynamic-page", slug || "");
      el.textContent = styleMatches.map((m) => m[1]).join("\n");
      document.head.appendChild(el);
      styleRef.current = el;
    }

    return () => {
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
    };
  }, [page, slug]);

  // Remove <style> tags (already in head) and strip outer html/head/body wrappers
  const getBodyHTML = (content: string) =>
    content
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<\/?html[^>]*>/gi, "")
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")
      .replace(/<\/?body[^>]*>/gi, "")
      .trim();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <h1 className="text-4xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground">
          This page doesn't exist or has been unpublished.
        </p>
        <Link to="/" className="text-primary hover:underline">Return Home</Link>
      </div>
    );
  }

  // Render the uploaded content full-width, no wrapper title or date
  return (
    <div dangerouslySetInnerHTML={{ __html: getBodyHTML(page.content) }} />
  );
}
