import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, FileText, Video, BookOpen, Clock, ArrowRight } from "lucide-react";
import { useData } from "@/contexts/DataContext";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "post" | "media" | "library";
  href: string;
  section?: string;
  category?: string;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { publishedPosts, mediaItems, libraryItems } = useData();

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelected(0);
      return;
    }

    const q = query.toLowerCase();

    const postResults: SearchResult[] = publishedPosts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.standfirst?.toLowerCase().includes(q) ||
          p.section?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        title: p.title,
        description: p.standfirst?.replace(/<[^>]*>/g, "").substring(0, 80) || p.section,
        type: "post" as const,
        href: `/${p.section}/${p.category}/${p.id}`,
        section: p.section,
        category: p.category,
      }));

    const mediaResults: SearchResult[] = mediaItems
      .filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q) ||
          m.author?.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description?.substring(0, 80) || m.type,
        type: "media" as const,
        href: `/media`,
      }));

    const libraryResults: SearchResult[] = libraryItems
      .filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.author?.toLowerCase().includes(q) ||
          l.category?.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map((l) => ({
        id: l.id,
        title: l.title,
        description: l.author ? `By ${l.author}` : l.category,
        type: "library" as const,
        href: `/library`,
      }));

    setResults([...postResults, ...mediaResults, ...libraryResults]);
    setSelected(0);
  }, [query, publishedPosts, mediaItems, libraryItems]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      navigate(result.href);
      onClose();
    },
    [navigate, onClose]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter" && results[selected]) {
        handleSelect(results[selected]);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, results, selected, handleSelect, onClose]);

  if (!open) return null;

  const typeIcon = (type: SearchResult["type"]) => {
    if (type === "post") return <FileText className="w-4 h-4 text-blue-500" />;
    if (type === "media") return <Video className="w-4 h-4 text-purple-500" />;
    return <BookOpen className="w-4 h-4 text-green-500" />;
  };

  const typeLabel = (type: SearchResult["type"]) => {
    if (type === "post") return "Article";
    if (type === "media") return "Media";
    return "Library";
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles, media, library..."
              className="flex-1 text-base outline-none placeholder:text-gray-400"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded border border-gray-200">
              ESC
            </kbd>
          </div>

          {/* Results */}
          {query && (
            <div className="max-h-[60vh] overflow-y-auto">
              {results.length === 0 ? (
                <div className="px-4 py-10 text-center text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No results for "<span className="font-medium text-gray-600">{query}</span>"</p>
                </div>
              ) : (
                <ul className="py-2">
                  {results.map((result, i) => (
                    <li key={result.id + result.type}>
                      <button
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                          i === selected ? "bg-blue-50" : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setSelected(i)}
                      >
                        <div className="mt-0.5 flex-shrink-0">{typeIcon(result.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 text-sm truncate">
                              {result.title}
                            </span>
                            <span className="flex-shrink-0 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                              {typeLabel(result.type)}
                            </span>
                          </div>
                          {result.description && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{result.description}</p>
                          )}
                        </div>
                        <ArrowRight className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-opacity ${i === selected ? "opacity-100 text-blue-500" : "opacity-0"}`} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Empty state / hints */}
          {!query && (
            <div className="px-4 py-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick links</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Latest Articles", href: "/latest", icon: FileText },
                  { label: "Media Hub", href: "/media", icon: Video },
                  { label: "Library", href: "/library", icon: BookOpen },
                  { label: "Encyclopaedia", href: "/encyclopaedia", icon: Clock },
                ].map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.href}
                      onClick={() => { navigate(link.href); onClose(); }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors text-left"
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
            <span><kbd className="bg-gray-100 px-1 rounded">↑↓</kbd> navigate</span>
            <span><kbd className="bg-gray-100 px-1 rounded">↵</kbd> open</span>
            <span><kbd className="bg-gray-100 px-1 rounded">esc</kbd> close</span>
          </div>
        </div>
      </div>
    </>
  );
}
