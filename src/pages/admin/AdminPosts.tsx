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
    is_pinned: false,
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
          .update({
            title: formData.title,
            content: formData.content,
            excerpt: formData.excerpt,
            author: formData.author,
            section: formData.section,
            category_id: formData.category_id || null,
            image_url: formData.image_url || null,
            video_url: formData.video_url || null,
            is_premium: formData.is_premium,
            is_published: formData.is_published,
            is_pinned: formData.is_pinned,
            country_codes: formData.country_codes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingPost.id);

        if (error) {
          console.error("Update error:", error);
          throw error;
        }
        toast({ title: "Success", description: "Post updated successfully" });
      } else {
        const { error } = await supabase.from("posts").insert([{
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          author: formData.author,
          section: formData.section,
          category_id: formData.category_id || null,
          image_url: formData.image_url || null,
          video_url: formData.video_url || null,
          is_premium: formData.is_premium,
          is_published: formData.is_published,
          is_pinned: formData.is_pinned,
          country_codes: formData.country_codes,
          published_at: formData.is_published ? new Date().toISOString() : null,
        }]);

        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
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
      is_pinned: post.is_pinned || false,
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
      is_pinned: false,
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
                      <div className="flex flex-wrap gap-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${post.is_published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                          {post.is_published ? "Published" : "Draft"}
                        </span>
                        {post.is_pinned && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">📌 Pinned</span>
                        )}
                      </div>
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
                        title={post.is_pinned ? "Unpin post" : "Pin post (shows as Featured in section menu)"}
                        onClick={async () => {
                          try {
                            console.log("📌 Pin button clicked for post:", post.id, "Current is_pinned:", post.is_pinned);
                            
                            // If trying to pin, check if section already has 2 pinned posts
                            if (!post.is_pinned) {
                              const { data: pinnedPosts, error: checkError } = await supabase
                                .from("posts")
                                .select("id")
                                .eq("section", post.section)
                                .eq("is_pinned", true);
                              
                              console.log("Current pinned posts in section:", pinnedPosts, checkError);
                              
                              if (checkError) {
                                console.error("Error checking pinned posts:", checkError);
                                toast({
                                  title: "Error",
                                  description: checkError.message,
                                  variant: "destructive",
                                });
                                return;
                              }
                              
                              if (pinnedPosts && pinnedPosts.length >= 2) {
                                toast({
                                  title: "Maximum Limit Reached",
                                  description: `This section already has 2 featured posts in the menu. Please unpin one first.`,
                                  variant: "destructive",
                                });
                                return;
                              }
                            }
                            
                            const newPinnedState = !post.is_pinned;
                            console.log("Updating is_pinned to:", newPinnedState);
                            
                            const { error: updateError } = await supabase
                              .from("posts")
                              .update({ is_pinned: newPinnedState })
                              .eq("id", post.id);
                            
                            if (updateError) {
                              console.error("Update error:", updateError);
                              toast({
                                title: "Update Failed",
                                description: updateError.message,
                                variant: "destructive",
                              });
                              return;
                            }
                            
                            console.log("✅ Update successful!");
                            
                            toast({
                              title: post.is_pinned ? "Post Unpinned" : "Post Pinned",
                              description: post.is_pinned ? "Removed from menu featured" : "Added to menu featured",
                            });
                            
                            fetchPosts();
                          } catch (err: any) {
                            console.error("Exception in pin handler:", err);
                            toast({
                              title: "Error",
                              description: err.message || "Failed to update post",
                              variant: "destructive",
                            });
                          }
                        }}
                        className={post.is_pinned ? "text-blue-600" : "text-gray-400"}
                      >
                        📌
                      </Button>
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
        <DialogContent aria-describedby={undefined} className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* ── Main content column ── */}
              <div className="lg:col-span-2 space-y-3">
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
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2}
                    placeholder="Short summary..."
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    placeholder="Write your post content here..."
                  />
                </div>
              </div>

              {/* ── Sidebar settings column ── */}
              <div className="space-y-3">

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

                <div>
                  <Label>Section</Label>
                  <Select
                    value={formData.section}
                    onValueChange={(value) => setFormData({ ...formData, section: value, category_id: "" })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                    <SelectContent className="max-h-48 overflow-y-auto">
                      {sections.map((sec) => (
                        <SelectItem key={sec.id} value={sec.slug}>{sec.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    disabled={!formData.section}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.section ? "Select category" : "Select section first"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-48 overflow-y-auto">
                      {categories
                        .filter((cat) => cat.sections?.slug === formData.section)
                        .map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.title || cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <FileUpload
                    type="image"
                    currentUrl={formData.image_url}
                    onUrlChange={(url) => setFormData({ ...formData, image_url: url })}
                    label="Cover Image"
                  />
                </div>

                <div>
                  <FileUpload
                    type="video"
                    currentUrl={formData.video_url}
                    onUrlChange={(url) => setFormData({ ...formData, video_url: url })}
                    label="Video / Podcast (Optional)"
                  />
                </div>

                {/* Countries */}
                <div>
                  <Label className="mb-1 block">Countries</Label>
                  <div className="border rounded p-2 max-h-36 overflow-y-auto bg-gray-50">
                    <div className="grid grid-cols-1 gap-1">
                      {natoCountries.map((country) => (
                        <div key={country.code} className="flex items-center space-x-2">
                          <Checkbox
                            id={`country-${country.code}`}
                            checked={formData.country_codes.includes(country.code)}
                            onCheckedChange={() => toggleCountry(country.code)}
                          />
                          <label htmlFor={`country-${country.code}`} className="text-xs cursor-pointer flex items-center gap-1">
                            <span>{country.flag}</span><span>{country.name}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Flags */}
                <div className="space-y-1.5 border rounded p-3 bg-gray-50">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })} />
                    <span className="text-sm font-medium">Published</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_pinned}
                      onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })} />
                    <span className="text-sm">📌 Pin (Featured)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_premium}
                      onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })} />
                    <span className="text-sm">⭐ Premium</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingPost ? "Update" : "Create"}
                  </Button>
                </div>

              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
