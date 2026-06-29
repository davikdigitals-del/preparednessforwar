import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, Download, FileText, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";

export default function AdminLibrary() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "Guides",
    description: "",
    file_url: "",
    cover_image_url: "",
    cover_color: "bg-primary",
    format: "PDF",
    pages: "",
  });

  const categories = ["Guides", "Checklists", "Templates", "Reports", "Manuals", "Other"];
  const formats = ["PDF", "DOC", "DOCX", "XLS", "XLSX", "ZIP", "Other"];
  const colors = [
    { value: "bg-primary", label: "Blue" },
    { value: "bg-red-500", label: "Red" },
    { value: "bg-green-500", label: "Green" },
    { value: "bg-yellow-500", label: "Yellow" },
    { value: "bg-purple-500", label: "Purple" },
    { value: "bg-orange-500", label: "Orange" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log("AdminLibrary: Loading data...");
    setLoading(true);
    
    try {
      const dataPromise = fetchItems();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Data load timeout")), 8000)
      );
      
      await Promise.race([dataPromise, timeoutPromise]);
      console.log("AdminLibrary: Data loaded successfully");
    } catch (error) {
      console.error("AdminLibrary: Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("library_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        author: formData.author || null,
        category: formData.category,
        description: formData.description || null,
        file_url: formData.file_url,
        cover_image_url: formData.cover_image_url || null,
        cover_color: formData.cover_color,
        format: formData.format,
        pages: formData.pages ? parseInt(formData.pages) : null,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("library_items")
          .update(payload)
          .eq("id", editingItem.id);

        if (error) throw error;
        toast({ title: "Success", description: "Resource updated successfully" });
      } else {
        const { error } = await supabase.from("library_items").insert([payload]);

        if (error) throw error;
        toast({ title: "Success", description: "Resource created successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchItems();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      author: item.author || "",
      category: item.category || "Guides",
      description: item.description || "",
      file_url: item.file_url || "",
      cover_image_url: item.cover_image_url || "",
      cover_color: item.cover_color || "bg-primary",
      format: item.format || "PDF",
      pages: item.pages?.toString() || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      const item = items.find((i) => i.id === id);

      // Delete uploaded files from storage if they're Supabase storage URLs
      if (item?.file_url && item.file_url.includes("/storage/v1/object/public/")) {
        const path = item.file_url.split("/public/")[1];
        const bucket = path.split("/")[0];
        const filePath = path.substring(bucket.length + 1);
        if (filePath) await supabase.storage.from(bucket).remove([filePath]);
      }

      if (item?.cover_image_url && item.cover_image_url.includes("/storage/v1/object/public/")) {
        const path = item.cover_image_url.split("/public/")[1];
        const bucket = path.split("/")[0];
        const filePath = path.substring(bucket.length + 1);
        if (filePath) await supabase.storage.from(bucket).remove([filePath]);
      }

      const { error } = await supabase.from("library_items").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Success", description: "Resource deleted successfully" });
      fetchItems();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      author: "",
      category: "Guides",
      description: "",
      file_url: "",
      cover_image_url: "",
      cover_color: "bg-primary",
      format: "PDF",
      pages: "",
    });
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Library Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage downloadable resources, PDFs, and documents
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
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
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Format
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Downloads
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
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm || filterCategory !== "all"
                      ? "No resources match your filters"
                      : "No resources yet. Click 'Add Resource' to get started."}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.cover_image_url ? (
                          <img
                            src={item.cover_image_url}
                            alt={item.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        ) : (
                          <div
                            className={`w-12 h-16 ${item.cover_color} rounded flex items-center justify-center`}
                          >
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{item.title}</div>
                          {item.author && (
                            <div className="text-sm text-gray-500">{item.author}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{item.format}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4 text-gray-400" />
                        {item.downloads || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(item.file_url, "_blank")}
                        title="Download file"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
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
        <DialogContent aria-describedby={undefined} className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Resource" : "Add New Resource"}
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
                placeholder="e.g., Emergency Preparedness Guide"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Brief description of the resource..."
              />
            </div>

            <div>
              <FileUpload
                type="document"
                currentUrl={formData.file_url}
                onUrlChange={(url) => setFormData({ ...formData, file_url: url })}
                label="Resource File"
                uploadId="library-document"
              />
              <p className="text-xs text-gray-500 mt-1">
                <strong>Two ways to add documents:</strong><br/>
                • <strong>Upload:</strong> Upload files to auto-generate Supabase URLs<br/>
                • <strong>URL with Auto-Validation:</strong> Paste document links (Google Drive, Dropbox, etc.) - we'll automatically validate them<br/>
                <em>Note: The "From URL" tab includes automatic validation and link checking.</em>
              </p>
            </div>

            <div>
              <FileUpload
                type="image"
                currentUrl={formData.cover_image_url}
                onUrlChange={(url) => setFormData({ ...formData, cover_image_url: url })}
                label="Cover Image (optional)"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="format">Format</Label>
                <Select
                  value={formData.format}
                  onValueChange={(value) => setFormData({ ...formData, format: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formats.map((fmt) => (
                      <SelectItem key={fmt} value={fmt}>
                        {fmt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pages">Pages</Label>
                <Input
                  id="pages"
                  type="number"
                  value={formData.pages}
                  onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                  placeholder="e.g., 25"
                />
              </div>

              <div>
                <Label htmlFor="cover_color">Cover Color</Label>
                <Select
                  value={formData.cover_color}
                  onValueChange={(value) => setFormData({ ...formData, cover_color: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
