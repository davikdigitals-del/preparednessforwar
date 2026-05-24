import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";
import { RichTextEditor } from "@/components/RichTextEditor";
import { navSections, natoCountries } from "@/data/mockData";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminPosts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    author: "",
    section: "",
    category_id: "",
    image_url: "",
    video_url: "",
    is_premium: false,
    is_published: true,
    country_codes: [] as string[],
  });

  useEffect(() => {
    let cancelled = false;
    
    const loadData = async () => {
      console.log("AdminPosts: Loading data...");
      setLoading(true);
      
      try {
        await Promise.all([
          fetchPosts(),
          fetchCategories(),
          fetchSections()
        ]);
        
        if (!cancelled) {
          console.log("AdminPosts: Data loaded successfully");
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("AdminPosts: Error loading data:", error);
          toast({ title: "Error", description: "Failed to load data. Please check your connection.", variant: "destructive" });
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchPosts = async () => {
    try {
      console.log("Fetching posts...");
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        console.log("Fetched posts:", data?.length || 0, "posts");
        setPosts(data || []);
      }
    } catch (error: any) {
      console.error("Catch error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select(`
          *,
          sections (
            id,
            title,
            slug
          )
        `)
        .order("title");

      if (error) {
        console.error("Error fetching categories:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        console.log("Fetched categories:", data);
        setCategories(data || []);
      }
    } catch (error: any) {
      console.error("Catch error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const fetchSections = async () => {
    try {
      const [{ data: secs }, { data: cats }] = await Promise.all([
        supabase.from("nav_sections").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("nav_categories").select("*").order("sort_order"),
      ]);
      setSections(secs || []);
      // Map categories to match the shape the form expects
      setCategories((cats || []).map(c => ({
        ...c,
        sections: (secs || []).find(s => s.id === c.section_id),
      })));
    } catch (error: any) {
      toast({ title: "Error loading sections", description: error.message, variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPost) {
        const { error } = await supabase
          .from("posts")
          .update(formData)
          .eq("id", editingPost.id);

        if (error) throw error;
        toast({ title: "Success", description: "Post updated successfully" });
      } else {
        const { error } = await supabase.from("posts").insert([formData]);

        if (error) throw error;
        toast({ title: "Success", description: "Post created successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchPosts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      author: post.author || "",
      section: post.section || "",
      category_id: post.category_id,
      image_url: post.image_url || "",
      video_url: post.video_url || "",
      is_premium: post.is_premium,
      is_published: post.is_published,
      country_codes: post.country_codes || [],
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      // First get the post to check for uploaded files
      const post = posts.find(p => p.id === id);

      // Delete uploaded image from storage if it's a Supabase storage URL
      if (post?.image_url && post.image_url.includes('/storage/v1/object/public/post-images/')) {
        const path = post.image_url.split('/post-images/')[1];
        if (path) await supabase.storage.from('post-images').remove([path]);
      }

      // Delete uploaded video from storage if it's a Supabase storage URL
      if (post?.video_url && post.video_url.includes('/storage/v1/object/public/post-videos/')) {
        const path = post.video_url.split('/post-videos/')[1];
        if (path) await supabase.storage.from('post-videos').remove([path]);
      }

      // Delete the post record
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Success", description: "Post deleted successfully" });
      fetchPosts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      author: "",
      section: "",
      category_id: "",
      image_url: "",
      video_url: "",
      is_premium: false,
      is_published: true,
      country_codes: [],
    });
  };

  const toggleCountry = (countryCode: string) => {
    setFormData(prev => ({
      ...prev,
      country_codes: prev.country_codes.includes(countryCode)
        ? prev.country_codes.filter(c => c !== countryCode)
        : [...prev.country_codes, countryCode]
    }));
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Posts Management</h1>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Media
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
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No posts found. Click "New Post" to create your first post.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id}>
                    <td className="px-6 py-4">
                      <div className="font-medium">{post.title}</div>
                      <div className="text-sm text-gray-500">{post.excerpt}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{post.author || "Unknown"}</td>
                    <td className="px-6 py-4 text-sm">
                      {sections.find(s => s.slug === post.section)?.title || post.section || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${post.is_published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {post.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {post.image_url && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">📷 Image</span>
                        )}
                        {post.video_url && (
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
                            <Video className="w-3 h-3" /> Video
                          </span>
                        )}
                        {post.is_premium && (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">⭐ Premium</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(post)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
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
            <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
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
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Author name"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="section">Section</Label>
                <Select
                  value={formData.section}
                  onValueChange={(value) => {
                    setFormData({ ...formData, section: value, category_id: "" });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section first" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {sections.map((sec) => (
                      <SelectItem key={sec.id} value={sec.slug}>
                        {sec.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value })
                  }
                  disabled={!formData.section}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.section ? "Select category" : "Select section first"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {/* Group categories by section */}
                    {formData.section && (
                      <>
                        {/* Show categories for selected section */}
                        {categories
                          .filter((cat) => cat.sections?.slug === formData.section)
                          .map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.title || cat.name}
                            </SelectItem>
                          ))}
                        
                        {/* Show message if no categories found */}
                        {categories.filter((cat) => cat.sections?.slug === formData.section).length === 0 && (
                          <div className="px-2 py-6 text-center text-sm text-gray-500">
                            No categories found for this section.
                            <br />
                            <a href="/admin/categories" className="text-primary hover:underline mt-2 inline-block">
                              Create categories →
                            </a>
                          </div>
                        )}
                      </>
                    )}
                  </SelectContent>
                </Select>
                {formData.section && (
                  <p className="text-xs text-gray-500 mt-1">
                    Showing categories for: <strong>{sections.find(s => s.slug === formData.section)?.title}</strong>
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                placeholder="Write your post content here. You can format text, add images, videos, and more..."
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 <strong>Tip:</strong> Click the image icon (📷) in the toolbar to upload images directly into your content. You can also drag and drop or paste images!
              </p>
            </div>

            <div>
              <FileUpload
                type="image"
                currentUrl={formData.image_url}
                onUrlChange={(url) => setFormData({ ...formData, image_url: url })}
                label="Cover Image (Main Post Image)"
              />
              <p className="text-xs text-gray-500 mt-1">
                This image will be displayed at the top of the post as the cover image.
              </p>
            </div>

            <div>
              <FileUpload
                type="video"
                currentUrl={formData.video_url}
                onUrlChange={(url) => setFormData({ ...formData, video_url: url })}
                label="Post Video/Podcast (Optional)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload a video file or paste a URL (YouTube, Vimeo, podcast link, etc.)
              </p>
            </div>

            <div>
              <Label className="mb-3 block">Available Countries</Label>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto bg-gray-50">
                <div className="grid grid-cols-2 gap-2">
                  {natoCountries.map((country) => (
                    <div key={country.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={`country-${country.code}`}
                        checked={formData.country_codes.includes(country.code)}
                        onCheckedChange={() => toggleCountry(country.code)}
                      />
                      <label
                        htmlFor={`country-${country.code}`}
                        className="text-sm cursor-pointer flex items-center gap-1"
                      >
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select countries where this post will be visible. Leave empty for all countries.
              </p>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_premium}
                  onChange={(e) =>
                    setFormData({ ...formData, is_premium: e.target.checked })
                  }
                />
                <span className="text-sm">⭐ Premium Content</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) =>
                    setFormData({ ...formData, is_published: e.target.checked })
                  }
                />
                <span className="text-sm">Published</span>
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
              <Button type="submit">{editingPost ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
