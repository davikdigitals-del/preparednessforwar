import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPages() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    content: "",
    meta_title: "",
    meta_description: "",
    is_published: true,
  });

  useEffect(() => { loadData(); }, []);

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
      // Read textarea value directly at submit time
      const contentValue = textareaRef.current?.value || "";

      const payload = {
        slug: formData.slug.toLowerCase().replace(/\s+/g, "-"),
        title: formData.title,
        content: contentValue,
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
    setShowPreview(false);
    setFormData({ slug: "", title: "", content: "", meta_title: "", meta_description: "", is_published: true });
  };

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Pages Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Paste HTML + CSS to build pages. Your code saves and renders exactly as written.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Page
        </Button>
      </div>

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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? `Editing: ${editingPage.title}` : "Create New Page"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Privacy Policy"
                />
              </div>
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  placeholder="e.g., privacy"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Live at: <span className="font-mono">/pages/{formData.slug || "slug"}</span>
                </p>
              </div>
            </div>

            {/* HTML + CSS editor — fully uncontrolled */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Page Content (HTML + CSS)</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (textareaRef.current) {
                        textareaRef.current.value = "";
                      }
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
              <textarea
                ref={textareaRef}
                key={editingPage?.id || 'new'}
                defaultValue={formData.content}
                rows={18}
                disabled={false}
                readOnly={false}
                placeholder={`Paste your HTML and CSS here. Example:\n\n<style>\n  h1 { color: navy; font-size: 2rem; }\n  p  { font-size: 1rem; line-height: 1.7; }\n</style>\n\n<h1>Page Title</h1>\n<p>Your content here...</p>`}
                style={{
                  width: '100%',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  background: '#0a0a0a',
                  color: '#4ade80',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  padding: '12px',
                  resize: 'vertical',
                  lineHeight: '1.6',
                  outline: 'none',
                  pointerEvents: 'auto'
                }}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 <strong>Tip:</strong> If the editor is slow with large content, use the "Clear All" button before pasting new code.
              </p>
            </div>

            {/* Live preview - toggle button */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Live Preview</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </Button>
              </div>
              {showPreview && (
                <div
                  className="border border-gray-200 rounded-md p-4 bg-white min-h-[120px] max-h-[320px] overflow-auto"
                  dangerouslySetInnerHTML={{ __html: textareaRef.current?.value || "" }}
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Input
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="Brief description for search engines"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Publish page (visible to public)</span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">{editingPage ? "Save Changes" : "Create Page"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
