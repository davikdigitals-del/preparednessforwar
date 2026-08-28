import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Send, Settings, BarChart, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailStats {
  status: string;
  count: number;
  oldest_email?: string;
  newest_email?: string;
}

interface DailyStats {
  date: string;
  email_type: string;
  total_emails: number;
  sent_emails: number;
  failed_emails: number;
  success_rate: number;
}

export default function AdminNativeEmails() {
  const [emailStats, setEmailStats] = useState<EmailStats[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  
  // Configuration form
  const [config, setConfig] = useState({
    resend_api_key: '',
    from_email: '',
    site_url: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadEmailData();
  }, []);

  const loadEmailData = async () => {
    setLoading(true);
    try {
      // Load email queue stats
      const { data: queueStats, error: queueError } = await supabase
        .from("email_queue_stats")
        .select("*");

      if (queueError) throw queueError;
      setEmailStats(queueStats || []);

      // Load daily email stats
      const { data: dailyData, error: dailyError } = await supabase
        .from("daily_email_stats")
        .select("*")
        .limit(10);

      if (dailyError) throw dailyError;
      setDailyStats(dailyData || []);

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const queueReminders = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.rpc('queue_renewal_reminders');
      
      if (error) throw error;
      
      const result = data?.[0];
      toast({ 
        title: "Success", 
        description: `Queued ${result?.queued_count || 0} reminder emails`
      });
      
      loadEmailData();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: `Failed to queue reminders: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const processEmailQueue = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.rpc('process_email_queue');
      
      if (error) throw error;
      
      const result = data?.[0];
      toast({ 
        title: "Success", 
        description: `Processed ${result?.processed_count || 0} emails (${result?.success_count || 0} sent, ${result?.failed_count || 0} failed)`
      });
      
      loadEmailData();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: `Failed to process emails: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const configureSystem = async () => {
    if (!config.resend_api_key || !config.from_email || !config.site_url) {
      toast({ 
        title: "Error", 
        description: "Please fill in all configuration fields",
        variant: "destructive"
      });
      return;
    }

    setConfiguring(true);
    try {
      const { data, error } = await supabase.rpc('configure_email_system', {
        resend_api_key: config.resend_api_key,
        from_email: config.from_email,
        site_url: config.site_url
      });
      
      if (error) throw error;
      
      toast({ 
        title: "Success", 
        description: "Email system configured successfully"
      });
      
      // Clear the API key from form for security
      setConfig(prev => ({ ...prev, resend_api_key: '' }));
      
    } catch (error: any) {
      toast({ 
        title: "Configuration Failed", 
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setConfiguring(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'pending': return 'text-blue-600';
      case 'retry': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }