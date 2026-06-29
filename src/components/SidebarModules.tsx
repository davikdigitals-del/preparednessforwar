import { Link } from "react-router-dom";
import { Eye, Clock, ArrowRight, Download, BookOpen, Radio, TrendingUp, Mail } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function SidebarModules() {
  const { publishedPosts } = useData();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const mostRead = [...publishedPosts].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail("");
        setSubscribed(false);
      }, 3000);
    }
  };

  return (
    <aside className="space-y-6">
      {/* Most Read */}
      <div className="bg-white border border-gray-200">
        <div className="bg-blue-900 px-5 py-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-wide flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Most Read
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {mostRead.map((post, i) => (
            <Link
              key={post.id}
              to={`/${post.section}/${post.category}/${post.id}`}
              className="flex items-start gap-3 group hover:bg-gray-50 p-2 transition-colors"
            >
              <span className="flex-shrink-0 w-8 h-8 bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-blue-900 transition-colors mb-1">
                  {post.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-gray-500">
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

      {/* Quick Access */}
      <div className="bg-white border border-gray-200">
        <div className="bg-blue-900 px-5 py-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-wide">Quick Access</h3>
        </div>
        <div className="p-4 space-y-2">
          {[
            { icon: Download, label: "Download Checklists", to: "/resources", color: "text-blue-900" },
            { icon: BookOpen, label: "Survival Encyclopaedia", to: "/encyclopaedia", color: "text-blue-900" },
            { icon: Radio, label: "Library", to: "/library", color: "text-blue-900" },
          ].map(({ icon: Icon, label, to, color }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-gray-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className="flex-1 text-sm font-semibold text-gray-700 group-hover:text-blue-900 transition-colors">
                {label}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-900 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-white border border-gray-200">
        <div className="bg-blue-800 px-5 py-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-wide flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Newsletter
          </h3>
        </div>
        <div className="p-4">
          {subscribed ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-bold text-green-600">Successfully Subscribed!</p>
              <p className="text-xs text-gray-500 mt-1">Check your email for confirmation</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                Stay informed with the latest preparedness updates, alerts, and critical information delivered to your inbox.
              </p>
              <form onSubmit={handleSubscribe} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
                <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800 text-white">
                  Subscribe Now
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-3 text-center">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
