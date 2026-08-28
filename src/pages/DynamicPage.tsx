import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  updated_at: string;
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
      .select("*")
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

  // Extract <style> blocks from content and inject into <head>
  // so inline CSS actually applies even inside a React-rendered div
  useEffect(() => {
    if (!page?.content) return;

    // Remove any previously injected style
    if (styleRef.current) {
      styleRef.current.remove();
      styleRef.current = null;
    }

    const styleMatches = [...page.content.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
    if (styleMatches.length > 0) {
      const combinedCSS = styleMatches.map((m) => m[1]).join("\n");
      const el = document.createElement("style");
      el.setAttribute("data-dynamic-page", slug || "");
      el.textContent = combinedCSS;
      document.head.appendChild(el);
      styleRef.current = el;
    }

    // Cleanup when leaving the page
    return () => {
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
    };
  }, [page, slug]);

  // Strip <style> tags from the rendered HTML (already injected into head above)
  const getBodyHTML = (content: string) =>
    content
      // Remove <style> blocks (injected into head)
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      // Remove <html>, <head>, <body> wrapper tags if a full page was pasted
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
          The page you're looking for doesn't exist or has been unpublished.
        </p>
        <Link to="/" className="text-primary hover:underline">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b bg-card">
        <div className="container max-w-5xl py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{page.title}</h1>
          {page.updated_at && (
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated:{" "}
              {new Date(page.updated_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>

      {/* Page content — renders HTML + CSS exactly as pasted, no overrides */}
      <div className="container max-w-5xl py-10">
        <div dangerouslySetInnerHTML={{ __html: getBodyHTML(page.content) }} />
      </div>
    </div>
  );
}
