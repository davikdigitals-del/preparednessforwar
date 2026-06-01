import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, Eye, MousePointer, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";
import { Checkbox } from "@/components/ui/checkbox";
import { natoCountries } from "@/data/mockData";
import type { Advertisement, Sponsor, AdSpace, AdvertisementFormData } from "@/types/monetization";

export default function AdminAdvertisements() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [adSpaces, setAdSpaces] = useState<AdSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState<AdvertisementFormData>({
    sponsor_id: "",
    ad_space_id: "",
    title: "",
    image_url: "",
    destination_url: "",
    html_content: "",
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    target_countries: [],
    target_sections: [],
    priority: 1,
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [adsResult, sponsorsResult, spacesResult] = await Promise.all([
        supabase
          .from("advertisements")
          .select(`
            *,
            sponsor:sponsors(*),
            ad_space:ad_spaces(*)
          `)
          .order("created_at", { ascending: false }),
        supabase.from("sponsors").select("*").eq("is_active", true),
        supabase.from("ad_spaces").select("*").eq("is_active", true),
      ]);

      if (adsResult.error) throw adsResult.error;
      if (sponsorsResult.error) throw sponsorsResult.error;
      if (spacesResult.error) throw spacesResult.error;

      setAdvertisements(adsResult.data || []);
      setSponsors(sponsorsResult.data || []);
      setAdSpaces(spacesResult.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const adData = {
        ...formData,
        target_countries: formData.target_countries?.length ? formData.target_countries : null,
        target_sections: formData.target_sections?.length ? formData.target_sections : null,
      };

      if (editingAd) {
        const { error } = await supabase
          .from("advertisements")
          .update(adData)
          .eq("id", editingAd.id);

        if (error) throw error;
        toast({ title: "Success", description: "Advertisement updated successfully" });
      } else {
        const { error } = await supabase
          .from("advertisements")
          .insert([adData]);

        if (error) throw error;
        toast({ title: "Success", description: "Advertisement created successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      sponsor_id: ad.sponsor_id,
      ad_space_id: ad.ad_space_id,
      title: ad.title || "",
      image_url: ad.image_url || "",
      destination_url: ad.destination_url,
      html_content: ad.html_content || "",
      start_date: ad.start_date.split('T')[0],
      end_date: ad.end_date.split('T')[0],
      target_countries: ad.target_countries || [],
      target_sections: ad.target_sections || [],
      priority: ad.priority,
      is_active: ad.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this advertisement?")) return;

    try {
      const { error } = await supabase
        .from("advertisements")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Advertisement deleted successfully" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingAd(null);
    setFormData({
      sponsor_id: "",
      ad_space_id: "",
      title: "",
      image_url: "",
      destination_url: "",
      html_content: "",
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      target_countries: [],
      target_sections: [],
      priority: 1,
      is_active: true,
    });
  };

  const toggleCountry = (countryCode: string) => {
    setFormData(prev => ({
      ...prev,
      target_countries: prev.target_countries?.includes(countryCode)
        ? prev.target_countries.filter(c => c !== countryCode)
        : [...(prev.target_countries || []), countryCode]
    }));
  };

  const filteredAds = advertisements.filter((ad) =>
    ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.sponsor?.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalImpressions = advertisements.reduce((sum, ad) => sum + ad.impression_count, 0);
  const totalClicks = advertisements.reduce((sum, ad) => sum + ad.click_count, 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Advertisements Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage ad campaigns</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Advertisement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Ads</p>
              <p className="text-2xl font-bold">{advertisements.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Ads</p>
              <p className="text-2xl font-bold">{advertisements.filter(a => a.is_active).length}</p>
            </div>
            <Eye className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Impressions</p>
              <p className="text-2xl font-bold">{totalImpressions.toLocaleString()}</p>
            </div>
            <Eye className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg CTR</p>
              <p className="text-2xl font-bold">{avgCTR}%</p>
            </div>
            <MousePointer className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search advertisements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Ads Table */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sponsor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad Space</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredAds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No advertisements found. Click "New Advertisement" to create one.
                  </td>
                </tr>
              ) : (
                filteredAds.map((ad) => {
                  const ctr = ad.impression_count > 0 
                    ? ((ad.click_count / ad.impression_count) * 100).toFixed(2)
                    : "0.00";
                  
                  return (
                    <tr key={ad.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {ad.image_url && (
                            <img src={ad.image_url} alt={ad.title || "Ad"} className="w-20 h-12 object-cover rounded" />
                          )}
                          <div>
                            <div className="font-medium">{ad.title || "Untitled Ad"}</div>
                            <div className="text-sm text-gray-500">Priority: {ad.priority}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{ad.sponsor?.company_name}</td>
                      <td className="px-6 py-4 text-sm">{ad.ad_space?.name}</td>
                      <td className="px-6 py-4 text-sm">
                        <div>{new Date(ad.start_date).toLocaleDateString()}</div>
                        <div className="text-gray-500">to {new Date(ad.end_date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-gray-400" />
                          {ad.impression_count.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <MousePointer className="w-4 h-4 text-gray-400" />
                          {ad.click_count} ({ctr}%)
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {ad.is_active ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactive</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(ad)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(ad.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAd ? "Edit Advertisement" : "Create New Advertisement"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sponsor_id">Sponsor *</Label>
                  <Select
                    value={formData.sponsor_id}
                    onValueChange={(value) => setFormData({ ...formData, sponsor_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sponsor" />
                    </SelectTrigger>
                    <SelectContent>
                      {sponsors.map((sponsor) => (
                        <SelectItem key={sponsor.id} value={sponsor.id}>
                          {sponsor.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ad_space_id">Ad Space *</Label>
                  <Select
                    value={formData.ad_space_id}
                    onValueChange={(value) => setFormData({ ...formData, ad_space_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ad space" />
                    </SelectTrigger>
                    <SelectContent>
                      {adSpaces.map((space) => (
                        <SelectItem key={space.id} value={space.id}>
                          {space.name} {space.dimensions && `(${space.dimensions})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Ad Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Internal reference name"
                />
              </div>

              <div>
                <Label htmlFor="destination_url">Destination URL *</Label>
                <Input
                  id="destination_url"
                  type="url"
                  value={formData.destination_url}
                  onChange={(e) => setFormData({ ...formData, destination_url: e.target.value })}
                  placeholder="https://example.com"
                  required
                />
              </div>
            </div>

            {/* Ad Content */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-lg">Ad Content</h3>
              
              <div>
                <FileUpload
                  type="image"
                  currentUrl={formData.image_url}
                  onUrlChange={(url) => setFormData({ ...formData, image_url: url })}
                  label="Ad Image"
                />
              </div>

              <div>
                <Label htmlFor="html_content">Custom HTML (Optional)</Label>
                <Textarea
                  id="html_content"
                  value={formData.html_content}
                  onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                  rows={4}
                  placeholder="<div>Custom HTML code...</div>"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use image only</p>
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-lg">Schedule</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Targeting */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-lg">Targeting</h3>
              
              <div>
                <Label>Target Countries</Label>
                <div className="border rounded-lg p-4 max-h-48 overflow-y-auto bg-gray-50">
                  <div className="grid grid-cols-2 gap-2">
                    {natoCountries.map((country) => (
                      <div key={country.code} className="flex items-center space-x-2">
                        <Checkbox
                          id={`country-${country.code}`}
                          checked={formData.target_countries?.includes(country.code)}
                          onCheckedChange={() => toggleCountry(country.code)}
                        />
                        <label htmlFor={`country-${country.code}`} className="text-sm cursor-pointer">
                          {country.flag} {country.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave empty to show in all countries</p>
              </div>

              <div>
                <Label htmlFor="priority">Priority (1-10)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                />
                <p className="text-xs text-gray-500 mt-1">Higher priority ads are shown first</p>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingAd ? "Update Advertisement" : "Create Advertisement"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
