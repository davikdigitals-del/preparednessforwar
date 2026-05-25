import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  { value: "food-water", label: "Food & Water" },
  { value: "medical", label: "Medical" },
  { value: "shelter", label: "Shelter" },
  { value: "power", label: "Power & Fuel" },
  { value: "communication", label: "Communication" },
  { value: "documents", label: "Documents & Security" },
  { value: "other", label: "Other" },
];

export default function AdminEmergencySuppliers() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", category: "food-water", description: "", phone: "", email: "", website: "", address: "", city: "", postcode: "", country: "UK", coordinates: "", opening_hours: "", accepts_cash: true, accepts_card: true, is_active: true, display_order: 0 });

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("emergency_suppliers").select("*").order("display_order");
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setSuppliers(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        const { error } = await supabase.from("emergency_suppliers").update(form).eq("id", editing.id);
        if (error) throw error;
        toast({ title: "Updated" });
      } else {
        const { error } = await supabase.from("emergency_suppliers").insert(form);
        if (error) throw error;
        toast({ title: "Created" });
      }
      setDialogOpen(false);
      resetForm();
      fetchSuppliers();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleEdit = (s: any) => {
    setEditing(s);
    setForm({ name: s.name, category: s.category, description: s.description || "", phone: s.phone || "", email: s.email || "", website: s.website || "", address: s.address || "", city: s.city || "", postcode: s.postcode || "", country: s.country || "UK", coordinates: s.coordinates || "", opening_hours: s.opening_hours || "", accepts_cash: s.accepts_cash, accepts_card: s.accepts_card, is_active: s.is_active, display_order: s.display_order || 0 });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this supplier?")) return;
    await supabase.from("emergency_suppliers").delete().eq("id", id);
    fetchSuppliers();
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ name: "", category: "food-water", description: "", phone: "", email: "", website: "", address: "", city: "", postcode: "", country: "UK", coordinates: "", opening_hours: "", accepts_cash: true, accepts_card: true, is_active: true, display_order: 0 });
  };

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Emergency Suppliers</h1>
          <p className="text-muted-foreground mt-1">Manage the offline supplier directory shown in members' bunkers</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Supplier
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : suppliers.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No suppliers yet</td></tr>
              ) : suppliers.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{s.name}</p>
                    {s.description && <p className="text-xs text-gray-500 line-clamp-1">{s.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm">{CATEGORIES.find(c => c.value === s.category)?.label || s.category}</td>
                  <td className="px-4 py-3 text-sm">
                    {s.phone && <a href={`tel:${s.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline"><Phone className="w-3 h-3" />{s.phone}</a>}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {s.city && <span className="flex items-center gap-1 text-gray-600"><MapPin className="w-3 h-3" />{s.city}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${s.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                      {s.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(s)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>{editing ? "Edit Supplier" : "Add Supplier"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div>
                <Label>Category *</Label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="0800 000 0000" /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div><Label>Website</Label><Input value={form.website} onChange={e => setForm({...form, website: e.target.value})} placeholder="https://..." /></div>
              <div><Label>Opening Hours</Label><Input value={form.opening_hours} onChange={e => setForm({...form, opening_hours: e.target.value})} placeholder="Mon-Sat 9am-6pm" /></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div><Label>City</Label><Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
              <div><Label>Postcode</Label><Input value={form.postcode} onChange={e => setForm({...form, postcode: e.target.value})} /></div>
            </div>
            <div><Label>Coordinates (lat,lng)</Label><Input value={form.coordinates} onChange={e => setForm({...form, coordinates: e.target.value})} placeholder="51.5074, -0.1278" /></div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.accepts_cash} onCheckedChange={v => setForm({...form, accepts_cash: !!v})} />Accepts Cash</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.accepts_card} onCheckedChange={v => setForm({...form, accepts_card: !!v})} />Accepts Card</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.is_active} onCheckedChange={v => setForm({...form, is_active: !!v})} />Active</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Update" : "Add Supplier"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
