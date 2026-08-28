import { Megaphone } from "lucide-react";

interface SponsoredLabelProps {
  sponsorName?: string;
  disclosure?: string;
  className?: string;
}

export function SponsoredLabel({ 
  sponsorName, 
  disclosure = "This content is sponsored",
  className = "" 
}: SponsoredLabelProps) {
  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Megaphone className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-yellow-900 uppercase tracking-wide">
              Sponsored Content
            </span>
          </div>
          <p className="text-sm text-yellow-800">
            {disclosure}
            {sponsorName && (
              <span className="font-semibold"> by {sponsorName}</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
