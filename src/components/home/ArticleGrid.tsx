import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { formatTimeAgo } from "@/data/mockData";

interface ArticleGridProps {
  posts: any[];
  columns?: number;
}

export default function ArticleGrid({ posts, columns = 3 }: ArticleGridProps) {
  const gridClass = columns === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2";

  return (
    <div className={`grid ${gridClass} gap-5`}>
      {posts.map((post) => (
        <Link
          key={post.id}
          to={`/${post.section}/${post.category}/${post.id}`}
          className="group block"
        >
          <div className="aspect-[16/9] bg-muted overflow-hidden">
            {post.image ? (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5" />
            )}
          </div>
          <h3 className="text-sm font-bold leading-snug mt-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
            <Clock className="w-2.5 h-2.5" />
            <span>{formatTimeAgo(post.publishedAt)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
