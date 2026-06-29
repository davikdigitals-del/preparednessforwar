import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, ThumbsUp, Clock, Trash2, CheckCircle, XCircle } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  author_name: string;
  author_email: string;
  post_id: string;
  post_title?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setComments(data || []);
    } catch {
      // Table may not exist yet — show empty state
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase.from("comments").update({ status }).eq("id", id);
      if (error) throw error;
      setComments(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      toast({ title: `Comment ${status}` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw error;
      setComments(prev => prev.filter(c => c.id !== id));
      toast({ title: "Comment deleted" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const total = comments.length;
  const approved = comments.filter(c => c.status === "approved").length;
  const pending = comments.filter(c => c.status === "pending").length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Comments Management</h1>
        <Button variant="outline" onClick={fetchComments}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Comments</span>
            <MessageSquare className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold">{total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Approved</span>
            <ThumbsUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold">{approved}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Pending Review</span>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold">{pending}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No Comments Yet</h3>
            <p className="text-gray-500 text-sm">Comments will appear here once users start engaging with articles.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {comments.map(comment => (
              <div key={comment.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-sm">{comment.author_name || "Anonymous"}</span>
                      {comment.author_email && <span className="text-xs text-gray-400">{comment.author_email}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        comment.status === "approved" ? "bg-green-100 text-green-700" :
                        comment.status === "rejected" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>{comment.status}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{comment.content}</p>
                    <p className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {comment.status !== "approved" && (
                      <Button variant="ghost" size="sm" onClick={() => updateStatus(comment.id, "approved")} title="Approve">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </Button>
                    )}
                    {comment.status !== "rejected" && (
                      <Button variant="ghost" size="sm" onClick={() => updateStatus(comment.id, "rejected")} title="Reject">
                        <XCircle className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => deleteComment(comment.id)} title="Delete">
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
