import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, Video, Headphones, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";

export default function AdminPodcastVideos() {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "video" | "podcast">("all");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "video" as "video" | "podcast",
    url: "",
    thumbnail: "",
    duration: "",
    author: "",
    tags: "",
    is_premium: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log("AdminPodcastVideos: Loading data...");
    setLoading(true);
    
    try {
      const dataPromise = fetchMediaItems();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Data load timeout")), 8000)
      );
      
      await Promise.race([dataPromise, timeoutPromise]);
      console.log("AdminPodcastVideos: Data loaded successfully");
    } catch (error) {
      console.error("AdminPodcastVideos: Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMediaItems = async () => {
    try {
      const { data, error } = await supabase
        .from("media_items")
        .select("*")
        .in("type", ["video", "podcast"])
        .order("published_at", { ascending: false });

      if (error) throw error;
      setMediaItems(data || []);
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
        description: formData.description,
        type: formData.type,
        url: formData.url,
        thumbnail: formData.thumbnail,
        duration: formData.duration || null,
        author: formData.author || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        is_premium: formData.is_premium,
        published_at: new Date().toISOString(),
      };

      if (editingItem) {
        const { error } = await supabase
          .from("media_items")
          .update(payload)
          .eq("id", editingItem.id);

        if (error) throw error;
        toast({ title: "Success", description: "Media item updated successfully" });
      } else {
        const { error } = await supabase.from("media_items").insert([payload]);

        if (error) throw error;
        toast({ title: "Success", description: "Media item created successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchMediaItems();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      type: item.type,
      url: item.url || "",
      thumbnail: item.thumbnail || "",
      duration: item.duration || "",
      author: item.author || "",
      tags: item.tags ? item.tags.join(", ") : "",
      is_premium: item.is_premium || false,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media item?")) return;

    try {
      const item = mediaItems.find((m) => m.id === id);

      // Delete uploaded files from storage if they're Supabase storage URLs
      if (item?.url && item.url.includes("/storage/v1/object/public/media/")) {
        const path = item.url.split("/media/")[1];
        if (path) await supabase.storage.from("media").remove([path]);
      }

      if (item?.thumbnail && item.thumbnail.includes("/storage/v1/object/public/media/")) {
        const path = item.thumbnail.split("/media/")[1];
        if (path) await supabase.storage.from("media").remove([path]);
      }

      const { error } = await supabase.from("media_items").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Success", description: "Media item deleted successfully" });
      fetchMediaItems();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFetching(false);
    setFormData({
      title: "",
      description: "",
      type: "video",
      url: "",
      thumbnail: "",
      duration: "",
      author: "",
      tags: "",
      is_premium: false,
    });
  };

  const [fetching, setFetching] = useState(false);

  const handleFetchMeta = async (url: string) => {
    if (!url.trim() || !url.startsWith('http')) return;
    setFetching(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/fetch-media-meta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setFormData(prev => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        thumbnail: data.thumbnail || prev.thumbnail,
        author: data.author || prev.author,
        duration: data.duration || prev.duration,
        type: data.type || prev.type,
      }));

      const got = [data.title && 'title', data.thumbnail && 'thumbnail', data.author && 'author', data.duration && 'duration'].filter(Boolean);
      toast({ title: "Details fetched!", description: got.length ? `Got: ${got.join(', ')}` : "URL saved — fill in details manually" });
    } catch (err: any) {
      toast({ title: "Could not fetch details", description: "Fill in manually", variant: "destructive" });
    } finally {
      setFetching(false);
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "podcast" ? (
      <Headphones className="w-4 h-4" />
    ) : (
      <Video className="w-4 h-4" />
    );
  };

  const filteredItems = mediaItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Videos & Podcasts</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your video and podcast library separately from regular posts
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Media
        </Button>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Media</SelectItem>
            <SelectItem value="video">Videos Only</SelectItem>
            <SelectItem value="podcast">Podcasts Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Duration
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
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm || filterType !== "all"
                      ? "No media items match your filters"
                      : "No videos or podcasts yet. Click 'Add Media' to get started."}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.thumbnail && (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 w-fit">
                        {getTypeIcon(item.type)}
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{item.author || "-"}</td>
                    <td className="px-6 py-4 text-sm">{item.duration || "-"}</td>
                    <td className="px-6 py-4 text-sm">{item.views || 0}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
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
        <DialogContent aria-describedby={undefined} className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Media Item" : "Add New Video/Podcast"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="type">Media Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" /> Video
                    </div>
                  </SelectItem>
                  <SelectItem value="podcast">
                    <div className="flex items-center gap-2">
                      <Headphones className="w-4 h-4" /> Podcast
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Survival Skills Training Episode 1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                placeholder="Brief description of the content..."
              />
            </div>

            <div>
              <Label htmlFor="url">
                {formData.type === "podcast" ? "Podcast URL" : "Video URL"}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  onBlur={(e) => { if (e.target.value && !formData.title) handleFetchMeta(e.target.value); }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData('text');
                    if (pasted.startsWith('http')) {
                      setTimeout(() => handleFetchMeta(pasted), 100);
                    }
                  }}
                  placeholder={
                    formData.type === "podcast"
                      ? "Paste Spotify, Apple Podcasts, YouTube, or MP3 URL"
                      : "Paste YouTube, Vimeo, or direct video URL"
                  }
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleFetchMeta(formData.url)}
                  disabled={fetching || !formData.url}
                  className="shrink-0"
                >
                  {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Paste a URL — title, thumbnail, author and duration auto-fill
              </p>
            </div>

            <div>
              <FileUpload
                type="image"
                currentUrl={formData.thumbnail}
                onUrlChange={(url) => setFormData({ ...formData, thumbnail: url })}
                label="Thumbnail/Cover Image"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="author">Author/Creator</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="e.g., 45:20 or 1h 30m"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., survival, preparedness, interview"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_premium}
                  onChange={(e) =>
                    setFormData({ ...formData, is_premium: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Premium Content (requires subscription)</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{editingItem ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
