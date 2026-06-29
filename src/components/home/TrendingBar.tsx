import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

interface TrendingBarProps {
  topics: { label: string; link: string }[];
}

export default function TrendingBar({ topics }: TrendingBarProps) {
  return (
    <div className="bg-foreground border-b border-border">
      <div className="container">
        <div className="flex items-center gap-4 py-2 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-white">
              Trending
            </span>
          </div>
          <div className="flex items-center gap-3">
            {topics.map((topic) => (
              <Link
                key={topic.link}
                to={topic.link}
                className="text-xs text-white/70 hover:text-white transition-colors whitespace-nowrap"
              >
                {topic.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
