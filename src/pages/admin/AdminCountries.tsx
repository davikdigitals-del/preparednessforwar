import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search, Globe, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { natoCountries } from "@/data/mockData";

export default function AdminCountries() {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterNato, setFilterNato] = useState<"all" | "nato" | "non-nato">("all");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    flag: "",
    is_nato: false,
    region: "",
    timezone: "",
  });

  const regions = [
    "North America",
    "South America",
    "Europe",
    "Asia",
    "Africa",
    "Oceania",
    "Middle East",
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log("AdminCountries: Loading data...");
    setLoading(true);
    
    try {
      const dataPromise = fetchCountries();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Data load timeout")), 8000)
      );
      
      await Promise.race([dataPromise, timeoutPromise]);
      console.log("AdminCountries: Data loaded successfully");
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

  const syncNatoCountries = async () => {
    try {
      setLoading(true);
      
      // Prepare NATO countries data
      const natoData = natoCountries.map((country) => ({
        code: country.code,
        name: country.name,
        flag: country.flag,
        is_nato: true,
        region: getRegionForCountry(country.code),
        timezone: getTimezoneForCountry(country.code),
      }));

      // Upsert all NATO countries
      const { error } = await supabase
        .from("countries")
        .upsert(natoData, { onConflict: "code" });

      if (error) throw error;

      toast({ 
        title: "Success", 
        description: `Synced ${natoData.length} NATO countries to database` 
      });
      
      fetchCountries();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getRegionForCountry = (code: string): string => {
    const regions: Record<string, string> = {
      US: "North America",
      CA: "North America",
      GB: "Europe",
      FR: "Europe",
      DE: "Europe",
      IT: "Europe",
      ES: "Europe",
      PL: "Europe",
      NL: "Europe",
      BE: "Europe",
      TR: "Europe",
      GR: "Europe",
      PT: "Europe",
      NO: "Europe",
      DK: "Europe",
      CZ: "Europe",
      RO: "Europe",
      BG: "Europe",
      HR: "Europe",
      SK: "Europe",
      SI: "Europe",
      LT: "Europe",
      LV: "Europe",
      EE: "Europe",
      AL: "Europe",
      ME: "Europe",
      MK: "Europe",
      IS: "Europe",
      LU: "Europe",
      FI: "Europe",
      SE: "Europe",
    };
    return regions[code] || "Europe";
  };

  const getTimezoneForCountry = (code: string): string => {
    const timezones: Record<string, string> = {
      US: "America/New_York",
      CA: "America/Toronto",
      GB: "Europe/London",
      FR: "Europe/Paris",
      DE: "Europe/Berlin",
      IT: "Europe/Rome",
      ES: "Europe/Madrid",
      PL: "Europe/Warsaw",
      NL: "Europe/Amsterdam",
      BE: "Europe/Brussels",
      TR: "Europe/Istanbul",
      GR: "Europe/Athens",
      PT: "Europe/Lisbon",
      NO: "Europe/Oslo",
      DK: "Europe/Copenhagen",
      CZ: "Europe/Prague",
      RO: "Europe/Bucharest",
      BG: "Europe/Sofia",
      HR: "Europe/Zagreb",
      SK: "Europe/Bratislava",
      SI: "Europe/Ljubljana",
      LT: "Europe/Vilnius",
      LV: "Europe/Riga",
      EE: "Europe/Tallinn",
      AL: "Europe/Tirane",
      ME: "Europe/Podgorica",
      MK: "Europe/Skopje",
      IS: "Atlantic/Reykjavik",
      LU: "Europe/Luxembourg",
      FI: "Europe/Helsinki",
      SE: "Europe/Stockholm",
    };
    return timezones[code] || "UTC";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        flag: formData.flag,
        is_nato: formData.is_nato,
        region: formData.region || null,
        timezone: formData.timezone || null,
      };

      if (editingCountry) {
        const { error } = await supabase
          .from("countries")
          .update(payload)
          .eq("code", editingCountry.code);

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
      is_nato: country.is_nato || false,
      region: country.region || "",
      timezone: country.timezone || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (code: string) => {
    if (!confirm("Are you sure you want to delete this country?")) return;

    try {
      const { error } = await supabase.from("countries").delete().eq("code", code);
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
      is_nato: false,
      region: "",
      timezone: "",
    });
  };

  const filteredCountries = countries.filter((country) => {
    const matchesSearch =
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNato =
      filterNato === "all" ||
      (filterNato === "nato" && country.is_nato) ||
      (filterNato === "non-nato" && !country.is_nato);
    return matchesSearch && matchesNato;
  });

  const natoCount = countries.filter((c) => c.is_nato).length;
  const nonNatoCount = countries.length - natoCount;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Countries Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage country profiles and NATO membership
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncNatoCountries}>
            <Globe className="w-4 h-4 mr-2" />
            Sync NATO Countries
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

      <div className="mb-4 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterNato === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterNato("all")}
          >
            All ({countries.length})
          </Button>
          <Button
            variant={filterNato === "nato" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterNato("nato")}
          >
            NATO ({natoCount})
          </Button>
          <Button
            variant={filterNato === "non-nato" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterNato("non-nato")}
          >
            Non-NATO ({nonNatoCount})
          </Button>
        </div>
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
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  NATO
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
              ) : filteredCountries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm || filterNato !== "all"
                      ? "No countries match your filters"
                      : "No countries yet. Click 'Sync NATO Countries' or 'Add Country' to get started."}
                  </td>
                </tr>
              ) : (
                filteredCountries.map((country) => (
                  <tr key={country.code}>
                    <td className="px-6 py-4 text-2xl">{country.flag}</td>
                    <td className="px-6 py-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                        {country.code}
                      </code>
                    </td>
                    <td className="px-6 py-4 font-medium">{country.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {country.region || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {country.is_nato ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          <Check className="w-3 h-3" />
                          NATO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                          <X className="w-3 h-3" />
                          Non-NATO
                        </span>
                      )}
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
                        onClick={() => handleDelete(country.code)}
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
        <DialogContent aria-describedby={undefined} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCountry ? "Edit Country" : "Add New Country"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="code">Country Code</Label>
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
                <Label htmlFor="flag">Flag Emoji</Label>
                <Input
                  id="flag"
                  value={formData.flag}
                  onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                  placeholder="e.g., 🇺🇸"
                />
              </div>

              <div>
                <Label htmlFor="region">Region</Label>
                <select
                  id="region"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select region...</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="name">Country Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., United States"
              />
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                placeholder="e.g., America/New_York"
              />
              <p className="text-xs text-gray-500 mt-1">IANA timezone identifier</p>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_nato}
                  onChange={(e) =>
                    setFormData({ ...formData, is_nato: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm">NATO Member Country</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{editingCountry ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
