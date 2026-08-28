import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search, Eye, EyeOff, ExternalLink, Code, PenLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/RichTextEditor";

export default function AdminPages() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [contentMode, setContentMode] = useState<"visual" | "html">("visual");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    content: "",
    meta_title: "",
    meta_description: "",
    is_published: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.race([
        fetchPages(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
      ]);
    } catch (error) {
      console.error("AdminPages load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPages = async () => {
    const { data, error } = await supabase.from("pages").select("*").order("title");
    if (error) throw error;
    setPages(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        slug: formData.slug.toLowerCase().replace(/\s+/g, "-"),
        title: formData.title,
        content: formData.content,
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || "",
        is_published: formData.is_published,
      };

      if (editingPage) {
        const { error } = await supabase.from("pages").update(payload).eq("id", editingPage.id);
        if (error) throw error;
        toast({ title: "Success", description: "Page updated successfully" });
      } else {
        const { error } = await supabase.from("pages").insert([payload]);
        if (error) throw error;
        toast({ title: "Success", description: "Page created successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchPages();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (page: any) => {
    setEditingPage(page);
    setFormData({
      slug: page.slug,
      title: page.title,
      content: page.content || "",
      meta_title: page.meta_title || "",
      meta_description: page.meta_description || "",
      is_published: page.is_published,
    });
    setContentMode("visual");
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    try {
      const { error } = await supabase.from("pages").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Page deleted successfully" });
      fetchPages();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingPage(null);
    setContentMode("visual");
    setFormData({ slug: "", title: "", content: "", meta_title: "", meta_description: "", is_published: true });
  };

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Pages Management</h1>
          <p className="text-sm text-gray-600 mt-1">Create pages using the visual editor or paste raw HTML code.</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Page
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : filteredPages.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? "No pages match your search." : "No pages yet. Click 'New Page' to get started."}
                </td></tr>
              ) : (
                filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{page.title}</td>
                    <td className="px-6 py-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">/pages/{page.slug}</code>
                    </td>
                    <td className="px-6 py-4">
                      {page.is_published ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          <Eye className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                          <EyeOff className="w-3 h-3" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(page.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <Button variant="ghost" size="sm" title="View live page"
                        onClick={() => window.open(`/pages/${page.slug}`, "_blank")}>
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(page)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(page.id)}
                        className="text-red-500 hover:text-red-700">
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPage ? "Edit Page" : "Create New Page"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title + Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Contact Us"
                />
              </div>
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  placeholder="e.g., contact-us"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Live at: <span className="font-mono">/pages/{formData.slug || "slug"}</span>
                </p>
              </div>
            </div>

            {/* Content editor — Visual / Code tabs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Page Content</Label>
                <div className="flex rounded-md border border-gray-200 overflow-hidden text-sm">
                  <button
                    type="button"
                    onClick={() => setContentMode("visual")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${contentMode === "visual"
                      ? "bg-primary text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    Visual
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentMode("html")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 border-l border-gray-200 transition-colors ${contentMode === "html"
                      ? "bg-primary text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    Code / HTML
                  </button>
                </div>
              </div>

              {contentMode === "visual" ? (
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="Write your page content here..."
                />
              ) : (
                <div className="space-y-2">
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={20}
                    placeholder={`Paste any code here — full HTML, JSX, CSS styles, tables, embeds, anything.\n\nExamples:\n<h1>My Page</h1>\n<p>Some text here</p>\n\n<section style="background:#f5f5f5; padding:20px">\n  <h2>Section Title</h2>\n</section>`}
                    className="font-mono text-sm bg-gray-950 text-green-400 border-gray-700 resize-y leading-relaxed"
                    spellCheck={false}
                  />
                  <p className="text-xs text-gray-500">
                    Paste <strong>any code</strong> — HTML, inline styles, tables, embeds, full page markup. It saves and renders exactly as written.
                  </p>
                  {/* Live preview */}
                  {formData.content.trim() && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1 mt-3">Live Preview:</p>
                      <div
                        className="border border-gray-200 rounded-md p-4 bg-white min-h-[100px] prose prose-slate max-w-none text-sm overflow-auto"
                        dangerouslySetInnerHTML={{ __html: formData.content }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SEO */}
            <div>
              <Label htmlFor="meta_title">Meta Title (SEO)</Label>
              <Input
                id="meta_title"
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                placeholder="Leave empty to use page title"
              />
            </div>
            <div>
              <Label htmlFor="meta_description">Meta Description (SEO)</Label>
              <Textarea
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                rows={2}
                placeholder="Brief description for search engines..."
              />
            </div>

            {/* Publish toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Publish page (visible to public)</span>
            </label>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingPage ? "Update Page" : "Create Page"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
