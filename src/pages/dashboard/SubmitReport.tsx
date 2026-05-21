import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileText, Send, Save } from "lucide-react";
import type { ReportCategory } from "@/types/memberPortal";
import { PortalBreadcrumb } from "@/components/PortalBreadcrumb";

export default function SubmitReport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    location: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("report_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (status: 'draft' | 'pending') => {
    if (!user) return;

    if (!formData.title || !formData.content || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("member_reports").insert({
        user_id: user.id,
        title: formData.title,
        content: formData.content,
        category: formData.category,
        location: formData.location || null,
        status,
      });

      if (error) throw error;

      toast({
        title: status === 'draft' ? "Draft Saved" : "Report Submitted",
        description: status === 'draft' 
          ? "Your report has been saved as a draft" 
          : "Your report has been submitted for review",
      });

      navigate("/dashboard/my-reports");
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

  return (
    <div className="container max-w-4xl py-6 sm:py-8 px-4 sm:px-6">
      <PortalBreadcrumb items={[{ label: "Field Reports", to: "/dashboard/my-reports" }, { label: "Submit Report" }]} />
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl sm:text-4xl font-bold mb-2">Submit Field Report</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Share your observations, experiences, and intelligence with the community
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Report Details
          </CardTitle>
          <CardDescription>
            All reports are reviewed by administrators before being published
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Report Title *</Label>
            <Input
              id="title"
              placeholder="Brief, descriptive title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              placeholder="City, Region, or Coordinates"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Report Content *</Label>
            <Textarea
              id="content"
              placeholder="Provide detailed information about your observation or experience..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Be as detailed as possible. Include dates, times, and specific observations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleSubmit('pending')}
              disabled={loading}
              className="flex-1"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit for Review
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit('draft')}
              disabled={loading}
              className="sm:flex-shrink-0"
            >
              <Save className="w-4 h-4 mr-2" />
              Save as Draft
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-[#e8f0f8] border border-[#1d70b8]/30 rounded-lg">
        <h3 className="font-semibold text-[#003078] mb-2">Submission Guidelines</h3>
        <ul className="text-sm text-[#003078] space-y-1">
          <li>• Reports are reviewed within 24-48 hours</li>
          <li>• Approved reports will be published on the Community Reports page</li>
          <li>• Rejected reports will include feedback for improvement</li>
          <li>• Keep reports factual and objective</li>
          <li>• Do not include sensitive personal information</li>
        </ul>
      </div>
    </div>
  );
}
