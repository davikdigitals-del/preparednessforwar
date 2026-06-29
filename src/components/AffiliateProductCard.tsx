import { useState, useEffect } from "react";
import { ExternalLink, TrendingUp, Star, ChevronLeft, ChevronRight, Play, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { AffiliateProduct } from "@/types/monetization";
import { convertAndFormatPriceToGBPAsync, convertAndFormatPriceToGBP } from "@/utils/currency";

interface AffiliateProductCardProps {
  product: AffiliateProduct;
  onTrackClick: (productId: string) => void;
}

export function AffiliateProductCard({ product, onTrackClick }: AffiliateProductCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [priceInfo, setPriceInfo] = useState(convertAndFormatPriceToGBP(product.price, product.currency));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGoogleRate = async () => {
      if (!product.price || product.currency === 'GBP') {
        console.log('AffiliateProductCard: Skipping conversion - no price or already GBP:', { price: product.price, currency: product.currency });
        return;
      }
      
      console.log('AffiliateProductCard: Starting live rate conversion:', { 
        productName: product.name, 
        price: product.price, 
        currency: product.currency 
      });
      
      setLoading(true);
      try {
        const googlePriceInfo = await convertAndFormatPriceToGBPAsync(product.price, product.currency);
        console.log('AffiliateProductCard: Conversion result:', {
          productName: product.name,
          original: `${product.price} ${product.currency}`,
          converted: googlePriceInfo.formatted,
          usedGoogleRate: googlePriceInfo.usedGoogleRate
        });
        setPriceInfo(googlePriceInfo);
      } catch (error) {
        console.warn('AffiliateProductCard: Failed to convert price, using fallback:', error);
        // Keep the fallback rate already set in initial state
      } finally {
        setLoading(false);
      }
    };

    // Small delay to avoid hammering the API if many products load at once
    const timeoutId = setTimeout(fetchGoogleRate, Math.random() * 2000);
    return () => clearTimeout(timeoutId);
  }, [product.price, product.currency, product.name]);

  const handleBuyClick = () => {
    onTrackClick(product.id);
    window.open(product.affiliate_url, "_blank", "noopener,noreferrer");
  };

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
              onError={(e) => {
                // Fallback if main image fails to load
                const img = e.target as HTMLImageElement;
                if (product.images && product.images.length > 0 && img.src !== product.images[0]) {
                  img.src = product.images[0];
                } else if (!img.classList.contains('fallback-attempted')) {
                  img.classList.add('fallback-attempted');
                  img.style.display = 'none';
                  const fallback = img.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <TrendingUp className="w-12 h-12" />
            </div>
          )}
          {/* Fallback icon (hidden by default) */}
          <div className="fallback-icon w-full h-full flex items-center justify-center text-gray-300 absolute inset-0" style={{display: 'none'}}>
            <TrendingUp className="w-12 h-12" />
          </div>
          {product.is_featured && (
            <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              FEATURED
            </span>
          )}
          {product.images && product.images.length > 1 && (
            <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
              1/{product.images.length}
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
            {priceInfo.amount > 0 ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-gray-900">{priceInfo.formatted}</span>
                  {loading && (
                    <div className="w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                  )}
                </div>
                {priceInfo.isConverted && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Globe className="w-2.5 h-2.5" />
                    Converted from {priceInfo.originalCurrency}
                    {priceInfo.usedGoogleRate && <span className="text-green-600">• Live rate</span>}
                  </span>
                )}
              </div>
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
        priceInfo={priceInfo}
        loading={loading}
      />
    </>
  );
}

/* ── Product Preview Modal ── */
function ProductPreviewModal({
  product, open, onClose, onBuy, priceInfo, loading,
}: {
  product: AffiliateProduct;
  open: boolean;
  onClose: () => void;
  onBuy: () => void;
  priceInfo: ReturnType<typeof convertAndFormatPriceToGBPAsync> | ReturnType<typeof convertAndFormatPriceToGBP>;
  loading: boolean;
}) {
  const [activeImg, setActiveImg] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // Build gallery — prefer images array, fall back to image_url
  const images: string[] = product.images?.length
    ? product.images
    : product.image_url ? [product.image_url] : [];

  const videoUrl = product.video_url || "";
  const hasMultiple = images.length > 1 || !!videoUrl;

  const prev = () => { setActiveImg(i => (i - 1 + images.length) % images.length); setVideoPlaying(false); };
  const next = () => { setActiveImg(i => (i + 1) % images.length); setVideoPlaying(false); };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* Use a raw fixed overlay so we control sizing precisely */}
      <DialogContent className="max-w-3xl w-full p-0 gap-0 overflow-hidden rounded-xl" aria-describedby={undefined}>
        <div className="flex flex-col md:flex-row max-h-[90vh]">

          {/* ── LEFT: Gallery ── */}
          <div className="md:w-[45%] flex-shrink-0 flex flex-col bg-white border-r border-gray-100">

            {/* Main viewer — fills the panel */}
            <div className="relative flex-1 min-h-[280px] md:min-h-0 bg-gray-50 flex items-center justify-center overflow-hidden">
              {videoPlaying && videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  onError={() => {
                    console.warn('Video failed to load:', videoUrl);
                    setVideoPlaying(false);
                  }}
                />
              ) : images.length > 0 ? (
                <img
                  src={images[activeImg]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  style={{ maxHeight: "420px" }}
                  onError={(e) => {
                    console.warn('Image failed to load:', images[activeImg]);
                    // Try next image or show fallback
                    const img = e.target as HTMLImageElement;
                    if (!img.classList.contains('fallback-attempted')) {
                      img.classList.add('fallback-attempted');
                      if (activeImg < images.length - 1) {
                        setActiveImg(activeImg + 1);
                      } else {
                        // Show fallback icon
                        img.style.display = 'none';
                        const fallback = img.parentElement?.querySelector('.modal-fallback-icon') as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center text-gray-300 p-12">
                  <TrendingUp className="w-16 h-16" />
                </div>
              )}
              {/* Modal fallback icon (hidden by default) */}
              <div className="modal-fallback-icon w-full h-full flex items-center justify-center text-gray-300 absolute inset-0" style={{display: 'none'}}>
                <TrendingUp className="w-16 h-16" />
              </div>

              {/* Prev / Next arrows — only when multiple images */}
              {images.length > 1 && !videoPlaying && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}

              {/* Video play button overlay */}
              {videoUrl && !videoPlaying && (
                <button
                  onClick={() => setVideoPlaying(true)}
                  className="absolute bottom-3 right-3 bg-blue-900 hover:bg-blue-800 text-white rounded-full p-2.5 shadow-lg transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                </button>
              )}
            </div>

            {/* Thumbnail strip */}
            {hasMultiple && (
              <div className="flex gap-2 p-3 overflow-x-auto border-t border-gray-100 bg-white">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveImg(i); setVideoPlaying(false); }}
                    className={`w-14 h-14 shrink-0 rounded-md border-2 overflow-hidden transition-all ${
                      activeImg === i && !videoPlaying
                        ? "border-blue-900 ring-1 ring-blue-900"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img 
                      src={img} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Hide thumbnail if it fails to load
                        const thumbnail = e.target as HTMLImageElement;
                        thumbnail.style.opacity = '0.3';
                        thumbnail.style.pointerEvents = 'none';
                      }}
                    />
                  </button>
                ))}
                {videoUrl && (
                  <button
                    onClick={() => setVideoPlaying(true)}
                    className={`w-14 h-14 shrink-0 rounded-md border-2 overflow-hidden bg-gray-900 flex items-center justify-center transition-all ${
                      videoPlaying ? "border-blue-900 ring-1 ring-blue-900" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Play className="w-5 h-5 text-white fill-white" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT: Details ── */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Close button */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wide bg-blue-50 px-2 py-1 rounded">
                {product.category}
              </span>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 pb-5 flex flex-col gap-4 flex-1">
              {/* Title */}
              <h2 className="font-bold text-lg leading-snug text-gray-900">{product.name}</h2>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                {priceInfo.amount > 0 ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black text-gray-900">
                        {priceInfo.formatted}
                      </span>
                      {loading && (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                      )}
                    </div>
                    {priceInfo.isConverted && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Converted from {priceInfo.originalCurrency}
                        {priceInfo.originalPrice && ` (Original: ${priceInfo.originalPrice})`}
                        {priceInfo.usedGoogleRate && <span className="text-green-600 ml-1">• Live Google rate</span>}
                      </span>
                    )}
                  </div>
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
                  <h3 className="text-sm font-bold text-gray-700 mb-2">About this product</h3>
                  <div className="text-sm text-gray-600 leading-relaxed space-y-1">
                    {product.description.split(' | ').map((line, i) => (
                      <p key={i} className="flex gap-2">
                        <span className="text-gray-400 mt-0.5">•</span>
                        <span>{line.trim()}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Network */}
              <p className="text-xs text-gray-400 border-t pt-3">
                Available via <span className="font-semibold capitalize">{product.affiliate_network}</span>
              </p>

              {/* CTA */}
              <Button size="lg" className="w-full" onClick={onBuy}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Buy Now
              </Button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
