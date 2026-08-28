import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Users, Send, Loader2, CheckCircle, Eye } from "lucide-react";

export default function AdminNewsletter() {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [preview, setPreview] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    previewText: "",
    body: "",
  });

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("id, email, name, subscribed_at, is_active")
        .order("subscribed_at", { ascending: false });
      if (error) throw error;
      setSubscribers(data || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const activeSubscribers = subscribers.filter(s => s.is_active !== false);

  const buildHtml = (body: string, name = "{{name}}") => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preparedness For War Newsletter</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 32px 24px; text-align: center; border-bottom: 4px solid #dc2626;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">PREPAREDNESS FOR WAR</h1>
      <p style="color: #bfdbfe; margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">Stay Informed. Stay Prepared.</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px 24px;">
      <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${name},</p>

      <div style="color: #374151; font-size: 16px; line-height: 1.8; margin: 24px 0; white-space: pre-line;">
${body.replace(/\n/g, '<br />')}
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0;">
        <strong>Preparedness For War</strong><br />
        <a href="https://preparednessforwar.site" style="color: #1e3a8a; text-decoration: none; font-weight: 500;">Visit our website</a> • 
        <a href="https://preparednessforwar.site/unsubscribe" style="color: #1e3a8a; text-decoration: none; font-weight: 500;">Unsubscribe</a>
      </p>
      <p style="color: #9ca3af; font-size: 11px; margin: 12px 0 0 0;">
        You're receiving this because you subscribed to our newsletter.<br />
        This is an automated message, please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>`;

  const handleSend = async () => {
    if (!form.subject.trim()) {
      toast({ title: "Error", description: "Subject is required", variant: "destructive" });
      return;
    }
    if (!form.body.trim()) {
      toast({ title: "Error", description: "Email body is required", variant: "destructive" });
      return;
    }
    if (activeSubscribers.length === 0) {
      toast({ title: "No subscribers", description: "There are no active subscribers to send to.", variant: "destructive" });
      return;
    }

    if (!confirm(`Send to ${activeSubscribers.length} subscribers?`)) return;

    setSending(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const payload = {
        subject: form.subject.trim(),
        html: buildHtml(form.body),
        text: form.body.trim(),
        previewText: form.previewText.trim(),
      };

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/newsletter-send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || `HTTP ${res.status}: Failed to send`);

      setSent(true);
      toast({
        title: "Newsletter Sent!",
        description: `Successfully sent to ${result.sent} subscribers.${result.failed > 0 ? ` ${result.failed} failed.` : ''}`,
      });
      setForm({ subject: "", previewText: "", body: "" });
    } catch (err: any) {
      toast({ title: "Send Failed", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleUnsubscribe = async (id: string) => {
    await supabase.from("newsletter_subscribers").update({ is_active: false }).eq("id", id);
    toast({ title: "Unsubscribed", description: "Subscriber deactivated" });
    fetchSubscribers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this subscriber permanently?")) return;
    await supabase.from("newsletter_subscribers").delete().eq("id", id);
    toast({ title: "Deleted", description: "Subscriber removed" });
    fetchSubscribers();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Newsletter</h1>
          <p className="text-sm text-gray-500 mt-1">Send emails to your subscribers via Resend</p>
        </div>
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
          <Users className="w-5 h-5 text-blue-700" />
          <div>
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Active Subscribers</p>
            <p className="text-2xl font-black text-blue-900">{activeSubscribers.length}</p>
          </div>
        </div>
      </div>

      {/* Compose */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-900" /> Compose Newsletter
        </h2>

        <div className="space-y-4">
          <div>
            <Label>Subject Line *</Label>
            <Input
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g. This week's preparedness briefing"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Preview Text <span className="text-gray-400 font-normal">(shown in inbox)</span></Label>
            <Input
              value={form.previewText}
              onChange={e => setForm({ ...form, previewText: e.target.value })}
              placeholder="Short summary shown in email preview..."
              className="mt-1"
            />
          </div>

          <div>
            <Label>Email Body *</Label>
            <Textarea
              value={form.body}
              onChange={e => setForm({ ...form, body: e.target.value })}
              placeholder="Write your newsletter content here...&#10;&#10;You can use {{name}} to personalise with the subscriber's name."
              rows={12}
              className="mt-1 font-mono text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Use {"{{name}}"} to personalise — it will be replaced with each subscriber's name.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setPreview(!preview)}
              disabled={!form.body}
            >
              <Eye className="w-4 h-4 mr-2" />
              {preview ? "Hide Preview" : "Preview Email"}
            </Button>

            <Button
              onClick={handleSend}
              disabled={sending || !form.subject || !form.body}
              className="gap-2"
            >
              {sending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4" /> Send to {activeSubscribers.length} Subscribers</>
              )}
            </Button>
          </div>

          {sent && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm font-semibold">
              <CheckCircle className="w-4 h-4" /> Newsletter sent successfully!
            </div>
          )}
        </div>

        {/* Preview */}
        {preview && form.body && (
          <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide border-b">
              Email Preview
            </div>
            <div
              className="p-4 max-h-96 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: buildHtml(form.body, "John") }}
            />
          </div>
        )}
      </div>

      {/* Subscribers table */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-bold text-lg">Subscribers ({subscribers.length})</h2>
          <Button variant="outline" size="sm" onClick={fetchSubscribers}>Refresh</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscribed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : subscribers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No subscribers yet</td></tr>
              ) : (
                subscribers.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium">{sub.email}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{sub.name || "—"}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${sub.is_active !== false
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                        }`}>
                        {sub.is_active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right space-x-2">
                      {sub.is_active !== false && (
                        <Button size="sm" variant="ghost" onClick={() => handleUnsubscribe(sub.id)}
                          className="text-yellow-600 hover:text-yellow-700">
                          Unsubscribe
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(sub.id)}
                        className="text-red-500 hover:text-red-600">
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
