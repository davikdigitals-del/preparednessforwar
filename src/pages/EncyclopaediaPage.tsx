import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useData } from "@/contexts/DataContext";

export default function EncyclopaediaPage() {
  const { encEntries } = useData();
  const [search, setSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<typeof encEntries[0] | null>(null);

  const filteredEntries = encEntries.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  // Group by letter
  const grouped = filteredEntries.reduce<Record<string, typeof encEntries>>((acc, entry) => {
    if (!acc[entry.letter]) acc[entry.letter] = [];
    acc[entry.letter].push(entry);
    return acc;
  }, {});

  const sortedLetters = Object.keys(grouped).sort();
  const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="container py-8">
      <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Encyclopaedia of Survival Knowledge</h1>
      <p className="text-muted-foreground mb-6">A comprehensive A–Z reference of survival topics, techniques, and guidance.</p>

      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search encyclopaedia..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Letter index */}
      <div className="flex flex-wrap gap-1 mb-8">
        {allLetters.map(l => {
          const hasEntries = grouped[l] && grouped[l].length > 0;
          return (
            <a
              key={l}
              href={hasEntries ? `#letter-${l}` : undefined}
              className={`w-8 h-8 flex items-center justify-center rounded-sm text-sm font-bold transition-colors ${hasEntries ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-muted text-muted-foreground"}`}
            >
              {l}
            </a>
          );
        })}
      </div>

      {/* Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-8">
          {sortedLetters.map(letter => (
            <div key={letter} id={`letter-${letter}`}>
              <h2 className="font-display font-bold text-4xl text-muted-foreground/30 border-b border-border pb-2 mb-4">{letter}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {grouped[letter].sort((a, b) => a.title.localeCompare(b.title)).map(entry => (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className="flex items-center gap-2 p-3 rounded-sm hover:bg-muted transition-colors group text-left w-full"
                  >
                    <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium group-hover:text-alert transition-colors">{entry.title}</span>
                    <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          ))}
          {sortedLetters.length === 0 && <p className="text-center text-muted-foreground py-8">No entries found.</p>}
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
