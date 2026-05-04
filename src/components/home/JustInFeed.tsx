import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { formatTimeAgo } from "@/data/mockData";

interface JustInFeedProps {
  posts: any[];
}

export default function JustInFeed({ posts }: JustInFeedProps) {
  return (
    <div className="bg-white border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-foreground">
        <Clock className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-black uppercase tracking-widest text-white">
          Just In
        </span>
      </div>
      <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/${post.section}/${post.category}/${post.id}`}
            className="block px-4 py-3 hover:bg-primary/5 transition-colors group"
          >
            <h4 className="text-xs font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h4>
            <span className="text-[10px] text-muted-foreground mt-1 block">
              {formatTimeAgo(post.publishedAt)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
