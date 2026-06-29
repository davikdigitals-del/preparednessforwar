import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Flag, CheckCircle, XCircle, Trash2, Eye, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Report {
  id: string;
  type: string;
  reason: string;
  description: string;
  status: string;
  priority: string;
  reported_item_id: string;
  reported_by: string;
  created_at: string;
  resolved_at: string | null;
  reporter?: { email: string; name: string };
  post?: { title: string; section: string; category: string };
}

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch reporter profiles and post titles separately
      const enriched = await Promise.all((data || []).map(async (report) => {
        const [profileRes, postRes] = await Promise.all([
          supabase.from("profiles").select("email, name").eq("id", report.reported_by).single(),
          report.type === "post" && report.reported_item_id
            ? supabase.from("posts").select("title, section, category").eq("id", report.reported_item_id).single()
            : Promise.resolve({ data: null }),
        ]);
        return {
          ...report,
          reporter: profileRes.data || undefined,
          post: postRes.data || undefined,
        };
      }));

      setReports(enriched);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (report: Report) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({ status: "resolved", resolved_at: new Date().toISOString() })
        .eq("id", report.id);
      if (error) throw error;
      toast({ title: "Report approved", description: "Marked as resolved" });
      fetchReports();
      setDetailOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDismiss = async (report: Report) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({ status: "dismissed", resolved_at: new Date().toISOString() })
        .eq("id", report.id);
      if (error) throw error;
      toast({ title: "Report dismissed" });
      fetchReports();
      setDetailOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (report: Report) => {
    if (!confirm("Delete this report permanently?")) return;
    try {
      const { error } = await supabase
        .from("reports")
        .delete()
        .eq("id", report.id);
      if (error) throw error;
      toast({ title: "Report deleted" });
      fetchReports();
      setDetailOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filtered = reports.filter((r) => {
    const matchSearch =
      r.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reporter?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.post?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pending = reports.filter((r) => r.status === "pending").length;
  const resolved = reports.filter((r) => r.status === "resolved").length;
  const dismissed = reports.filter((r) => r.status === "dismissed").length;

  const statusBadge = (status: string) => {
    if (status === "resolved") return "bg-green-100 text-green-700";
    if (status === "dismissed") return "bg-gray-100 text-gray-600";
    return "bg-orange-100 text-orange-700";
  };

  const priorityBadge = (priority: string) => {
    if (priority === "high") return "bg-red-100 text-red-700";
    if (priority === "medium") return "bg-yellow-100 text-yellow-700";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Content Reports</h1>
          <p className="text-gray-600 mt-1">Review and manage user-reported content</p>
        </div>
        <Button variant="outline" onClick={fetchReports}>
          <Flag className="w-4 h-4 mr-2" />
          Pending: {pending}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Pending</span>
            <Flag className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold">{pending}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Resolved</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{resolved}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Dismissed</span>
            <XCircle className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">{dismissed}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported Content</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reporter</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No reports found</td></tr>
              ) : (
                filtered.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium line-clamp-1 max-w-[180px]">
                        {report.post?.title || report.reason || "Unknown content"}
                      </div>
                      <div className="text-xs text-gray-400 capitalize">{report.type}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {report.reporter?.email || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[160px] line-clamp-2">
                      {report.description || report.reason}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityBadge(report.priority)}`}>
                        {report.priority || "low"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => { setSelectedReport(report); setDetailOpen(true); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {report.status === "pending" && (
                          <>
                            <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700" onClick={() => handleApprove(report)}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-gray-500" onClick={() => handleDismiss(report)}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {/* Delete always visible — even after approval */}
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(report)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Type</p>
                  <p className="font-medium capitalize">{selectedReport.type}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Status</p>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge(selectedReport.status)}`}>
                    {selectedReport.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Reporter</p>
                  <p className="font-medium">{selectedReport.reporter?.email || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Date</p>
                  <p className="font-medium">{new Date(selectedReport.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedReport.post && (
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Reported Post</p>
                  <p className="font-medium text-sm">{selectedReport.post.title}</p>
                  <Link
                    to={`/${selectedReport.post.section}/${selectedReport.post.category}/${selectedReport.reported_item_id}`}
                    target="_blank"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View post →
                  </Link>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 mb-1">Reason</p>
                <p className="text-sm bg-gray-50 rounded p-3">{selectedReport.reason}</p>
              </div>

              {selectedReport.description && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm bg-gray-50 rounded p-3">{selectedReport.description}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {selectedReport.status === "pending" && (
                  <>
                    <Button className="flex-1" onClick={() => handleApprove(selectedReport)}>
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => handleDismiss(selectedReport)}>
                      <XCircle className="w-4 h-4 mr-2" /> Dismiss
                    </Button>
                  </>
                )}
                {/* Delete always available */}
                <Button variant="destructive" onClick={() => handleDelete(selectedReport)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
