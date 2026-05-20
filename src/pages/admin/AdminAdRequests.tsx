import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, Eye, MousePointer, ExternalLink, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdRequest {
  id: string;
  title: string;
  image_url: string;
  destination_url: string;
  description: string;
  placement_name: string;
  duration_type: string;
  duration_value: number;
  start_date: string;
  end_date: string;
  amount: number;
  currency: string;
  payment_status: string;
  status: string;
  rejection_reason: string;
  admin_notes: string;
  impression_count: number;
  click_count: number;
  created_at: string;
  user_id: string;
}

export default function AdminAdRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<AdRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ad_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRequests(data || []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("ad_requests")
        .update({ status: 'approved', admin_notes: adminNotes || null, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Approved", description: "Ad is now live on the website" });
      setDialogOpen(false);
      setAdminNotes("");
      fetchRequests();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast({ title: "Required", description: "Please provide a rejection reason", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase
        .from("ad_requests")
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          admin_notes: adminNotes || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Rejected", description: "Member has been notified" });
      setDialogOpen(false);
      setRejectionReason("");
      setAdminNotes("");
      fetchRequests();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const openReview = (req: AdRequest) => {
    setSelected(req);
    setRejectionReason("");
    setAdminNotes(req.admin_notes || "");
    setDialogOpen(true);
  };

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (paymentStatus !== 'paid') return <Badge variant="outline" className="text-yellow-600 border-yellow-400">Awaiting Payment</Badge>;
    if (status === 'paid_pending_review') return <Badge variant="outline" className="text-blue-600 border-blue-400"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
    if (status === 'approved') return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
    if (status === 'rejected') return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    if (status === 'expired') return <Badge variant="secondary">Expired</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  const pending = requests.filter(r => r.status === 'paid_pending_review');
  const approved = requests.filter(r => r.status === 'approved');
  const rejected = requests.filter(r => r.status === 'rejected');
  const totalRevenue = requests.filter(r => r.payment_status === 'paid').reduce((s, r) => s + r.amount, 0);

  const RequestCard = ({ req }: { req: AdRequest }) => (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          {req.image_url && (
            <img src={req.image_url} alt={req.title} className="w-28 h-18 object-cover rounded flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold">{req.title}</h3>
              {getStatusBadge(req.status, req.payment_status)}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
              <span>{req.placement_name}</span>
              <span>{req.duration_value} {req.duration_type}{req.duration_value > 1 ? 's' : ''}</span>
              <span className="font-medium text-foreground">£{req.amount}</span>
              {req.start_date && <span>{new Date(req.start_date).toLocaleDateString('en-GB')} → {new Date(req.end_date).toLocaleDateString('en-GB')}</span>}
            </div>
            <div className="flex items-center gap-2">
              <a href={req.destination_url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />{req.destination_url.slice(0, 40)}...
              </a>
            </div>
            {req.status === 'approved' && (
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{req.impression_count}</span>
                <span className="flex items-center gap-1"><MousePointer className="w-4 h-4" />{req.click_count}</span>
              </div>
            )}
            {req.status === 'rejected' && req.rejection_reason && (
              <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded">
                Reason: {req.rejection_reason}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            {req.status === 'paid_pending_review' && (
              <Button size="sm" onClick={() => openReview(req)}>Review</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Ad Requests</h1>
        <p className="text-muted-foreground">Review and approve member-submitted advertisements</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-orange-600">{pending.length}</p>
          <p className="text-sm text-muted-foreground">Pending Review</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-green-600">{approved.length}</p>
          <p className="text-sm text-muted-foreground">Live Ads</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-red-600">{rejected.length}</p>
          <p className="text-sm text-muted-foreground">Rejected</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-blue-600">£{totalRevenue.toFixed(0)}</p>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending"><Clock className="w-4 h-4 mr-2" />Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved"><CheckCircle className="w-4 h-4 mr-2" />Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="rejected"><XCircle className="w-4 h-4 mr-2" />Rejected ({rejected.length})</TabsTrigger>
          <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
        </TabsList>

        {[
          { key: 'pending', data: pending },
          { key: 'approved', data: approved },
          { key: 'rejected', data: rejected },
          { key: 'all', data: requests },
        ].map(({ key, data }) => (
          <TabsContent key={key} value={key} className="space-y-4 mt-6">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : data.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No {key} ad requests</p>
            ) : (
              data.map(req => <RequestCard key={req.id} req={req} />)
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Ad Request</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex gap-4">
                {selected.image_url && (
                  <img src={selected.image_url} alt={selected.title} className="w-40 h-28 object-cover rounded" />
                )}
                <div className="space-y-1 text-sm">
                  <p><strong>Title:</strong> {selected.title}</p>
                  <p><strong>Placement:</strong> {selected.placement_name}</p>
                  <p><strong>Duration:</strong> {selected.duration_value} {selected.duration_type}(s)</p>
                  <p><strong>Dates:</strong> {new Date(selected.start_date).toLocaleDateString('en-GB')} → {new Date(selected.end_date).toLocaleDateString('en-GB')}</p>
                  <p><strong>Amount Paid:</strong> £{selected.amount}</p>
                  <a href={selected.destination_url} target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />View destination URL
                  </a>
                </div>
              </div>
              {selected.description && (
                <div className="p-3 bg-gray-50 rounded text-sm">
                  <p className="font-medium mb-1">Member Notes:</p>
                  <p className="text-muted-foreground">{selected.description}</p>
                </div>
              )}
              <div>
                <Label>Admin Notes (optional)</Label>
                <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={2} placeholder="Internal notes..." />
              </div>
              <div>
                <Label>Rejection Reason (required if rejecting)</Label>
                <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={2} placeholder="Explain why this ad is being rejected..." />
              </div>
              <div className="flex gap-3">
                <Button onClick={() => handleApprove(selected.id)} className="flex-1 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />Approve & Go Live
                </Button>
                <Button variant="destructive" onClick={() => handleReject(selected.id)} className="flex-1">
                  <XCircle className="w-4 h-4 mr-2" />Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
