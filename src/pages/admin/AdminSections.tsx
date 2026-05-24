import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NavCategory { id: string; title: string; slug: string; sort_order: number; }
interface NavSection { id: string; title: string; slug: string; color: string; sort_order: number; is_active: boolean; categories: NavCategory[]; }

export default function AdminSections() {
  const [sections, setSections] = useState<NavSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { toast } = useToast();

  // Section dialog
  const [sectionDialog, setSectionDialog] = useState(false);
  const [editingSection, setEditingSection] = useState<NavSection | null>(null);
  const [sectionForm, setSectionForm] = useState({ title: "", slug: "", color: "" });

  // Category dialog
  const [catDialog, setCatDialog] = useState(false);
  const [editingCat, setEditingCat] = useState<NavCategory | null>(null);
  const [catSectionId, setCatSectionId] = useState("");
  const [catForm, setCatForm] = useState({ title: "", slug: "" });

  useEffect(() => { fetchSections(); }, []);

  const fetchSections = async () => {
    setLoading(true);
    const { data: secs } = await supabase.from("nav_sections").select("*").order("sort_order");
    const { data: cats } = await supabase.from("nav_categories").select("*").order("sort_order");
    if (secs) {
      setSections(secs.map(s => ({
        ...s,
        categories: (cats || []).filter(c => c.section_id === s.id),
      })));
    }
    setLoading(false);
  };

  // Auto-generate slug from title
  const toSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  /* ── Section CRUD ── */
  const openNewSection = () => {
    setEditingSection(null);
    setSectionForm({ title: "", slug: "", color: "" });
    setSectionDialog(true);
  };

  const openEditSection = (s: NavSection) => {
    setEditingSection(s);
    setSectionForm({ title: s.title, slug: s.slug, color: s.color });
    setSectionDialog(true);
  };

  const saveSection = async () => {
    if (!sectionForm.title.trim()) return;
    const slug = sectionForm.slug || toSlug(sectionForm.title);
    try {
      if (editingSection) {
        const { error } = await supabase.from("nav_sections").update({ title: sectionForm.title, slug, color: sectionForm.color }).eq("id", editingSection.id);
        if (error) throw error;
        toast({ title: "Section updated" });
      } else {
        const maxOrder = Math.max(0, ...sections.map(s => s.sort_order));
        const { error } = await supabase.from("nav_sections").insert({ title: sectionForm.title, slug, color: sectionForm.color, sort_order: maxOrder + 1 });
        if (error) throw error;
        toast({ title: "Section created" });
      }
      setSectionDialog(false);
      fetchSections();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const deleteSection = async (id: string) => {
    if (!confirm("Delete this section and all its categories?")) return;
    await supabase.from("nav_sections").delete().eq("id", id);
    toast({ title: "Section deleted" });
    fetchSections();
  };

  const toggleActive = async (s: NavSection) => {
    await supabase.from("nav_sections").update({ is_active: !s.is_active }).eq("id", s.id);
    fetchSections();
  };

  /* ── Category CRUD ── */
  const openNewCat = (sectionId: string) => {
    setEditingCat(null);
    setCatSectionId(sectionId);
    setCatForm({ title: "", slug: "" });
    setCatDialog(true);
  };

  const openEditCat = (cat: NavCategory, sectionId: string) => {
    setEditingCat(cat);
    setCatSectionId(sectionId);
    setCatForm({ title: cat.title, slug: cat.slug });
    setCatDialog(true);
  };

  const saveCat = async () => {
    if (!catForm.title.trim()) return;
    const slug = catForm.slug || toSlug(catForm.title);
    try {
      if (editingCat) {
        const { error } = await supabase.from("nav_categories").update({ title: catForm.title, slug }).eq("id", editingCat.id);
        if (error) throw error;
        toast({ title: "Category updated" });
      } else {
        const section = sections.find(s => s.id === catSectionId);
        const maxOrder = Math.max(0, ...(section?.categories || []).map(c => c.sort_order));
        const { error } = await supabase.from("nav_categories").insert({ section_id: catSectionId, title: catForm.title, slug, sort_order: maxOrder + 1 });
        if (error) throw error;
        toast({ title: "Category created" });
      }
      setCatDialog(false);
      fetchSections();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const deleteCat = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await supabase.from("nav_categories").delete().eq("id", id);
    toast({ title: "Category deleted" });
    fetchSections();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Navigation Sections</h1>
          <p className="text-gray-600 mt-1">Manage the main navigation sections and their categories</p>
        </div>
        <Button onClick={openNewSection}>
          <Plus className="w-4 h-4 mr-2" /> New Section
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Section header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => setExpanded(expanded === section.id ? null : section.id)} className="text-gray-400 hover:text-gray-600">
                  {expanded === section.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{section.title}</span>
                    <span className="text-xs text-gray-400 font-mono">/{section.slug}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${section.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {section.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{section.categories.length} categories</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => toggleActive(section)} className="text-xs">
                    {section.is_active ? 'Hide' : 'Show'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openEditSection(section)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteSection(section.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Categories */}
              {expanded === section.id && (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Categories</p>
                    <Button size="sm" variant="outline" onClick={() => openNewCat(section.id)}>
                      <Plus className="w-3 h-3 mr-1" /> Add Category
                    </Button>
                  </div>
                  {section.categories.length === 0 ? (
                    <p className="text-sm text-gray-400 py-2">No categories yet</p>
                  ) : (
                    <div className="space-y-1">
                      {section.categories.map((cat) => (
                        <div key={cat.id} className="flex items-center gap-2 bg-white rounded px-3 py-2 border border-gray-100">
                          <span className="text-sm flex-1">{cat.title}</span>
                          <span className="text-xs text-gray-400 font-mono">{cat.slug}</span>
                          <Button size="sm" variant="ghost" onClick={() => openEditCat(cat, section.id)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteCat(cat.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Section Dialog */}
      <Dialog open={sectionDialog} onOpenChange={setSectionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSection ? "Edit Section" : "New Section"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={sectionForm.title} onChange={e => setSectionForm(p => ({ ...p, title: e.target.value, slug: p.slug || toSlug(e.target.value) }))} placeholder="Emergency News" />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input value={sectionForm.slug} onChange={e => setSectionForm(p => ({ ...p, slug: e.target.value }))} placeholder="emergency-news" />
              <p className="text-xs text-gray-400 mt-1">URL-friendly identifier, e.g. emergency-news</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={saveSection}>{editingSection ? "Update" : "Create"}</Button>
              <Button variant="outline" onClick={() => setSectionDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCat ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={catForm.title} onChange={e => setCatForm(p => ({ ...p, title: e.target.value, slug: p.slug || toSlug(e.target.value) }))} placeholder="UK Alerts" />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input value={catForm.slug} onChange={e => setCatForm(p => ({ ...p, slug: e.target.value }))} placeholder="uk-alerts" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={saveCat}>{editingCat ? "Update" : "Create"}</Button>
              <Button variant="outline" onClick={() => setCatDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
