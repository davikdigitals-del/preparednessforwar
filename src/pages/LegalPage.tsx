import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FileText } from "lucide-react";

// Map direct URL paths to DB slugs
const pathToSlug: Record<string, string> = {
  privacy: "privacy",
  terms: "terms",
  disclaimer: "disclaimer",
  cookies: "cookies",
  "about-us": "about-us",
  about: "about",
};

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
}

export default function LegalPage() {
  const { page } = useParams<{ page: string }>();
  const { pathname } = useLocation();
  const [pageData, setPageData] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Derive slug from route param or direct path
  const pathSegment = pathname.replace(/^\//, "").split("/")[0];
  const slug = page || pathToSlug[pathSegment] || pathSegment;

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);

    supabase
      .from("pages")
      .select("id, slug, title, content, updated_at")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          setPageData(data as Page);
        }
        setLoading(false);
      });
  }, [slug]);

  // Extract <style> blocks and inject into <head> so CSS works
  useEffect(() => {
    if (!pageData?.content) return;
    const existing = document.querySelector(`style[data-legal-page="${slug}"]`);
    if (existing) existing.remove();

    const styleMatches = [...pageData.content.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
    if (styleMatches.length > 0) {
      const el = document.createElement("style");
      el.setAttribute("data-legal-page", slug);
      el.textContent = styleMatches.map((m) => m[1]).join("\n");
      document.head.appendChild(el);
    }
    return () => {
      document.querySelector(`style[data-legal-page="${slug}"]`)?.remove();
    };
  }, [pageData, slug]);

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

  if (notFound || !pageData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <FileText className="w-12 h-12 text-muted-foreground" />
        <h1 className="text-3xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground">
          This page hasn't been created yet. Create it in the admin panel under Pages Management.
        </p>
        <Link to="/" className="text-primary hover:underline">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container max-w-5xl py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{pageData.title}</h1>
          {pageData.updated_at && (
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated:{" "}
              {new Date(pageData.updated_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>
      <div className="container max-w-5xl py-10">
        <div dangerouslySetInnerHTML={{ __html: getBodyHTML(pageData.content) }} />
      </div>
    </div>
  );
}
