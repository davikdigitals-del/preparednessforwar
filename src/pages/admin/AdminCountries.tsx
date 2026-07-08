import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, Globe, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { natoCountries, type Country } from "@/data/mockData";

export default function AdminCountries() {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterContinent, setFilterContinent] = useState<string>("all");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    flag: "",
    continent: "",
    risk_level: "low",
    description: "",
    capital: "",
    population: "",
    travel_advisory: "",
    security_notes: "",
  });

  const continents = ["Africa", "Asia", "Europe", "North America", "South America", "Oceania"];
  const riskLevels = ["low", "moderate", "high", "extreme"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await fetchCountries();
    } catch (error) {
      console.error("AdminCountries: Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from("countries")
        .select("*")
        .order("name");

      if (error) throw error;
      setCountries(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const syncAllCountries = async () => {
    try {
      setLoading(true);
      
      // Prepare all countries data from mockData
      const countryData = natoCountries.map((country) => ({
        code: country.code,
        name: country.name,
        flag: country.flag,
        continent: country.continent,
        risk_level: "low", // Default risk level
        is_active: true,
      }));

      // Upsert all countries
      const { error } = await supabase
        .from("countries")
        .upsert(countryData, { onConflict: "code" });

      if (error) throw error;

      toast({ 
        title: "Success", 
        description: `Synced ${countryData.length} countries to database` 
      });
      
      fetchCountries();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        flag: formData.flag,
        continent: formData.continent,
        risk_level: formData.risk_level,
        description: formData.description || null,
        capital: formData.capital || null,
        population: formData.population ? parseInt(formData.population) : null,
        travel_advisory: formData.travel_advisory || null,
        security_notes: formData.security_notes || null,
        is_active: true,
      };

      if (editingCountry) {
        const { error } = await supabase
          .from("countries")
          .update(payload)
          .eq("id", editingCountry.id);

        if (error) throw error;
        toast({ title: "Success", description: "Country updated successfully" });
      } else {
        const { error } = await supabase.from("countries").insert([payload]);

        if (error) throw error;
        toast({ title: "Success", description: "Country created successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchCountries();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (country: any) => {
    setEditingCountry(country);
    setFormData({
      code: country.code,
      name: country.name,
      flag: country.flag || "",
      continent: country.continent || "",
      risk_level: country.risk_level || "low",
      description: country.description || "",
      capital: country.capital || "",
      population: country.population?.toString() || "",
      travel_advisory: country.travel_advisory || "",
      security_notes: country.security_notes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this country?")) return;

    try {
      const { error } = await supabase.from("countries").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Success", description: "Country deleted successfully" });
      fetchCountries();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingCountry(null);
    setFormData({
      code: "",
      name: "",
      flag: "",
      continent: "",
      risk_level: "low",
      description: "",
      capital: "",
      population: "",
      travel_advisory: "",
      security_notes: "",
    });
  };

  const filteredCountries = countries.filter((country) => {
    const matchesSearch =
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesContinent = filterContinent === "all" || country.continent === filterContinent;
    const matchesRisk = filterRisk === "all" || country.risk_level === filterRisk;
    return matchesSearch && matchesContinent && matchesRisk;
  });

  // Group counts
  const continentCounts = continents.reduce((acc, continent) => {
    acc[continent] = countries.filter(c => c.continent === continent).length;
    return acc;
  }, {} as Record<string, number>);

  const riskCounts = riskLevels.reduce((acc, risk) => {
    acc[risk] = countries.filter(c => c.risk_level === risk).length;
    return acc;
  }, {} as Record<string, number>);

  const getRiskBadgeClass = (risk: string) => {
    const classes = {
      low: "bg-green-100 text-green-700",
      moderate: "bg-yellow-100 text-yellow-700",
      high: "bg-orange-100 text-orange-700",
      extreme: "bg-red-100 text-red-700",
    };
    return classes[risk as keyof typeof classes] || classes.low;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Countries Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage country profiles, risk levels, and travel advisories
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncAllCountries}>
            <Globe className="w-4 h-4 mr-2" />
            Sync All Countries
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Country
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterContinent} onValueChange={setFilterContinent}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by continent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Continents ({countries.length})</SelectItem>
            {continents.map(continent => (
              <SelectItem key={continent} value={continent}>
                {continent} ({continentCounts[continent] || 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterRisk} onValueChange={setFilterRisk}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by risk" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk Levels</SelectItem>
            {riskLevels.map(risk => (
              <SelectItem key={risk} value={risk}>
                {risk.charAt(0).toUpperCase() + risk.slice(1)} ({riskCounts[risk] || 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Flag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Continent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Capital
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredCountries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm || filterContinent !== "all" || filterRisk !== "all"
                      ? "No countries match your filters"
                      : "No countries yet. Click 'Sync All Countries' or 'Add Country' to get started."}
                  </td>
                </tr>
              ) : (
                filteredCountries.map((country) => (
                  <tr key={country.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-2xl">{country.flag}</td>
                    <td className="px-6 py-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                        {country.code}
                      </code>
                    </td>
                    <td className="px-6 py-4 font-medium">{country.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        {country.continent || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getRiskBadgeClass(country.risk_level)}`}>
                        {country.risk_level?.charAt(0).toUpperCase() + country.risk_level?.slice(1) || "Low"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {country.capital || "-"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(country)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(country.id)}
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
        <DialogContent aria-describedby={undefined} className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCountry ? "Edit Country" : "Add New Country"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="code">Country Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  required
                  maxLength={2}
                  placeholder="e.g., US"
                  disabled={!!editingCountry}
                />
                <p className="text-xs text-gray-500 mt-1">2-letter ISO code</p>
              </div>

              <div>
                <Label htmlFor="flag">Flag Emoji *</Label>
                <Input
                  id="flag"
                  value={formData.flag}
                  onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                  placeholder="e.g., 🇺🇸"
                  required
                />
              </div>

              <div>
                <Label htmlFor="continent">Continent *</Label>
                <Select
                  value={formData.continent}
                  onValueChange={(value) => setFormData({ ...formData, continent: value })}
                >
                  <SelectTrigger id="continent">
                    <SelectValue placeholder="Select continent" />
                  </SelectTrigger>
                  <SelectContent>
                    {continents.map((continent) => (
                      <SelectItem key={continent} value={continent}>
                        {continent}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Country Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., United States"
                />
              </div>

              <div>
                <Label htmlFor="capital">Capital City</Label>
                <Input
                  id="capital"
                  value={formData.capital}
                  onChange={(e) => setFormData({ ...formData, capital: e.target.value })}
                  placeholder="e.g., Washington D.C."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="risk_level">Risk Level *</Label>
                <Select
                  value={formData.risk_level}
                  onValueChange={(value) => setFormData({ ...formData, risk_level: value })}
                >
                  <SelectTrigger id="risk_level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {riskLevels.map((risk) => (
                      <SelectItem key={risk} value={risk}>
                        {risk.charAt(0).toUpperCase() + risk.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="population">Population</Label>
                <Input
                  id="population"
                  type="number"
                  value={formData.population}
                  onChange={(e) => setFormData({ ...formData, population: e.target.value })}
                  placeholder="e.g., 331000000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief country overview..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="travel_advisory">Travel Advisory</Label>
              <Textarea
                id="travel_advisory"
                value={formData.travel_advisory}
                onChange={(e) => setFormData({ ...formData, travel_advisory: e.target.value })}
                placeholder="Current travel warnings or advisories..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="security_notes">Security Notes</Label>
              <Textarea
                id="security_notes"
                value={formData.security_notes}
                onChange={(e) => setFormData({ ...formData, security_notes: e.target.value })}
                placeholder="Security concerns and preparedness guidance..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{editingCountry ? "Update Country" : "Create Country"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
