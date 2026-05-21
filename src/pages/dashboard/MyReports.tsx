import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Eye, ThumbsUp, Clock, CheckCircle, XCircle, Edit, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { MemberReport } from "@/types/memberPortal";
import { PortalBreadcrumb } from "@/components/PortalBreadcrumb";

export default function MyReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<MemberReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("member_reports")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Under Review</Badge>;
      case 'draft':
        return <Badge variant="outline"><Edit className="w-3 h-3 mr-1" /> Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingReports = reports.filter(r => r.status === 'pending');
  const approvedReports = reports.filter(r => r.status === 'approved');
  const rejectedReports = reports.filter(r => r.status === 'rejected');
  const draftReports = reports.filter(r => r.status === 'draft');

  const ReportCard = ({ report }: { report: MemberReport }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{report.title}</CardTitle>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium">{report.category}</span>
              {report.location && <span>📍 {report.location}</span>}
              <span>{new Date(report.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          {getStatusBadge(report.status)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {report.content}
        </p>

        {report.status === 'approved' && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {report.views_count} views
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              {report.upvotes_count} upvotes
            </div>
          </div>
        )}

        {report.status === 'rejected' && report.rejection_reason && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800 mb-4">
            <p className="font-semibold mb-1">Rejection Reason:</p>
            <p>{report.rejection_reason}</p>
          </div>
        )}

        {report.admin_notes && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 mb-4">
            <p className="font-semibold mb-1">Admin Notes:</p>
            <p>{report.admin_notes}</p>
          </div>
        )}

        <div className="flex gap-2">
          {report.status === 'approved' && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/community-reports/${report.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Public
              </Link>
            </Button>
          )}
          {(report.status === 'draft' || report.status === 'rejected') && (
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit & Resubmit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading your reports...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <PortalBreadcrumb items={[{ label: "Field Reports", to: "/dashboard/my-reports" }, { label: "My Reports" }]} />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold mb-2">My Reports</h1>
          <p className="text-muted-foreground">
            Track and manage your submitted field reports
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/submit-report">
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{reports.length}</p>
              <p className="text-sm text-muted-foreground">Total Reports</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{approvedReports.length}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{pendingReports.length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{draftReports.length}</p>
              <p className="text-sm text-muted-foreground">Drafts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Reports Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start contributing to the community by submitting your first report
            </p>
            <Button asChild>
              <Link to="/dashboard/submit-report">
                <Plus className="w-4 h-4 mr-2" />
                Submit Your First Report
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All ({reports.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingReports.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedReports.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedReports.length})</TabsTrigger>
            <TabsTrigger value="drafts">Drafts ({draftReports.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {reports.map(report => <ReportCard key={report.id} report={report} />)}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingReports.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No pending reports</p>
            ) : (
              pendingReports.map(report => <ReportCard key={report.id} report={report} />)
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedReports.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No approved reports</p>
            ) : (
              approvedReports.map(report => <ReportCard key={report.id} report={report} />)
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedReports.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No rejected reports</p>
            ) : (
              rejectedReports.map(report => <ReportCard key={report.id} report={report} />)
            )}
          </TabsContent>

          <TabsContent value="drafts" className="space-y-4">
            {draftReports.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No draft reports</p>
            ) : (
              draftReports.map(report => <ReportCard key={report.id} report={report} />)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
