import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Handshake, Mail, Phone, Globe, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SponsorshipInquiry {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  website_url: string;
  company_description: string;
  sponsorship_type: string;
  target_audience: string;
  message: string;
  preferred_start_date: string;
  status: string;
  admin_notes: string;
  contacted_at: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  negotiating: "bg-purple-100 text-purple-800",
  agreed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  closed: "bg-gray-100 text-gray-800",
};

const sponsorshipTypeLabels: Record<string, string> = {
  content_sponsorship: "Content Sponsorship",
  section_sponsorship: "Section Sponsorship",
  newsletter_sponsorship: "Newsletter Sponsorship",
  podcast_sponsorship: "Podcast / Video",
  event_sponsorship: "Event Sponsorship",
  general: "General Partnership",
};

export default function AdminSponsorshipInquiries() {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<SponsorshipInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SponsorshipInquiry | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchInquiries(); }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("sponsorship_inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setInquiries(data || []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openInquiry = (inquiry: SponsorshipInquiry) => {
    setSelected(inquiry);
    setAdminNotes(inquiry.admin_notes || "");
    setNewStatus(inquiry.status);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updates: any = {
        status: newStatus,
        admin_notes: adminNotes || null,
      };
      if (newStatus === "contacted" && !selected.contacted_at) {
        updates.contacted_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from("sponsorship_inquiries")
        .update(updates)
        .eq("id", selected.id);
      if (error) throw error;
      toast({ title: "Updated", description: "Inquiry updated successfully" });
      setSelected(null);
      fetchInquiries();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const newCount = inquiries.filter(i => i.status === "new").length;
  const activeCount = inquiries.filter(i => ["contacted", "negotiating"].includes(i.status)).length;
  const agreedCount = inquiries.filter(i => i.status === "agreed").length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Sponsorship Inquiries</h1>
        <p className="text-muted-foreground">Companies requesting sponsorship partnerships</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-blue-600">{newCount}</p>
          <p className="text-sm text-muted-foreground">New Inquiries</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-yellow-600">{activeCount}</p>
          <p className="text-sm text-muted-foreground">In Progress</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-green-600">{agreedCount}</p>
          <p className="text-sm text-muted-foreground">Agreed</p>
        </CardContent></Card>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      ) : inquiries.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Handshake className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No sponsorship inquiries yet</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openInquiry(inquiry)}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">{inquiry.company_name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusColors[inquiry.status]}`}>
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>{inquiry.contact_name}</span>
                      <span>·</span>
                      <span>{inquiry.contact_email}</span>
                      <span>·</span>
                      <span>{sponsorshipTypeLabels[inquiry.sponsorship_type] || inquiry.sponsorship_type}</span>
                      <span>·</span>
                      <span>{new Date(inquiry.created_at).toLocaleDateString("en-GB")}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{inquiry.message}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openInquiry(inquiry); }}>
                    <Eye className="w-4 h-4 mr-1" />View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent aria-describedby={undefined} className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.company_name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-6">
              {/* Company & Contact */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold text-base">Company</h4>
                  <p>{selected.company_name}</p>
                  {selected.website_url && (
                    <a href={selected.website_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline">
                      <Globe className="w-3 h-3" />{selected.website_url}
                    </a>
                  )}
                  {selected.company_description && (
                    <p className="text-muted-foreground">{selected.company_description}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-base">Contact</h4>
                  <p>{selected.contact_name}</p>
                  <a href={`mailto:${selected.contact_email}`}
                    className="flex items-center gap-1 text-blue-600 hover:underline">
                    <Mail className="w-3 h-3" />{selected.contact_email}
                  </a>
                  {selected.contact_phone && (
                    <a href={`tel:${selected.contact_phone}`}
                      className="flex items-center gap-1 text-blue-600 hover:underline">
                      <Phone className="w-3 h-3" />{selected.contact_phone}
                    </a>
                  )}
                </div>
              </div>

              {/* Sponsorship Details */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                <h4 className="font-semibold">Sponsorship Details</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Type: </span>
                    <span>{sponsorshipTypeLabels[selected.sponsorship_type]}</span>
                  </div>
                  {selected.target_audience && (
                    <div>
                      <span className="text-muted-foreground">Audience: </span>
                      <span>{selected.target_audience}</span>
                    </div>
                  )}
                  {selected.preferred_start_date && (
                    <div>
                      <span className="text-muted-foreground">Start: </span>
                      <span>{new Date(selected.preferred_start_date).toLocaleDateString("en-GB")}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Submitted: </span>
                    <span>{new Date(selected.created_at).toLocaleDateString("en-GB")}</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-muted-foreground mb-1">Message:</p>
                  <p className="whitespace-pre-wrap">{selected.message}</p>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold">Admin Actions</h4>
                <div>
                  <label className="text-sm font-medium mb-1 block">Update Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="negotiating">Negotiating</SelectItem>
                      <SelectItem value="agreed">Agreed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Admin Notes (internal)</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Notes about this inquiry, negotiation details, agreed terms..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={saving} className="flex-1">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={`mailto:${selected.contact_email}?subject=Re: Sponsorship Inquiry - Preparedness For War`}>
                      <Mail className="w-4 h-4 mr-2" />Reply by Email
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
