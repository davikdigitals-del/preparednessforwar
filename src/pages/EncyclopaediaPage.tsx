import { useState } from "react";
import { Search, BookOpen, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useData } from "@/contexts/DataContext";

export default function EncyclopaediaPage() {
  const { encEntries } = useData();
  const [search, setSearch] = useState("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<typeof encEntries[0] | null>(null);

  const filteredEntries = encEntries.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  // Group by letter
  const grouped = filteredEntries.reduce<Record<string, typeof encEntries>>((acc, entry) => {
    if (!acc[entry.letter]) acc[entry.letter] = [];
    acc[entry.letter].push(entry);
    return acc;
  }, {});

  const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // When searching, show all matched letters; otherwise filter by activeLetter
  const lettersToShow = search
    ? Object.keys(grouped).sort()
    : activeLetter
      ? grouped[activeLetter] ? [activeLetter] : []
      : [];

  // Auto-select first letter with entries if none chosen yet and no search
  const defaultLetter = !activeLetter && !search
    ? Object.keys(grouped).sort()[0]
    : null;
  const displayLetters = search
    ? lettersToShow
    : activeLetter
      ? lettersToShow
      : defaultLetter
        ? [defaultLetter]
        : [];

  return (
    <div className="container py-8">
      <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Encyclopaedia of Survival Knowledge</h1>
      <p className="text-muted-foreground mb-6">A comprehensive A–Z reference of survival topics, techniques, and guidance.</p>

      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search encyclopaedia..."
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveLetter(null); }}
          className="pl-9"
        />
      </div>

      {/* Letter index — click to filter */}
      <div className="flex flex-wrap gap-1 mb-8">
        {allLetters.map(l => {
          const hasEntries = !!(grouped[l] && grouped[l].length > 0);
          const isActive = activeLetter === l;
          return (
            <button
              key={l}
              disabled={!hasEntries}
              onClick={() => {
                setActiveLetter(prev => prev === l ? null : l);
                setSearch("");
                setSelectedEntry(null);
              }}
              className={`w-8 h-8 flex items-center justify-center rounded-sm text-sm font-bold transition-colors
                ${!hasEntries
                  ? "bg-muted text-muted-foreground cursor-default"
                  : isActive
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                    : "bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
                }`}
            >
              {l}
            </button>
          );
        })}
      </div>

      {/* Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-8">
          {displayLetters.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              {search ? "No entries found." : "Select a letter above to browse entries."}
            </p>
          ) : (
            displayLetters.map(letter => (
              <div key={letter}>
                <h2 className="font-display font-bold text-4xl text-muted-foreground/30 border-b border-border pb-2 mb-4">
                  {letter}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(grouped[letter] || [])
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map(entry => (
                      <button
                        key={entry.id}
                        onClick={() => setSelectedEntry(entry)}
                        className={`flex items-center gap-2 p-3 rounded-sm hover:bg-muted transition-colors group text-left w-full
                          ${selectedEntry?.id === entry.id ? "bg-muted" : ""}`}
                      >
                        <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium group-hover:text-alert transition-colors">{entry.title}</span>
                        <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                      </button>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Preview panel */}
        <div className="hidden lg:block">
          <div className="sticky top-20 bg-card border border-border rounded-sm p-6">
            {selectedEntry ? (
              <>
                <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center mb-3">
                  <span className="font-display font-bold text-lg text-primary-foreground">{selectedEntry.letter}</span>
                </div>
                <h3 className="font-display font-bold text-xl mb-3">{selectedEntry.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedEntry.content}</p>
              </>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Click an entry to preview it here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
