import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface PortalBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function PortalBreadcrumb({ items }: PortalBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-[#505a5f] mb-6 flex-wrap">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 text-[#1d70b8] hover:underline font-medium"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Member Portal</span>
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 text-[#b1b4b6]" />
          {item.to ? (
            <Link to={item.to} className="text-[#1d70b8] hover:underline font-medium">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#0b0c0c] font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
