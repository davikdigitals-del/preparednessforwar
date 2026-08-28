import { useState } from "react";
import { useState } from "react";
import { BookOpen, Download, Search, Eye, Crown, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useLocation, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function LibraryPage() {
  const { libraryItems } = useData();
  const { user } = useAuth(); // Remove loading state
  const { isPremium: hasPremiumAccess } = usePremiumStatus(); // Remove loading state
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<typeof libraryItems[0] | null>(null);
  const [premiumPromptOpen, setPremiumPromptOpen] = useState(false);

  // Check if we're on the /resources route
  const isResourcesRoute = location.pathname === '/resources';
  const pageTitle = isResourcesRoute ? "Resources" : "Library";
  const pageDescription = isResourcesRoute
    ? "Download essential resources, guides, checklists, and documents for emergency preparedness."
    : "Browse, read, and download essential guides and manuals.";

  const visibleLibraryItems = libraryItems.filter((item) => {
    const countryCodes = item.countryCodes || [];
    return countryCodes.length === 0 || (user ? countryCodes.includes(user.country) : false);
  });

  const categories = [...new Set(visibleLibraryItems.map((i) => i.category).filter(Boolean))];

  const filtered = visibleLibraryItems.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.author.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCategory || item.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleRead = (item: typeof libraryItems[0]) => {
    if (item.isPremium && !hasPremiumAccess) {
      setPremiumPromptOpen(true);
      return;
    }
    setPreviewItem(item);
  };

  const handleDownload = (item: typeof libraryItems[0]) => {
    if (item.isPremium && !hasPremiumAccess) {
      setPremiumPromptOpen(true);
      return;
    }
    if (!item.fileUrl) return;
    const a = document.createElement("a");
    a.href = item.fileUrl;
    a.download = `${item.title}.${item.format.toLowerCase()}`;
    a.click();
  };

  return (
    <div className="container py-8">
      <div className="bg-primary text-primary-foreground rounded-sm p-6 md:p-10 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="w-8 h-8" />
          <h1 className="font-display font-bold text-3xl md:text-4xl">{pageTitle}</h1>
        </div>
        <p className="text-primary-foreground/80 max-w-2xl">{pageDescription}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search the library..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setSelectedCategory(null)} className={`category-pill transition-colors ${!selectedCategory ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-foreground hover:text-background"}`}>
          All
        </button>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`category-pill transition-colors ${selectedCategory === cat ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-foreground hover:text-background"}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filtered.map((item) => {
          const isLocked = item.isPremium && !hasPremiumAccess;
          return (
            <div key={item.id} className="group">
              <div className={`${item.coverColor} rounded-sm aspect-[3/4] p-5 flex flex-col justify-between text-primary-foreground relative overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow`}>
                {item.coverImageUrl ? (
                  <img src={item.coverImageUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-foreground/20" />
                )}
                {/* Premium badge */}
                {item.isPremium && (
                  <div className="absolute top-3 right-3 z-20">
                    <div className="px-2 py-1 bg-amber-500 text-white text-xs font-bold uppercase tracking-wide flex items-center gap-1 shadow-md">
                      <Crown className="w-3 h-3" />
                      Premium
                    </div>
                  </div>
                )}
                {/* Lock overlay for non-subscribers */}
                {isLocked && (
                  <div className="absolute inset-0 z-10 bg-black/40 flex items-center justify-center cursor-pointer" onClick={() => setPremiumPromptOpen(true)}>
                    <div className="flex flex-col items-center gap-2 text-white">
                      <Lock className="w-10 h-10 drop-shadow-lg" />
                      <span className="text-xs font-bold uppercase tracking-wide">Premium Only</span>
                    </div>
                  </div>
                )}
                <div className="relative z-10">
                  <Badge variant="secondary" className="text-[10px] mb-2">{item.format}</Badge>
                  <h3 className="font-display font-bold text-lg leading-tight">{item.title}</h3>
                </div>
                <div className="relative z-10">
                  <p className="text-sm opacity-80">{item.author}</p>
                  <p className="text-xs opacity-60">{item.pages} pages</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.category || "General"}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className={`flex-1 text-xs ${isLocked ? "opacity-60" : ""}`}
                    onClick={() => handleRead(item)}
                  >
                    {isLocked ? <Lock className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                    {isLocked ? "Premium" : "Read"}
                  </Button>
                  <Button
                    size="sm"
                    className={`flex-1 text-xs ${isLocked ? "opacity-60" : ""}`}
                    onClick={() => handleDownload(item)}
                    disabled={!item.fileUrl && !isLocked}
                  >
                    {isLocked ? <Lock className="w-3 h-3 mr-1" /> : <Download className="w-3 h-3 mr-1" />}
                    {isLocked ? "Premium" : "Download"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && <p className="text-center text-muted-foreground py-16">No items found in the library.</p>}

      {/* Premium upgrade dialog */}
      <Dialog open={premiumPromptOpen} onOpenChange={setPremiumPromptOpen}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="font-display sr-only">Premium Content</DialogTitle>
          </DialogHeader>
          <Card className="border-0 shadow-none">
            <CardContent className="pt-6 pb-4 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Premium Content</h3>
              <p className="text-gray-600 mb-6 text-sm">
                This resource is available exclusively to premium members. Upgrade to unlock the full library.
              </p>
              <ul className="space-y-2 text-sm text-left mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  Full library access with all downloadable resources
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  Unlimited access to premium articles & guides
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  Exclusive videos, podcasts & country content
                </li>
              </ul>
              <div className="flex flex-col gap-2">
                {user ? (
                  <Button asChild size="lg" className="w-full gap-2">
                    <Link to="/subscribe" onClick={() => setPremiumPromptOpen(false)}>
                      <Crown className="w-4 h-4" />
                      Upgrade to Premium
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild size="lg" className="w-full gap-2">
                      <Link to="/subscribe" onClick={() => setPremiumPromptOpen(false)}>
                        <Crown className="w-4 h-4" />
                        Upgrade to Premium
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="w-full">
                      <Link to="/login" onClick={() => setPremiumPromptOpen(false)}>Sign In</Link>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {/* Read preview dialog (free or premium subscribers only) */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="font-display">{previewItem?.title}</DialogTitle>
          </DialogHeader>
          {previewItem?.fileUrl ? (
            <div className="space-y-3">
              <iframe src={previewItem.fileUrl} title={previewItem?.title} className="w-full h-[70vh] rounded-sm border border-border" />
            </div>
          ) : (
            <div className="bg-muted rounded-sm p-8 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No document has been uploaded yet for this item.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
