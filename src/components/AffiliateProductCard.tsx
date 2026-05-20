import { ExternalLink, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AffiliateProduct } from "@/types/monetization";

interface AffiliateProductCardProps {
  product: AffiliateProduct;
  onTrackClick: (productId: string) => void;
}

export function AffiliateProductCard({ product, onTrackClick }: AffiliateProductCardProps) {
  const handleClick = () => {
    onTrackClick(product.id);
    window.open(product.affiliate_url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-900 hover:shadow-lg transition-all group">
      {/* Product Image */}
      {product.image_url && (
        <div className="aspect-square bg-gray-100 overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        <div className="mb-2">
          <span className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
            {product.category}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-900 transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {product.description}
          </p>
        )}

        {/* Price & Stats */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          {product.price && (
            <div>
              <span className="text-2xl font-bold text-gray-900">
                ${product.price}
              </span>
              <span className="text-sm text-gray-500 ml-1">{product.currency}</span>
            </div>
          )}
          
          {product.is_featured && (
            <div className="flex items-center gap-1 text-xs font-semibold text-orange-600">
              <TrendingUp className="w-4 h-4" />
              Featured
            </div>
          )}
        </div>

        {/* Affiliate Info */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>via {product.affiliate_network}</span>
            {product.commission_rate && (
              <span className="font-semibold text-green-600">
                {product.commission_rate}% commission
              </span>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <Button
          className="w-full"
          onClick={handleClick}
        >
          View Product
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>

        {/* Affiliate Disclosure */}
        <p className="text-xs text-gray-500 text-center mt-3">
          We may earn a commission from this purchase
        </p>
      </div>
    </div>
  );
}
