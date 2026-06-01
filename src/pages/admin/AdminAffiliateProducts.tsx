import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, ExternalLink, TrendingUp, MousePointer, Phone, MapPin, AlertTriangle, Link, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";
import { Checkbox } from "@/components/ui/checkbox";
import { natoCountries } from "@/data/mockData";
import type { AffiliateProduct, AffiliateProductFormData } from "@/types/monetization";

export default function AdminAffiliateProducts() {
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AffiliateProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState<AffiliateProductFormData>({
    name: "",
    description: "",
    category: "survival-gear",
    image_url: "",
    images: [],
    video_url: "",
    affiliate_url: "",
    affiliate_network: "amazon",
    commission_rate: 0,
    price: 0,
    currency: "GBP",
    is_active: true,
    is_featured: false,
    country_codes: [],
    is_emergency_supplier: false,
    supplier_phone: "",
    supplier_address: "",
    supplier_city: "",
    supplier_postcode: "",
    supplier_opening_hours: "",
    supplier_accepts_cash: true,
    supplier_coordinates: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("affiliate_products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        const { data, error } = await supabase
          .from("affiliate_products")
          .update(formData)
          .eq("id", editingProduct.id)
          .select()
          .single();

        if (error) throw error;
        // Optimistic update — replace in local list immediately
        if (data) setProducts(prev => prev.map(p => p.id === editingProduct.id ? data as AffiliateProduct : p));
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        const { data, error } = await supabase
          .from("affiliate_products")
          .insert([formData])
          .select()
          .single();

        if (error) throw error;
        // Optimistic insert — prepend to local list immediately
        if (data) setProducts(prev => [data as AffiliateProduct, ...prev]);
        toast({ title: "Success", description: "Product created successfully" });
      }

      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (product: AffiliateProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      category: product.category,
      image_url: product.image_url || "",
      images: product.images || [],
      video_url: product.video_url || "",
      affiliate_url: product.affiliate_url,
      affiliate_network: product.affiliate_network,
      commission_rate: product.commission_rate || 0,
      price: product.price || 0,
      currency: product.currency,
      is_active: product.is_active,
      is_featured: product.is_featured,
      country_codes: product.country_codes || [],
      is_emergency_supplier: (product as any).is_emergency_supplier || false,
      supplier_phone: (product as any).supplier_phone || "",
      supplier_address: (product as any).supplier_address || "",
      supplier_city: (product as any).supplier_city || "",
      supplier_postcode: (product as any).supplier_postcode || "",
      supplier_opening_hours: (product as any).supplier_opening_hours || "",
      supplier_accepts_cash: (product as any).supplier_accepts_cash ?? true,
      supplier_coordinates: (product as any).supplier_coordinates || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("affiliate_products")
        .delete()
        .eq("id", id);

      if (error) throw error;
      // Optimistic delete — remove from local list immediately
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({ title: "Success", description: "Product deleted successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setScrapeUrl("");
    setScrapedImages([]);
    setScrapedVideo("");
    setFormData({
      name: "",
      description: "",
      category: "survival-gear",
      image_url: "",
      images: [],
      video_url: "",
      affiliate_url: "",
      affiliate_network: "amazon",
      commission_rate: 0,
      price: 0,
      currency: "GBP",
      is_active: true,
      is_featured: false,
      country_codes: [],
      is_emergency_supplier: false,
      supplier_phone: "",
      supplier_address: "",
      supplier_city: "",
      supplier_postcode: "",
      supplier_opening_hours: "",
      supplier_accepts_cash: true,
      supplier_coordinates: "",
    });
  };

  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapedImages, setScrapedImages] = useState<string[]>([]);
  const [scrapedVideo, setScrapedVideo] = useState("");

  const handleScrapeUrl = async () => {
    if (!scrapeUrl.trim()) return;
    setScraping(true);

    const url = scrapeUrl.trim();
    setFormData(prev => ({ ...prev, affiliate_url: url }));

    try {
      // ── Step 1: Extract name from URL slug immediately ─────────────────────
      const isAmazon = url.includes("amazon.");
      const affiliate_network = isAmazon ? "amazon"
        : url.includes("ebay.") ? "custom"
        : url.includes("shareasale") ? "shareasale"
        : url.includes("cj.com") ? "cj" : "custom";

      // Extract product name from URL path
      const pathParts = new URL(url).pathname.split("/").filter(Boolean);
      const slugPart = pathParts.find(p => p.length > 10 && p.includes("-")) || pathParts[0] || "";
      const slugName = slugPart
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase())
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 80);

      if (slugName) {
        setFormData(prev => ({ ...prev, name: prev.name || slugName, affiliate_network }));
      }

      // ── Step 2: Fetch metadata via Supabase Edge Function ─────────────────
      let name = slugName;
      let description = "";
      let image_url = "";
      let price = 0;
      let fetchedImages: string[] = [];
      let fetchedVideo = "";

      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase.functions.invoke("scrape-product", {
          body: { url },
        });
        if (!error && data && !data.blocked) {
          name = data.name || slugName;
          description = data.description || "";
          image_url = data.image_url || data.images?.[0] || "";
          price = data.price || 0;
          if (data.images?.length > 0) {
            fetchedImages = data.images.slice(0, 8);
            setScrapedImages(fetchedImages);
          }
          if (data.video_url) {
            fetchedVideo = data.video_url;
            setScrapedVideo(fetchedVideo);
          }
          if (data.affiliate_network) {
            affiliate_network = data.affiliate_network;
          }
        }      } catch {}

      setFormData(prev => ({
        ...prev,
        affiliate_url: url,
        name: name || prev.name,
        description: description || prev.description,
        image_url: image_url || prev.image_url,
        images: fetchedImages.length > 0 ? fetchedImages : prev.images,
        video_url: fetchedVideo || prev.video_url,
        price: price || prev.price,
        affiliate_network,
      }));

      const got = [
        name && name !== slugName && "name",
        image_url && "image",
        description && "description",
        price && "price",
      ].filter(Boolean);
      toast({
        title: got.length > 0 ? "Details fetched!" : "URL saved",
        description: got.length > 0
          ? `Auto-filled: ${got.join(", ")}. Review and save.`
          : isAmazon
            ? "Amazon blocks auto-fetch. Name extracted from URL — add price & image manually."
            : "URL saved — please fill in the details manually.",
      });

    } catch {
      toast({
        title: "URL saved",
        description: "Could not auto-fetch details. Please fill in manually.",
      });
    } finally {
      setScraping(false);
    }
  };

  const toggleCountry = (countryCode: string) => {
    setFormData(prev => ({
      ...prev,
      country_codes: prev.country_codes?.includes(countryCode)
        ? prev.country_codes.filter(c => c !== countryCode)
        : [...(prev.country_codes || []), countryCode]
    }));
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = products.reduce((sum, p) => sum + p.revenue_generated, 0);
  const totalClicks = products.reduce((sum, p) => sum + p.click_count, 0);
  const totalConversions = products.reduce((sum, p) => sum + p.conversion_count, 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Affiliate Products</h1>
          <p className="text-muted-foreground mt-1">Manage affiliate products and track commissions</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
            <ExternalLink className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Clicks</p>
              <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
            </div>
            <MousePointer className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Conversions</p>
              <p className="text-2xl font-bold">{totalConversions}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold">£{totalRevenue.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No products found. Click "New Product" to add your first affiliate product.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img src={product.image_url} alt={product.name} className="w-16 h-12 object-cover rounded" />
                        )}
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.affiliate_network}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{product.category}</td>
                    <td className="px-6 py-4 text-sm font-semibold">£{product.price}</td>
                    <td className="px-6 py-4 text-sm">{product.commission_rate}%</td>
                    <td className="px-6 py-4 text-sm">{product.click_count}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">£{product.revenue_generated.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.is_active ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactive</span>
                        )}
                        {product.is_featured && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Featured</span>
                        )}
                        {(product as any).is_emergency_supplier && (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />Emergency
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Update the affiliate product details below." : "Fill in the details to add a new affiliate product."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* URL Scraper */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Label className="text-blue-900 font-semibold flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" />
                Auto-fill from URL
              </Label>
              <p className="text-xs text-blue-700 mb-3">Paste a product link and we'll fetch the details automatically</p>
              <div className="flex gap-2">
                <Input
                  placeholder="https://www.amazon.co.uk/product/..."
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  className="flex-1 bg-white"
                />
                <Button
                  type="button"
                  onClick={handleScrapeUrl}
                  disabled={scraping || !scrapeUrl.trim()}
                  className="shrink-0"
                >
                  {scraping ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Fetching...</>
                  ) : (
                    <><Link className="w-4 h-4 mr-2" /> Fetch</>
                  )}
                </Button>
              </div>
            </div>

            {/* Scraped images gallery */}
            {scrapedImages.length > 0 && (
              <div className="bg-gray-50 border rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Select main image:</p>
                <div className="flex gap-2 flex-wrap">
                  {scrapedImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: img }))}
                      className={`w-16 h-16 rounded overflow-hidden border-2 transition-all ${formData.image_url === img ? 'border-primary' : 'border-gray-200'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Scraped video preview */}
            {scrapedVideo && (
              <div className="bg-gray-50 border rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Product video found:</p>
                <video src={scrapedVideo} controls className="w-full max-h-48 rounded" />
              </div>
            )}

            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="survival-gear">Survival Gear</SelectItem>
                    <SelectItem value="food-supplies">Food Supplies</SelectItem>
                    <SelectItem value="medical">Medical Supplies</SelectItem>
                    <SelectItem value="bunker">Bunker Equipment</SelectItem>
                    <SelectItem value="tools">Tools & Equipment</SelectItem>
                    <SelectItem value="books">Books & Guides</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="affiliate_network">Affiliate Network</Label>
                <Select
                  value={formData.affiliate_network}
                  onValueChange={(value) => setFormData({ ...formData, affiliate_network: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amazon">Amazon Associates</SelectItem>
                    <SelectItem value="shareasale">ShareASale</SelectItem>
                    <SelectItem value="cj">Commission Junction</SelectItem>
                    <SelectItem value="custom">Custom/Direct</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="affiliate_url">Affiliate URL *</Label>
              <Input
                id="affiliate_url"
                type="url"
                value={formData.affiliate_url}
                onChange={(e) => setFormData({ ...formData, affiliate_url: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>

            <div>
              <FileUpload
                type="image"
                currentUrl={formData.image_url}
                onUrlChange={(url) => setFormData({ ...formData, image_url: url })}
                label="Product Image"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value="GBP"
                  onValueChange={() => {}}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GBP">£ GBP (British Pounds)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="commission_rate">Commission %</Label>
                <Input
                  id="commission_rate"
                  type="number"
                  step="0.01"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Available Countries</Label>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto bg-gray-50">
                <div className="grid grid-cols-2 gap-2">
                  {natoCountries.map((country) => (
                    <div key={country.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={`country-${country.code}`}
                        checked={formData.country_codes?.includes(country.code)}
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

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked as boolean })}
                />
                <Label htmlFor="is_featured">Featured</Label>
              </div>
            </div>

            {/* Emergency Supplier Section */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Checkbox
                  id="is_emergency_supplier"
                  checked={formData.is_emergency_supplier}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_emergency_supplier: checked as boolean })}
                />
                <Label htmlFor="is_emergency_supplier" className="font-semibold text-red-700 cursor-pointer">
                  🚨 Emergency Supplier — Show in Member Bunker (offline directory)
                </Label>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                When enabled, this supplier's contact details appear in members' offline bunker directory so they can call or visit physically when there's no internet.
              </p>

              {formData.is_emergency_supplier && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Phone Number *</Label>
                      <Input
                        value={formData.supplier_phone}
                        onChange={(e) => setFormData({ ...formData, supplier_phone: e.target.value })}
                        placeholder="0800 000 0000"
                      />
                    </div>
                    <div>
                      <Label>Opening Hours</Label>
                      <Input
                        value={formData.supplier_opening_hours}
                        onChange={(e) => setFormData({ ...formData, supplier_opening_hours: e.target.value })}
                        placeholder="Mon-Sat 9am-6pm"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Street Address</Label>
                    <Input
                      value={formData.supplier_address}
                      onChange={(e) => setFormData({ ...formData, supplier_address: e.target.value })}
                      placeholder="14 High Street"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>City</Label>
                      <Input
                        value={formData.supplier_city}
                        onChange={(e) => setFormData({ ...formData, supplier_city: e.target.value })}
                        placeholder="London"
                      />
                    </div>
                    <div>
                      <Label>Postcode</Label>
                      <Input
                        value={formData.supplier_postcode}
                        onChange={(e) => setFormData({ ...formData, supplier_postcode: e.target.value })}
                        placeholder="EC1A 1BB"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Coordinates (optional)</Label>
                    <Input
                      value={formData.supplier_coordinates}
                      onChange={(e) => setFormData({ ...formData, supplier_coordinates: e.target.value })}
                      placeholder="51.5074, -0.1278"
                    />
                    <p className="text-xs text-gray-500 mt-1">Latitude, Longitude — helps members find the location offline</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="supplier_accepts_cash"
                      checked={formData.supplier_accepts_cash}
                      onCheckedChange={(checked) => setFormData({ ...formData, supplier_accepts_cash: checked as boolean })}
                    />
                    <Label htmlFor="supplier_accepts_cash">Accepts Cash (important when card systems are down)</Label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
