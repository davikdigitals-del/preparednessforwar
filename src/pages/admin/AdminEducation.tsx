import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, BookOpen, GraduationCap, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EducationProgramme {
  id: string;
  title: string;
  description: string | null;
  programme_type: "scouts" | "homeschool";
  age_group: string | null;
  age_label: string | null;
  level: "beginner" | "intermediate" | "advanced";
  badge_name: string | null;
  badge_icon: string | null;
  content: string | null;
  resources: Array<{ title: string; url: string }>;
  is_published: boolean;
  sort_order: number;
  course_id: string | null;
  created_at: string;
  updated_at: string;
}

interface ProgrammeFormData {
  title: string;
  description: string;
  programme_type: "scouts" | "homeschool";
  age_group: string;
  age_label: string;
  level: "beginner" | "intermediate" | "advanced";
  badge_name: string;
  badge_icon: string;
  content: string;
  resources: Array<{ title: string; url: string }>;
  is_published: boolean;
  sort_order: number;
  course_id: string;
}

const defaultForm: ProgrammeFormData = {
  title: "",
  description: "",
  programme_type: "scouts",
  age_group: "",
  age_label: "",
  level: "beginner",
  badge_name: "",
  badge_icon: "",
  content: "",
  resources: [],
  is_published: false,
  sort_order: 0,
  course_id: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminEducation() {
  const [programmes, setProgrammes] = useState<EducationProgramme[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EducationProgramme | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "scouts" | "homeschool">("all");
  const [formData, setFormData] = useState<ProgrammeFormData>(defaultForm);
  const [resourceInput, setResourceInput] = useState({ title: "", url: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchProgrammes();
  }, []);

  const fetchProgrammes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("education_programmes")
        .select("*")
        .order("programme_type", { ascending: true })
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setProgrammes(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormData(defaultForm);
    setResourceInput({ title: "", url: "" });
    setDialogOpen(true);
  };

  const openEdit = (programme: EducationProgramme) => {
    setEditing(programme);
    setFormData({
      title: programme.title,
      description: programme.description || "",
      programme_type: programme.programme_type,
      age_group: programme.age_group || "",
      age_label: programme.age_label || "",
      level: programme.level,
      badge_name: programme.badge_name || "",
      badge_icon: programme.badge_icon || "",
      content: programme.content || "",
      resources: programme.resources || [],
      is_published: programme.is_published,
      sort_order: programme.sort_order,
      course_id: programme.course_id || "",
    });
    setResourceInput({ title: "", url: "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({ title: "Validation", description: "Title is required", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description || null,
        programme_type: formData.programme_type,
        age_group: formData.age_group || null,
        age_label: formData.age_label || null,
        level: formData.level,
        badge_name: formData.badge_name || null,
        badge_icon: formData.badge_icon || null,
        content: formData.content || null,
        resources: formData.resources,
        is_published: formData.is_published,
        sort_order: formData.sort_order,
        course_id: formData.course_id || null,
        updated_at: new Date().toISOString(),
      };

      if (editing) {
        const { error } = await supabase
          .from("education_programmes")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
        toast({ title: "Updated", description: "Programme updated successfully." });
      } else {
        const { error } = await supabase.from("education_programmes").insert([payload]);
        if (error) throw error;
        toast({ title: "Created", description: "Programme created successfully." });
      }

      setDialogOpen(false);
      fetchProgrammes();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this programme? This cannot be undone.")) return;
    try {
      const { error } = await supabase.from("education_programmes").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Programme removed." });
      fetchProgrammes();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleTogglePublish = async (programme: EducationProgramme) => {
    try {
      const { error } = await supabase
        .from("education_programmes")
        .update({ is_published: !programme.is_published, updated_at: new Date().toISOString() })
        .eq("id", programme.id);
      if (error) throw error;
      fetchProgrammes();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const addResource = () => {
    if (!resourceInput.title.trim() || !resourceInput.url.trim()) return;
    setFormData(prev => ({
      ...prev,
      resources: [...prev.resources, { title: resourceInput.title.trim(), url: resourceInput.url.trim() }],
    }));
    setResourceInput({ title: "", url: "" });
  };

  const removeResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  const filtered = programmes.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || p.programme_type === filterType;
    return matchesSearch && matchesType;
  });

  const scoutsCount = programmes.filter(p => p.programme_type === "scouts").length;
  const homeschoolCount = programmes.filter(p => p.programme_type === "homeschool").length;
  const publishedCount = programmes.filter(p => p.is_published).length;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Education Programmes</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage Scouts &amp; Guides and Home Schooling content
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Programme
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{programmes.length}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{scoutsCount}</p>
          <p className="text-sm text-gray-600">Scouts &amp; Guides</p>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{homeschoolCount}</p>
          <p className="text-sm text-gray-600">Home School</p>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-700">{publishedCount}</p>
          <p className="text-sm text-gray-600">Published</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search programmes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="scouts">Scouts &amp; Guides</SelectItem>
            <SelectItem value="homeschool">Home Schooling</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No programmes found</p>
          <p className="text-sm mt-1">Try adjusting your filters or create a new programme.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Programme</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden sm:table-cell">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden md:table-cell">Age Group</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden lg:table-cell">Level</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(programme => (
                <tr key={programme.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl leading-none">{programme.badge_icon || "📚"}</span>
                      <div>
                        <p className="font-medium">{programme.title}</p>
                        {programme.badge_name && (
                          <p className="text-xs text-gray-500">{programme.badge_name}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        programme.programme_type === "scouts"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {programme.programme_type === "scouts" ? (
                        <><BookOpen className="w-3 h-3" /> Scouts &amp; Guides</>
                      ) : (
                        <><GraduationCap className="w-3 h-3" /> Home School</>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                    {programme.age_label || programme.age_group || "—"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                        programme.level === "beginner"
                          ? "bg-gray-100 text-gray-700"
                          : programme.level === "intermediate"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {programme.level}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        programme.is_published
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {programme.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublish(programme)}
                        title={programme.is_published ? "Unpublish" : "Publish"}
                      >
                        {programme.is_published ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(programme)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(programme.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Programme" : "New Education Programme"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the details of this education programme."
                : "Create a new Scouts & Guides or Home Schooling programme."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Type + Published row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Programme Type *</Label>
                <Select
                  value={formData.programme_type}
                  onValueChange={(v: "scouts" | "homeschool") =>
                    setFormData(prev => ({ ...prev, programme_type: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scouts">Scouts &amp; Guides</SelectItem>
                    <SelectItem value="homeschool">Home Schooling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Level</Label>
                <Select
                  value={formData.level}
                  onValueChange={(v: any) => setFormData(prev => ({ ...prev, level: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Title */}
            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Build Your Emergency Kit"
              />
            </div>

            {/* Description */}
            <div>
              <Label>Short Description</Label>
              <Textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief summary shown in cards..."
                rows={2}
              />
            </div>

            {/* Age group */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Age Group</Label>
                <Input
                  value={formData.age_group}
                  onChange={e => setFormData(prev => ({ ...prev, age_group: e.target.value }))}
                  placeholder="e.g. 8-10"
                />
              </div>
              <div>
                <Label>Age Label</Label>
                <Input
                  value={formData.age_label}
                  onChange={e => setFormData(prev => ({ ...prev, age_label: e.target.value }))}
                  placeholder="e.g. Cubs / Brownies"
                />
              </div>
            </div>

            {/* Badge (scouts only) */}
            {formData.programme_type === "scouts" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Badge Name</Label>
                  <Input
                    value={formData.badge_name}
                    onChange={e => setFormData(prev => ({ ...prev, badge_name: e.target.value }))}
                    placeholder="e.g. Emergency Kit Badge"
                  />
                </div>
                <div>
                  <Label>Badge Icon (emoji)</Label>
                  <Input
                    value={formData.badge_icon}
                    onChange={e => setFormData(prev => ({ ...prev, badge_icon: e.target.value }))}
                    placeholder="🎒"
                  />
                </div>
              </div>
            )}

            {/* Main content */}
            <div>
              <Label>Content (HTML / Rich Text)</Label>
              <Textarea
                value={formData.content}
                onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Full lesson content..."
                rows={6}
              />
            </div>

            {/* Resources */}
            <div>
              <Label>Downloadable Resources</Label>
              <div className="flex gap-2 mt-1 mb-2">
                <Input
                  placeholder="Resource title"
                  value={resourceInput.title}
                  onChange={e => setResourceInput(prev => ({ ...prev, title: e.target.value }))}
                  className="flex-1"
                />
                <Input
                  placeholder="URL"
                  value={resourceInput.url}
                  onChange={e => setResourceInput(prev => ({ ...prev, url: e.target.value }))}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addResource}>
                  Add
                </Button>
              </div>
              {formData.resources.length > 0 && (
                <ul className="space-y-1">
                  {formData.resources.map((r, i) => (
                    <li key={i} className="flex items-center justify-between bg-gray-50 rounded px-3 py-1 text-sm">
                      <span>
                        <span className="font-medium">{r.title}</span>
                        <span className="text-gray-500 ml-2 truncate max-w-xs inline-block">{r.url}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeResource(i)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Sort + Published */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))
                  }
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, is_published: e.target.checked }))
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium">Published (visible to public)</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>{editing ? "Save Changes" : "Create Programme"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
