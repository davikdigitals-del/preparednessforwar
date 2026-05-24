import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShoppingBag, Filter } from "lucide-react";
import { AffiliateProductCard } from "@/components/AffiliateProductCard";
import { AffiliateTrackingService } from "@/services/AffiliateTrackingService";
import type { AffiliateProduct } from "@/types/monetization";

export default function ShopPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const handleProductClick = async (productId: string) => {
    await AffiliateTrackingService.trackClick(
      productId,
      user?.id,
      window.location.href
    );
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("affiliate_products")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "featured":
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "popular":
          return b.click_count - a.click_count;
        default:
          return 0;
      }
    });

  const featuredProducts = products.filter(p => p.is_featured).slice(0, 4);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-900 to-green-700 text-white py-16">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Essential Survival Gear & Supplies
            </h1>
            <p className="text-xl text-green-100 mb-8">
              Curated selection of high-quality survival gear, emergency supplies, and preparedness equipment
            </p>
            <div className="flex items-center gap-2 text-sm">
              <ShoppingBag className="w-5 h-5" />
              <span>{products.length} Products Available</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display text-3xl font-bold mb-6">Featured Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <AffiliateProductCard 
                  key={product.id} 
                  product={product} 
                  onTrackClick={handleProductClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-lg">Filter Products</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="survival-gear">Survival Gear</SelectItem>
                <SelectItem value="food-supplies">Food Supplies</SelectItem>
                <SelectItem value="medical">Medical Supplies</SelectItem>
                <SelectItem value="bunker">Bunker Equipment</SelectItem>
                <SelectItem value="tools">Tools & Equipment</SelectItem>
                <SelectItem value="books">Books & Guides</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-900"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <AffiliateProductCard 
                key={product.id} 
                product={product}
                onTrackClick={handleProductClick}
              />
            ))}
          </div>
        )}

        
      </div>
    </div>
  );
}
