import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, CheckCircle, Info } from "lucide-react";

interface TemplateField {
  id: string;
  label: string;
  hint: string;
  type: "text" | "phone" | "contact" | "location" | "inventory_item" | "textarea";
  required: boolean;
}

interface Template {
  id: string;
  type: string;
  title: string;
  description: string;
  fields: TemplateField[];
}

interface Props {
  type: "emergency_contact" | "supply_inventory" | "bugout_plan";
  userId: string;
}

export function PreparednessPlanner({ type, userId }: Props) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplateAndResponses();
  }, [type, userId]);

  const fetchTemplateAndResponses = async () => {
    setLoading(true);
    try {
      // Get the active template for this type
      const { data: tData } = await supabase
        .from("preparedness_templates")
        .select("*")
        .eq("type", type)
        .eq("is_active", true)
        .order("sort_order")
        .limit(1)
        .single();

      if (tData) {
        setTemplate(tData);

        // Get member's existing responses
        const { data: rData } = await supabase
          .from("member_template_responses")
          .select("responses")
          .eq("user_id", userId)
          .eq("template_id", tData.id)
          .single();

        if (rData) setResponses(rData.responses || {});
      }
    } catch (_) {}
    setLoading(false);
  };

  const handleChange = (fieldId: string, value: any) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!template) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("member_template_responses").upsert({
        user_id: userId,
        template_id: template.id,
        responses,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,template_id" });

      if (error) throw error;
      setSaved(true);
      toast({ title: "Saved", description: "Your personal plan has been saved privately" });
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">Loading template...</div>;

  if (!template) return (
    <div className="py-8 text-center text-gray-400">
      <Info className="w-8 h-8 mx-auto mb-2 opacity-40" />
      <p className="text-sm">No template available yet. Check back soon.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Template description */}
      {template.description && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p>{template.description}</p>
          <p className="mt-2 text-xs text-blue-600 font-medium">🔒 Your responses are private — only you can see them.</p>
        </div>
      )}

      {/* Fields */}
      <div className="space-y-5">
        {template.fields.map((field) => (
          <FieldInput
            key={field.id}
            field={field}
            value={responses[field.id]}
            onChange={(val) => handleChange(field.id, val)}
          />
        ))}
      </div>

      {/* Save button */}
      {template.fields.length > 0 && (
        <div className="flex items-center gap-3 pt-2 border-t">
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : saved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : saved ? "Saved" : "Save My Plan"}
          </Button>
          {saved && <span className="text-sm text-green-600 font-medium">✓ Saved privately</span>}
        </div>
      )}
    </div>
  );
}

function FieldInput({ field, value, onChange }: { field: TemplateField; value: any; onChange: (v: any) => void }) {
  const v = value || {};

  return (
    <div className="space-y-1.5">
      <Label className="font-semibold text-sm flex items-center gap-1">
        {field.label}
        {field.required && <span className="text-red-500 text-xs">*</span>}
      </Label>

      {field.hint && (
        <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded px-3 py-2 leading-relaxed">
          💡 {field.hint}
        </p>
      )}

      {field.type === "text" && (
        <Input value={value || ""} onChange={e => onChange(e.target.value)} placeholder="Your answer..." />
      )}

      {field.type === "textarea" && (
        <Textarea value={value || ""} onChange={e => onChange(e.target.value)} rows={3} placeholder="Your answer..." />
      )}

      {field.type === "phone" && (
        <Input type="tel" value={value || ""} onChange={e => onChange(e.target.value)} placeholder="e.g., 07700 900000" />
      )}

      {field.type === "contact" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Input value={v.name || ""} onChange={e => onChange({ ...v, name: e.target.value })} placeholder="Full name" />
          <Input type="tel" value={v.phone || ""} onChange={e => onChange({ ...v, phone: e.target.value })} placeholder="Phone number" />
        </div>
      )}

      {field.type === "location" && (
        <div className="space-y-2">
          <Input value={v.name || ""} onChange={e => onChange({ ...v, name: e.target.value })} placeholder="Place name (e.g., Central Library)" />
          <Input value={v.address || ""} onChange={e => onChange({ ...v, address: e.target.value })} placeholder="Full address" />
        </div>
      )}

      {field.type === "inventory_item" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Input value={v.item || ""} onChange={e => onChange({ ...v, item: e.target.value })} placeholder="Item / brand" />
          <Input value={v.quantity || ""} onChange={e => onChange({ ...v, quantity: e.target.value })} placeholder="Quantity" />
          <Input type="date" value={v.expiry || ""} onChange={e => onChange({ ...v, expiry: e.target.value })} title="Expiry date" />
        </div>
      )}
    </div>
  );
}
