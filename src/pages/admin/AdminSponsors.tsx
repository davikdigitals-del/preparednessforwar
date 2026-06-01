import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, Building2, DollarSign, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";
import { Checkbox } from "@/components/ui/checkbox";
import { natoCountries } from "@/data/mockData";
import type { Sponsor } from "@/types/monetization";

export default function AdminSponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    website_url: "",
    logo_url: "",
    contract_start_date: "",
    contract_end_date: "",
    monthly_fee: 0,
    currency: "GBP",
    is_active: true,
    target_countries: [] as string[],
  });

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSponsors(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSponsor) {
        const { error } = await supabase
          .from("sponsors")
          .update(formData)
          .eq("id", editingSponsor.id);

        if (error) throw error;
        toast({ title: "Success", description: "Sponsor updated successfully" });
      } else {
        const { error } = await supabase
          .from("sponsors")
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Success", description: "Sponsor created successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchSponsors();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      company_name: sponsor.company_name,
      contact_name: sponsor.contact_name || "",
      contact_email: sponsor.contact_email || "",
      contact_phone: sponsor.contact_phone || "",
      website_url: sponsor.website_url || "",
      logo_url: sponsor.logo_url || "",
      contract_start_date: sponsor.contract_start_date || "",
      contract_end_date: sponsor.contract_end_date || "",
      monthly_fee: sponsor.monthly_fee || 0,
      currency: sponsor.currency,
      is_active: sponsor.is_active,
      target_countries: sponsor.target_countries || [],
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sponsor?")) return;

    try {
      const { error } = await supabase
        .from("sponsors")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Sponsor deleted successfully" });
      fetchSponsors();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingSponsor(null);
    setFormData({
      company_name: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      website_url: "",
      logo_url: "",
      contract_start_date: "",
      contract_end_date: "",
      monthly_fee: 0,
      currency: "GBP",
      is_active: true,
      target_countries: [],
    });
  };

  const toggleCountry = (countryCode: string) => {
    setFormData(prev => ({
      ...prev,
      target_countries: prev.target_countries.includes(countryCode)
        ? prev.target_countries.filter(c => c !== countryCode)
        : [...prev.target_countries, countryCode]
    }));
  };

  const filteredSponsors = sponsors.filter((sponsor) =>
    sponsor.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSponsors = sponsors.filter(s => s.is_active).length;
  const totalMonthlyRevenue = sponsors
    .filter(s => s.is_active)
    .reduce((sum, s) => sum + (s.monthly_fee || 0), 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Sponsors Management</h1>
          <p className="text-muted-foreground mt-1">Manage sponsor companies and contracts</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Sponsor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sponsors</p>
              <p className="text-2xl font-bold">{sponsors.length}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Sponsors</p>
              <p className="text-2xl font-bold">{activeSponsors}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-bold">£{totalMonthlyRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search sponsors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Sponsors Table */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contract Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredSponsors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No sponsors found. Click "New Sponsor" to add your first sponsor.
                  </td>
                </tr>
              ) : (
                filteredSponsors.map((sponsor) => (
                  <tr key={sponsor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {sponsor.logo_url && (
                          <img src={sponsor.logo_url} alt={sponsor.company_name} className="w-12 h-12 object-contain rounded" />
                        )}
                        <div>
                          <div className="font-medium">{sponsor.company_name}</div>
                          {sponsor.website_url && (
                            <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                              Website
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>{sponsor.contact_name}</div>
                      <div className="text-gray-500">{sponsor.contact_email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {sponsor.contract_start_date && sponsor.contract_end_date ? (
                        <div>
                          <div>{new Date(sponsor.contract_start_date).toLocaleDateString()}</div>
                          <div className="text-gray-500">to {new Date(sponsor.contract_end_date).toLocaleDateString()}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      £{sponsor.monthly_fee?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4">
                      {sponsor.is_active ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(sponsor)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(sponsor.id)}>
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSponsor ? "Edit Sponsor" : "Add New Sponsor"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <FileUpload
                type="image"
                currentUrl={formData.logo_url}
                onUrlChange={(url) => setFormData({ ...formData, logo_url: url })}
                label="Company Logo"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contract_start_date">Contract Start Date</Label>
                <Input
                  id="contract_start_date"
                  type="date"
                  value={formData.contract_start_date}
                  onChange={(e) => setFormData({ ...formData, contract_start_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contract_end_date">Contract End Date</Label>
                <Input
                  id="contract_end_date"
                  type="date"
                  value={formData.contract_end_date}
                  onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthly_fee">Monthly Fee</Label>
                <Input
                  id="monthly_fee"
                  type="number"
                  step="0.01"
                  value={formData.monthly_fee}
                  onChange={(e) => setFormData({ ...formData, monthly_fee: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Target Countries</Label>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto bg-gray-50">
                <div className="grid grid-cols-2 gap-2">
                  {natoCountries.map((country) => (
                    <div key={country.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={`country-${country.code}`}
                        checked={formData.target_countries.includes(country.code)}
                        onCheckedChange={() => toggleCountry(country.code)}
                      />
                      <label htmlFor={`country-${country.code}`} className="text-sm cursor-pointer">
                        {country.flag} {country.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingSponsor ? "Update Sponsor" : "Add Sponsor"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
