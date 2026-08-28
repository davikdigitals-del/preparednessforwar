import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Send, Users, TrendingUp, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailStats {
  emails_sent: number;
  reminders_sent: number;
  success_notifications: number;
  failure_notifications: number;
}

interface PendingReminder {
  id: string;
  user_email: string;
  user_name: string;
  plan_name: string;
  days_until_expiry: number;
  expires_at: string;
}

export default function AdminEmailNotifications() {
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [pendingReminders, setPendingReminders] = useState<PendingReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadEmailStats(),
        loadPendingReminders()
      ]);
    } catch (error) {
      console.error("Error loading email data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmailStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc("get_renewal_stats", { days_back: 30 });

      if (error) throw error;
      if (data && data.length > 0) {
        setEmailStats({
          emails_sent: data[0].emails_sent || 0,
          reminders_sent: data[0].reminders_sent || 0,
          success_notifications: 0, // Would need to query separately
          failure_notifications: 0  // Would need to query separately
        });
      }
    } catch (error: any) {
      console.error("Error loading email stats:", error);
    }
  };

  const loadPendingReminders = async () => {
    try {
      const { data, error } = await supabase
        .from("subscriptions_needing_reminders")
        .select("*")
        .limit(20);

      if (error) throw error;
      setPendingReminders(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const sendReminderEmails = async () => {
    setSendingReminders(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-renewal-reminders');
      
      if (error) throw error;
      
      toast({ 
        title: "Success", 
        description: `Sent ${data.sent || 0} reminder emails` 
      });
      
      // Reload data after sending
      loadData();
      
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: `Failed to send reminders: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSendingReminders(false);
    }
  };

  const sendTestEmail = async () => {
    setTestingEmail(true);
    try {
      // Send a test notification
      const { data, error } = await supabase.functions.invoke('send-payment-notifications', {
        body: {
          subscription_id: 'test-subscription',
          type: 'success'
        }
      });
      
      if (error) throw error;
      
      toast({ 
        title: "Test Email Sent", 
        description: "Check your email service logs for delivery status"
      });
      
    } catch (error: any) {
      toast({ 
        title: "Test Failed", 
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getReminderBadgeColor = (days: number) => {
    if (days <= 1) return "destructive";
    if (days <= 3) return "secondary";
    return "outline";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Mail className="w-8 h-8 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Email Notifications</h1>
          <p className="text-gray-600 mt-1">Manage subscription email reminders and notifications</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={sendTestEmail}
            disabled={testingEmail}
            variant="outline"
            className="gap-2"
          >
            {testingEmail ? (
              <Mail className="w-4 h-4 animate-pulse" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            Test Email
          </Button>
          <Button 
            onClick={sendReminderEmails}
            disabled={sendingReminders}
            className="gap-2"
          >
            {sendingReminders ? (
              <Send className="w-4 h-4 animate-pulse" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send Reminders
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {emailStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emailStats.emails_sent}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reminders Sent</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emailStats.reminders_sent}</div>
              <p className="text-xs text-muted-foreground">Renewal reminders</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Notices</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emailStats.success_notifications}</div>
              <p className="text-xs text-muted-foreground">Payment confirmations</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failure Alerts</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emailStats.failure_notifications}</div>
              <p className="text-xs text-muted-foreground">Payment failures</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending Reminders</TabsTrigger>
          <TabsTrigger value="settings">Email Settings</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Subscriptions Needing Reminders ({pendingReminders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingReminders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>No pending reminder emails</p>
                  <p className="text-sm">All users have been notified about upcoming renewals</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-semibold">
                            {reminder.user_name || reminder.user_email}
                          </div>
                          <Badge variant="outline">
                            {reminder.plan_name}
                          </Badge>
                          <Badge variant={getReminderBadgeColor(reminder.days_until_expiry)}>
                            {reminder.days_until_expiry} days left
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="mr-4">
                            Expires: {formatDate(reminder.expires_at)}
                          </span>
                          <span>
                            Email: {reminder.user_email}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {reminder.days_until_expiry <= 1 ? (
                          <div className="text-red-600 font-semibold">Urgent</div>
                        ) : reminder.days_until_expiry <= 3 ? (
                          <div className="text-orange-600 font-semibold">Soon</div>
                        ) : (
                          <div className="text-blue-600 font-semibold">Upcoming</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Environment Variables Required:</h4>
                <ul className="text-sm space-y-1">
                  <li><code>RESEND_API_KEY</code> - Your Resend API key</li>
                  <li><code>FROM_EMAIL</code> - Sender email address</li>
                  <li><code>SITE_URL</code> - Your website URL for links</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Cron Jobs Setup:</h4>
                <p className="text-sm mb-2">Add these to your Supabase project cron jobs:</p>
                <ul className="text-sm space-y-1 font-mono">
                  <li>• Renewal reminders: <code>0 9,18 * * *</code> (9 AM & 6 PM daily)</li>
                  <li>• Process renewals: <code>0 2 * * *</code> (2 AM daily)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Renewal Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>7 Days Before:</strong> Friendly heads-up</li>
                  <li>• <strong>3 Days Before:</strong> Reminder with details</li>
                  <li>• <strong>1 Day Before:</strong> Final notice</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Success:</strong> Confirmation with next billing date</li>
                  <li>• <strong>Failure:</strong> Action required with retry info</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}