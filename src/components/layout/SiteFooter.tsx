import { Link } from "react-router-dom";
import { Globe } from "lucide-react";
import { useLang, availableLangs } from "@/contexts/LanguageContext";
import { translatePage } from "@/hooks/useAutoTranslate";

export function SiteFooter() {
  const { lang, setLang, t } = useLang();

  const handleLangChange = (newLang: string) => {
    setLang(newLang as any);
    // Translate immediately after React re-renders
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        translatePage(newLang);
      });
    });
  };

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Preparedness for War</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted source for emergency preparedness and survival intelligence.
            </p>

            {/* Language Switcher */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Language</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableLangs.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleLangChange(l.code)}
                    title={l.label}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded border transition-all ${
                      lang === l.code
                        ? "bg-primary text-white border-primary font-semibold"
                        : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.code.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Content</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/latest" className="text-muted-foreground hover:text-primary transition-colors">
                  Latest News
                </Link>
              </li>
              <li>
                <Link to="/countries" className="text-muted-foreground hover:text-primary transition-colors">
                  Countries
                </Link>
              </li>
              <li>
                <Link to="/media" className="text-muted-foreground hover:text-primary transition-colors">
                  Media Hub
                </Link>
              </li>
              <li>
                <Link to="/library" className="text-muted-foreground hover:text-primary transition-colors">
                  Library
                </Link>
              </li>
              <li>
                <Link to="/encyclopaedia" className="text-muted-foreground hover:text-primary transition-colors">
                  Encyclopaedia
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Community</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/newsletter" className="text-muted-foreground hover:text-primary transition-colors">
                  Newsletter
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-muted-foreground hover:text-primary transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Preparedness for War. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
