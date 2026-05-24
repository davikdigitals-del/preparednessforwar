import { useState } from "react";
import { ExternalLink, TrendingUp, Star, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { AffiliateProduct } from "@/types/monetization";

interface AffiliateProductCardProps {
  product: AffiliateProduct;
  onTrackClick: (productId: string) => void;
}

export function AffiliateProductCard({ product, onTrackClick }: AffiliateProductCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleBuyClick = () => {
    onTrackClick(product.id);
    window.open(product.affiliate_url, "_blank", "noopener,noreferrer");
  };

  const currencySymbol = product.currency === "GBP" ? "£" : product.currency === "EUR" ? "â‚¬" : "$";

  return (
    <>
      {/* Card */}
      <div
        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer group"
        onClick={() => setPreviewOpen(true)}
      >
        {/* Image */}
        <div className="aspect-square bg-gray-100 overflow-hidden relative">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <TrendingUp className="w-12 h-12" />
            </div>
          )}
          {product.is_featured && (
            <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              FEATURED
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          <p className="text-[10px] font-bold text-blue-900 uppercase tracking-wide mb-1">{product.category}</p>
          <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-2 group-hover:text-blue-900 transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>
          )}
          <div className="flex items-center justify-between">
            {product.price ? (
              <span className="text-lg font-bold text-gray-900">{currencySymbol}{product.price}</span>
            ) : (
              <span className="text-sm text-gray-400">Price on site</span>
            )}
            <span className="text-[10px] text-gray-400">via {product.affiliate_network}</span>
          </div>
        </div>
      </div>

      {/* Product Preview Modal */}
      <ProductPreviewModal
        product={product}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onBuy={handleBuyClick}
        currencySymbol={currencySymbol}
      />
    </>
  );
}

/* â”€â”€ Product Preview Modal â”€â”€ */
function ProductPreviewModal({
  product, open, onClose, onBuy, currencySymbol,
}: {
  product: AffiliateProduct;
  open: boolean;
  onClose: () => void;
  onBuy: () => void;
  currencySymbol: string;
}) {
  const [activeImg, setActiveImg] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // Build image gallery â€” use images array if available, else just image_url
  const images: string[] = (product as any).images?.length
    ? (product as any).images
    : product.image_url ? [product.image_url] : [];

  const videoUrl = (product as any).video_url || "";

  const prev = () => setActiveImg(i => (i - 1 + images.length) % images.length);
  const next = () => setActiveImg(i => (i + 1) % images.length);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden max-h-[95vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* Left â€” Image/Video Gallery */}
          <div className="bg-gray-50 p-4 flex flex-col gap-3">
            {/* Main image/video */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
              {videoPlaying && videoUrl ? (
                <video src={videoUrl} controls autoPlay className="w-full h-full object-contain" />
              ) : images.length > 0 ? (
                <img src={images[activeImg]} alt={product.name} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">No image</div>
              )}

              {/* Prev/Next arrows */}
              {images.length > 1 && !videoPlaying && (
                <>
                  <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow hover:bg-white">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow hover:bg-white">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Video play button */}
              {videoUrl && !videoPlaying && (
                <button
                  onClick={() => setVideoPlaying(true)}
                  className="absolute bottom-2 right-2 bg-blue-900 text-white rounded-full p-2 shadow-lg hover:bg-blue-800"
                >
                  <Play className="w-4 h-4 fill-white" />
                </button>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveImg(i); setVideoPlaying(false); }}
                    className={`w-14 h-14 shrink-0 rounded border-2 overflow-hidden transition-all ${activeImg === i ? 'border-blue-900' : 'border-gray-200'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                {videoUrl && (
                  <button
                    onClick={() => setVideoPlaying(true)}
                    className={`w-14 h-14 shrink-0 rounded border-2 overflow-hidden bg-gray-800 flex items-center justify-center transition-all ${videoPlaying ? 'border-blue-900' : 'border-gray-200'}`}
                  >
                    <Play className="w-5 h-5 text-white fill-white" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right â€” Product Details */}
          <div className="p-5 flex flex-col gap-4">
            {/* Category */}
            <div>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wide bg-blue-50 px-2 py-1 rounded">
                {product.category}
              </span>
            </div>

            {/* Title */}
            <h2 className="font-bold text-xl leading-snug">{product.name}</h2>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              {product.price ? (
                <span className="text-3xl font-black text-gray-900">
                  {currencySymbol}{product.price}
                </span>
              ) : (
                <span className="text-lg text-gray-500">Check price on site</span>
              )}
              {product.is_featured && (
                <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                  <Star className="w-3 h-3 fill-orange-500" /> Featured
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-1">About this product</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description.split(' | ').map((line, i) => (
                    <span key={i} className="block mb-1">â€¢ {line}</span>
                  ))}
                </p>
              </div>
            )}

            {/* Network */}
            <div className="text-xs text-gray-400 border-t pt-3">
              Available via <span className="font-semibold capitalize">{product.affiliate_network}</span>
            </div>

            {/* CTA */}
            <Button size="lg" className="w-full mt-auto" onClick={onBuy}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Buy Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
