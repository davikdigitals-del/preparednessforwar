import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Eye, Clock, Star, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { MemberReport } from "@/types/memberPortal";
import { AdminService } from "@/lib/adminService";

export default function AdminMemberReports() {
  const { toast } = useToast();
  const [reports, setReports] = useState<MemberReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<MemberReport | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("member_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from("member_reports")
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          admin_notes: adminNotes || null,
        })
        .eq("id", reportId);

      if (error) throw error;

      toast({ title: "Approved", description: "Report has been approved and published" });
      fetchReports();
      setSelectedReport(null);
      setAdminNotes("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleReject = async (reportId: string) => {
    if (!rejectionReason.trim()) {
      toast({ title: "Required", description: "Please provide a rejection reason", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from("member_reports")
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          admin_notes: adminNotes || null,
        })
        .eq("id", reportId);

      if (error) throw error;

      toast({ title: "Rejected", description: "Report has been rejected" });
      fetchReports();
      setSelectedReport(null);
      setRejectionReason("");
      setAdminNotes("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleFeatured = async (reportId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("member_reports")
        .update({ is_featured: !currentStatus })
        .eq("id", reportId);

      if (error) throw error;

      toast({ title: "Updated", description: `Report ${!currentStatus ? 'featured' : 'unfeatured'}` });
      fetchReports();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm("Permanently delete this report? This cannot be undone.")) return;
    
    try {
      console.log('Attempting to delete report with ID:', reportId);
      
      // Try the standard approach first
      const { error: standardError } = await supabase
        .from("member_reports")
        .delete()
        .eq("id", reportId);

      // If standard approach fails, try admin service
      if (standardError) {
        console.warn('Standard delete failed, trying admin service:', standardError);
        
        if (standardError.message?.includes('policy') || standardError.code === 'PGRST116') {
          // Use admin service to bypass RLS
          const adminResult = await AdminService.deleteMemberReport(reportId);
          
          if (!adminResult.success) {
            throw new Error(`Admin service failed: ${adminResult.error}`);
          }
          
          console.log('Admin service delete successful');
        } else {
          throw standardError;
        }
      } else {
        console.log('Standard delete successful');
      }

      // Update local state
      setReports(prev => prev.filter(r => r.id !== reportId));
      toast({ 
        title: "Success", 
        description: "Report deleted successfully",
        variant: "default"
      });
      
    } catch (error: any) {
      console.error('Delete operation failed:', error);
      
      let errorMessage = error.message || 'Unknown error occurred';
      let helpText = '';
      
      if (errorMessage.includes('policy') || errorMessage.includes('RLS')) {
        helpText = ' Please run SIMPLE_FIX_ADMIN_DELETE.sql in Supabase SQL Editor to fix admin permissions.';
      }
      
      toast({ 
        title: "Delete Failed", 
        description: `${errorMessage}${helpText}`, 
        variant: "destructive" 
      });
    }
  };

  const pendingReports = reports.filter(r => r.status === 'pending');
  const approvedReports = reports.filter(r => r.status === 'approved');
  const rejectedReports = reports.filter(r => r.status === 'rejected');

  const ReportCard = ({ report }: { report: MemberReport }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{report.title}</CardTitle>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
              <Badge variant="secondary">{report.category}</Badge>
              {report.location && <span>📍 {report.location}</span>}
              <span>{new Date(report.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          {report.is_featured && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{report.content}</p>
        
        {report.status === 'approved' && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {report.views_count} views
            </span>
            <span>{report.upvotes_count} upvotes</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            {report.status === 'pending' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => setSelectedReport(report)}>
                    Review
                  </Button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined} className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Review Report</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">{report.title}</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.content}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Admin Notes (Optional)</Label>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Internal notes about this report..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Rejection Reason (Required if rejecting)</Label>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why this report is being rejected..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => handleApprove(report.id)} className="flex-1">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve & Publish
                      </Button>
                      <Button variant="destructive" onClick={() => handleReject(report.id)} className="flex-1">
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {report.status === 'approved' && (
              <Button
                size="sm"
                variant={report.is_featured ? "default" : "outline"}
                onClick={() => handleToggleFeatured(report.id, report.is_featured)}
              >
                <Star className="w-4 h-4 mr-2" />
                {report.is_featured ? 'Unfeature' : 'Feature'}
              </Button>
            )}
          </div>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(report.id)}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Member Reports</h1>
        <p className="text-muted-foreground">Review and manage community field reports</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-orange-600">{pendingReports.length}</p>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">{approvedReports.length}</p>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-red-600">{rejectedReports.length}</p>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            <Clock className="w-4 h-4 mr-2" />
            Pending ({pendingReports.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            <CheckCircle className="w-4 h-4 mr-2" />
            Approved ({approvedReports.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            <XCircle className="w-4 h-4 mr-2" />
            Rejected ({rejectedReports.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingReports.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pending reports</p>
          ) : (
            pendingReports.map(report => <ReportCard key={report.id} report={report} />)
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          {approvedReports.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No approved reports</p>
          ) : (
            approvedReports.map(report => <ReportCard key={report.id} report={report} />)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          {rejectedReports.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No rejected reports</p>
          ) : (
            rejectedReports.map(report => <ReportCard key={report.id} report={report} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
