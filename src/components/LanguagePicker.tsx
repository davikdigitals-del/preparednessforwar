import { useState, useRef, useEffect } from "react";
import { Globe, Search, Check, X, ChevronRight } from "lucide-react";
import { useLang, availableLangs } from "@/contexts/LanguageContext";

export function LanguagePicker() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const current = availableLangs.find(l => l.code === lang) || availableLangs[0];

  // Focus search when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 80);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSelect = (code: string) => {
    setLang(code as any);
    setOpen(false);
  };

  const filtered = availableLangs.filter(l =>
    l.label.toLowerCase().includes(query.toLowerCase()) ||
    l.code.toLowerCase().includes(query.toLowerCase())
  );

  const groups = [
    { label: "NATO Members", langs: filtered.filter(l => l.region === "NATO") },
    { label: "Partners & Global", langs: filtered.filter(l => l.region !== "NATO") },
  ].filter(g => g.langs.length > 0);

  return (
    <>
      {/* Trigger button — WhatsApp style: flag + language name + chevron */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-left group"
      >
        <span className="text-xl leading-none">{current.flag}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{current.label}</p>
          <p className="text-xs text-muted-foreground">App language</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Sheet — slides up on mobile, centered modal on desktop */}
          <div className="relative z-10 w-full sm:max-w-md bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[80vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#25D366]" />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">App Language</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Search bar — exactly like WhatsApp */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 rounded-full px-3 py-2">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search language..."
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                />
                {query && (
                  <button onClick={() => setQuery("")}>
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Language list */}
            <div className="overflow-y-auto flex-1">
              {groups.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">No languages found</div>
              ) : (
                groups.map(group => (
                  <div key={group.label}>
                    {/* Group header */}
                    <div className="px-4 py-2 bg-gray-50 dark:bg-zinc-800/50">
                      <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{group.label}</p>
                    </div>
                    {/* Language rows */}
                    {group.langs.map(l => {
                      const isActive = l.code === lang;
                      return (
                        <button
                          key={l.code}
                          onClick={() => handleSelect(l.code)}
                          className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-gray-50 dark:border-zinc-800/50 last:border-0 ${
                            isActive
                              ? "bg-[#e7f8ee] dark:bg-[#1a3a25]"
                              : "hover:bg-gray-50 dark:hover:bg-zinc-800/40"
                          }`}
                        >
                          {/* Flag */}
                          <span className="text-2xl leading-none w-8 text-center shrink-0">{l.flag}</span>

                          {/* Name */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isActive ? "text-[#25D366] font-semibold" : "text-gray-900 dark:text-white"}`}>
                              {l.label}
                            </p>
                            <p className="text-xs text-gray-400 uppercase">{l.code}</p>
                          </div>

                          {/* Checkmark — green like WhatsApp */}
                          {isActive && (
                            <Check className="w-5 h-5 text-[#25D366] shrink-0" strokeWidth={2.5} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Bottom safe area for mobile */}
            <div className="h-safe-bottom pb-2" />
          </div>
        </div>
      )}
    </>
  );
}
