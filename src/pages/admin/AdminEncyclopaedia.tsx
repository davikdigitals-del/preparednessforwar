import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search, Book, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminEncyclopaedia() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLetter, setFilterLetter] = useState<string>("all");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    letter: "A",
    content: "",
    tags: "",
  });

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log("AdminEncyclopaedia: Loading data...");
    setLoading(true);
    
    try {
      const dataPromise = fetchEntries();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Data load timeout")), 8000)
      );
      
      await Promise.race([dataPromise, timeoutPromise]);
      console.log("AdminEncyclopaedia: Data loaded successfully");
    } catch (error) {
      console.error("AdminEncyclopaedia: Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("encyclopaedia_entries")
        .select("*")
        .order("title");

      if (error) throw error;
      setEntries(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);

      const payload = {
        title: formData.title,
        letter: formData.letter.toUpperCase(),
        content: formData.content,
        tags: tagsArray.length > 0 ? tagsArray : [],
      };

      if (editingEntry) {
        const { error } = await supabase
          .from("encyclopaedia_entries")
          .update(payload)
          .eq("id", editingEntry.id);

        if (error) throw error;
        toast({ title: "Success", description: "Entry updated successfully" });
      } else {
        const { error } = await supabase.from("encyclopaedia_entries").insert([payload]);

        if (error) throw error;
        toast({ title: "Success", description: "Entry created successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchEntries();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      letter: entry.letter,
      content: entry.content || "",
      tags: entry.tags ? entry.tags.join(", ") : "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const { error } = await supabase.from("encyclopaedia_entries").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Success", description: "Entry deleted successfully" });
      fetchEntries();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingEntry(null);
    setFormData({
      title: "",
      letter: "A",
      content: "",
      tags: "",
    });
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLetter = filterLetter === "all" || entry.letter === filterLetter;
    return matchesSearch && matchesLetter;
  });

  const entriesByLetter = letters.map((letter) => ({
    letter,
    count: entries.filter((e) => e.letter === letter).length,
  }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Encyclopaedia Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage encyclopaedia entries and reference materials
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Letter filter */}
      <div className="mb-4 flex flex-wrap gap-1">
        <Button
          variant={filterLetter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterLetter("all")}
        >
          All ({entries.length})
        </Button>
        {entriesByLetter.map(({ letter, count }) => (
          <Button
            key={letter}
            variant={filterLetter === letter ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterLetter(letter)}
            disabled={count === 0}
          >
            {letter} ({count})
          </Button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Letter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Views
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm || filterLetter !== "all"
                      ? "No entries match your filters"
                      : "No entries yet. Click 'Add Entry' to get started."}
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold">
                        {entry.letter}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{entry.title}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {entry.tags?.slice(0, 3).map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                        {entry.tags?.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{entry.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-gray-400" />
                        {entry.views || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "Edit Entry" : "Add New Entry"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-1">
                <Label htmlFor="letter">Letter</Label>
                <select
                  id="letter"
                  value={formData.letter}
                  onChange={(e) => setFormData({ ...formData, letter: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {letters.map((letter) => (
                    <option key={letter} value={letter}>
                      {letter}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-3">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Ammunition Storage"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={12}
                placeholder="Enter the encyclopaedia entry content..."
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., survival, preparedness, emergency"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{editingEntry ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
