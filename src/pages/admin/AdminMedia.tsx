import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, Video, Headphones, Image as ImageIcon, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";

export default function AdminMedia() {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "video" as "video" | "podcast" | "audio" | "image",
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
    console.log("AdminMedia: Loading data...");
    setLoading(true);
    
    try {
      const dataPromise = fetchMediaItems();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Data load timeout")), 8000)
      );
      
      await Promise.race([dataPromise, timeoutPromise]);
      console.log("AdminMedia: Data loaded successfully");
    } catch (error) {
      console.error("AdminMedia: Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMediaItems = async () => {
    try {
      const { data, error } = await supabase
        .from("media_items")
        .select("*")
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "podcast":
        return <Headphones className="w-4 h-4" />;
      case "audio":
        return <Music className="w-4 h-4" />;
      case "image":
        return <ImageIcon className="w-4 h-4" />;
      default:
        return <Video className="w-4 h-4" />;
    }
  };

  const filteredItems = mediaItems.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Media Library</h1>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Media Item
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
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
                    No media items found
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Media Item" : "Create New Media Item"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

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
                  <SelectItem value="audio">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4" /> Audio
                    </div>
                  </SelectItem>
                  <SelectItem value="image">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Image
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
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
              />
            </div>

            <div>
              <Label htmlFor="url">
                Media URL {formData.type === "podcast" || formData.type === "audio" ? "(Audio/Podcast Link)" : "(Video/Image Link)"}
              </Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com/media-file or YouTube/Vimeo URL"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports YouTube, Vimeo, Dailymotion, direct links, or any embed URL
              </p>
            </div>

            <div>
              <FileUpload
                type="image"
                currentUrl={formData.thumbnail}
                onUrlChange={(url) => setFormData({ ...formData, thumbnail: url })}
                label="Thumbnail Image"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                />
                <span className="text-sm">Premium Content</span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
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
