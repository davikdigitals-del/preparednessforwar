import { Link } from "react-router-dom";
import { Eye, Clock, ArrowRight, Download, BookOpen, Radio } from "lucide-react";
import { useData } from "@/contexts/DataContext";

export function SidebarModules() {
  const { publishedPosts, alerts } = useData();

  const mostRead = [...publishedPosts].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);

  const topDirectives = publishedPosts
    .filter((p) => p.section === "directives")
    .slice(0, 3);

  return (
    <aside className="space-y-6">
      {/* Most Read */}
      <div className="sidebar-module">
        <h3 className="section-label text-alert mb-3">Most Read</h3>
        <div className="space-y-3">
          {mostRead.map((post, i) => (
            <Link
              key={post.id}
              to={`/${post.section}/${post.category}/${post.id}`}
              className="flex items-start gap-3 group"
            >
              <span className="font-display font-bold text-xl text-muted-foreground/30 w-6 text-right shrink-0">
                {i + 1}
              </span>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-alert transition-colors">
                  {post.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {(post.viewCount / 1000).toFixed(1)}k
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Latest Alerts */}
      <div className="sidebar-module border-l-2 border-alert">
        <h3 className="section-label text-alert mb-3">Latest Alerts</h3>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="block">
              <h4 className="text-sm font-semibold leading-snug line-clamp-2">
                {alert.text}
              </h4>
              <span className="text-xs text-muted-foreground mt-0.5 block capitalize">{alert.priority} priority</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="sidebar-module">
        <h3 className="section-label text-muted-foreground mb-3">Quick Access</h3>
        <div className="space-y-2">
          {[
            { icon: Download, label: "Download Checklists", to: "/resources" },
            { icon: BookOpen, label: "Survival Encyclopaedia", to: "/encyclopaedia" },
            { icon: Radio, label: "Library", to: "/library" },
          ].map(({ icon: Icon, label, to }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2 text-sm font-medium hover:text-alert transition-colors"
            >
              <Icon className="w-4 h-4 text-muted-foreground" />
              {label}
              <ArrowRight className="w-3 h-3 ml-auto" />
            </Link>
          ))}
        </div>
      </div>

      {/* Top Directives */}
      <div className="sidebar-module">
        <h3 className="section-label text-muted-foreground mb-3">Top Directives</h3>
        {topDirectives.map((post) => (
          <Link
            key={post.id}
            to={`/${post.section}/${post.category}/${post.id}`}
            className="block group mb-3 last:mb-0"
          >
            <h4 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-alert transition-colors">
              {post.title}
            </h4>
            <span className="text-xs text-muted-foreground">{post.author}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
