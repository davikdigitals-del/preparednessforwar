import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TemplateField {
  id: string;
  label: string;
  hint: string;
  type: "text" | "phone" | "contact" | "location" | "inventory_item" | "textarea";
  required: boolean;
}

interface Template {
  id: string;
  type: "emergency_contact" | "supply_inventory" | "bugout_plan";
  title: string;
  description: string;
  fields: TemplateField[];
  sort_order: number;
  is_active: boolean;
}

const TYPE_LABELS = {
  emergency_contact: "🆘 Emergency Contact",
  supply_inventory: "📦 Supply Inventory",
  bugout_plan: "🚗 Bug-Out Plan",
};

export default function AdminPreparednessTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [fieldDialog, setFieldDialog] = useState(false);
  const [editingField, setEditingField] = useState<TemplateField | null>(null);
  const [currentTemplateId, setCurrentTemplateId] = useState<string>("");
  const { toast } = useToast();

  const [tForm, setTForm] = useState({ type: "emergency_contact" as Template["type"], title: "", description: "" });
  const [fForm, setFForm] = useState<TemplateField>({ id: "", label: "", hint: "", type: "text", required: false });

  useEffect(() => { fetchTemplates(); }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data } = await supabase.from("preparedness_templates").select("*").order("sort_order");
    setTemplates(data || []);
    setLoading(false);
  };

  const saveTemplate = async () => {
    if (!tForm.title.trim()) return;
    try {
      if (editingTemplate) {
        await supabase.from("preparedness_templates").update({ title: tForm.title, description: tForm.description }).eq("id", editingTemplate.id);
        toast({ title: "Template updated" });
      } else {
        const maxOrder = Math.max(0, ...templates.map(t => t.sort_order));
        await supabase.from("preparedness_templates").insert({ type: tForm.type, title: tForm.title, description: tForm.description, sort_order: maxOrder + 1, fields: [] });
        toast({ title: "Template created" });
      }
      setTemplateDialog(false);
      fetchTemplates();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const toggleActive = async (t: Template) => {
    await supabase.from("preparedness_templates").update({ is_active: !t.is_active }).eq("id", t.id);
    fetchTemplates();
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Delete this template? Members will lose their responses.")) return;
    await supabase.from("preparedness_templates").delete().eq("id", id);
    toast({ title: "Template deleted" });
    fetchTemplates();
  };

  const openNewField = (templateId: string) => {
    setEditingField(null);
    setCurrentTemplateId(templateId);
    setFForm({ id: `field_${Date.now()}`, label: "", hint: "", type: "text", required: false });
    setFieldDialog(true);
  };

  const openEditField = (field: TemplateField, templateId: string) => {
    setEditingField(field);
    setCurrentTemplateId(templateId);
    setFForm({ ...field });
    setFieldDialog(true);
  };

  const saveField = async () => {
    if (!fForm.label.trim()) return;
    const template = templates.find(t => t.id === currentTemplateId);
    if (!template) return;
    let fields: TemplateField[];
    if (editingField) {
      fields = template.fields.map(f => f.id === editingField.id ? fForm : f);
    } else {
      fields = [...template.fields, fForm];
    }
    await supabase.from("preparedness_templates").update({ fields }).eq("id", currentTemplateId);
    toast({ title: editingField ? "Field updated" : "Field added" });
    setFieldDialog(false);
    fetchTemplates();
  };

  const deleteField = async (fieldId: string, templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    const fields = template.fields.filter(f => f.id !== fieldId);
    await supabase.from("preparedness_templates").update({ fields }).eq("id", templateId);
    toast({ title: "Field deleted" });
    fetchTemplates();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Preparedness Templates</h1>
          <p className="text-gray-600 mt-1">Create templates that guide members to personalise their emergency plans</p>
        </div>
        <Button onClick={() => { setEditingTemplate(null); setTForm({ type: "emergency_contact", title: "", description: "" }); setTemplateDialog(true); }}>
          <Plus className="w-4 h-4 mr-2" /> New Template
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
        <strong>How it works:</strong> You create the template structure (fields, hints, guidance). Members fill in their personal data privately — you never see their responses.
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-3">
          {templates.map(template => (
            <div key={template.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => setExpanded(expanded === template.id ? null : template.id)} className="text-gray-400 hover:text-gray-600">
                  {expanded === template.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{template.title}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{TYPE_LABELS[template.type]}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${template.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {template.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{template.fields.length} fields</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => toggleActive(template)} className="text-xs">
                    {template.is_active ? 'Hide' : 'Show'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditingTemplate(template); setTForm({ type: template.type, title: template.title, description: template.description }); setTemplateDialog(true); }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteTemplate(template.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {expanded === template.id && (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                  {template.description && (
                    <p className="text-sm text-gray-600 mb-3 italic">{template.description}</p>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Fields ({template.fields.length})</p>
                    <Button size="sm" variant="outline" onClick={() => openNewField(template.id)}>
                      <Plus className="w-3 h-3 mr-1" /> Add Field
                    </Button>
                  </div>
                  {template.fields.length === 0 ? (
                    <p className="text-sm text-gray-400 py-2">No fields yet — add fields to guide members</p>
                  ) : (
                    <div className="space-y-2">
                      {template.fields.map((field, i) => (
                        <div key={field.id} className="flex items-start gap-2 bg-white rounded px-3 py-2 border border-gray-100">
                          <GripVertical className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium">{field.label}</span>
                              {field.required && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Required</span>}
                              <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{field.type}</span>
                            </div>
                            {field.hint && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{field.hint}</p>}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button size="sm" variant="ghost" onClick={() => openEditField(field, template.id)}><Edit className="w-3 h-3" /></Button>
                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteField(field.id, template.id)}><Trash2 className="w-3 h-3" /></Button>
                          </div>
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

      {/* Template Dialog */}
      <Dialog open={templateDialog} onOpenChange={setTemplateDialog}>
        <DialogContent aria-describedby={undefined} className="max-w-md">
          <DialogHeader><DialogTitle>{editingTemplate ? "Edit Template" : "New Template"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {!editingTemplate && (
              <div>
                <Label>Template Type</Label>
                <Select value={tForm.type} onValueChange={(v: any) => setTForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency_contact">🆘 Emergency Contact</SelectItem>
                    <SelectItem value="supply_inventory">📦 Supply Inventory</SelectItem>
                    <SelectItem value="bugout_plan">🚗 Bug-Out Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Title *</Label>
              <Input value={tForm.title} onChange={e => setTForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Emergency Contact Sheet" />
            </div>
            <div>
              <Label>Description (shown to members)</Label>
              <Textarea value={tForm.description} onChange={e => setTForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Explain what this template is for and how members should use it" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={saveTemplate}>{editingTemplate ? "Update" : "Create"}</Button>
              <Button variant="outline" onClick={() => setTemplateDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Field Dialog */}
      <Dialog open={fieldDialog} onOpenChange={setFieldDialog}>
        <DialogContent aria-describedby={undefined} className="max-w-md">
          <DialogHeader><DialogTitle>{editingField ? "Edit Field" : "Add Field"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Field Label *</Label>
              <Input value={fForm.label} onChange={e => setFForm(p => ({ ...p, label: e.target.value }))} placeholder="e.g., Out-of-State Contact" />
            </div>
            <div>
              <Label>Hint / Guidance (shown to member)</Label>
              <Textarea value={fForm.hint} onChange={e => setFForm(p => ({ ...p, hint: e.target.value }))} rows={3} placeholder="e.g., Local calls often fail during disasters but long-distance lines work..." />
            </div>
            <div>
              <Label>Field Type</Label>
              <Select value={fForm.type} onValueChange={(v: any) => setFForm(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Short Text</SelectItem>
                  <SelectItem value="textarea">Long Text</SelectItem>
                  <SelectItem value="phone">Phone Number</SelectItem>
                  <SelectItem value="contact">Contact (Name + Phone)</SelectItem>
                  <SelectItem value="location">Location (Address)</SelectItem>
                  <SelectItem value="inventory_item">Inventory Item (Qty + Expiry)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="req" checked={fForm.required} onChange={e => setFForm(p => ({ ...p, required: e.target.checked }))} />
              <Label htmlFor="req">Required field</Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={saveField}>{editingField ? "Update" : "Add"}</Button>
              <Button variant="outline" onClick={() => setFieldDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
