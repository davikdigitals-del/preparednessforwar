import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, UserCheck, Crown, Edit, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: string;
  email: string;
  name: string;
  country: string;
  created_at: string;
  user_subscriptions?: {
    id: string;
    status: string;
    plan_id: string;
    started_at: string;
    expires_at: string | null;
    subscription_plans: {
      name: string;
      slug: string;
    };
  }[];
}

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  interval: string;
}

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("active");
  const [expiresAt, setExpiresAt] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log("AdminMembers: Loading data...");
    setLoading(true);
    
    try {
      const dataPromise = Promise.all([fetchMembers(), fetchPlans()]);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Data load timeout")), 8000)
      );
      
      await Promise.race([dataPromise, timeoutPromise]);
      console.log("AdminMembers: Data loaded successfully");
    } catch (error) {
      console.error("AdminMembers: Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      // Fetch profiles first — only non-admin members
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "member")
        .eq("is_admin", false)
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch subscriptions separately
      const { data: subsData } = await supabase
        .from("user_subscriptions")
        .select("id, user_id, status, plan_id, started_at, expires_at");

      // Fetch plans separately
      const { data: plansData } = await supabase
        .from("subscription_plans")
        .select("id, name, slug");

      // Merge data manually
      const merged = (profilesData || []).map(profile => ({
        ...profile,
        user_subscriptions: (subsData || [])
          .filter(s => s.user_id === profile.id)
          .map(s => ({
            ...s,
            subscription_plans: (plansData || []).find(p => p.id === s.plan_id) || null,
          })),
      }));

      setMembers(merged);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .neq("slug", "free")
        .order("price", { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      console.error("Error fetching plans:", error);
    }
  };

  const handleManageSubscription = (member: Member) => {
    setSelectedMember(member);
    const currentSub = member.user_subscriptions?.[0];
    if (currentSub) {
      setSelectedPlanId(currentSub.plan_id);
      setSubscriptionStatus(currentSub.status);
      setExpiresAt(currentSub.expires_at ? new Date(currentSub.expires_at).toISOString().split('T')[0] : "");
    } else {
      setSelectedPlanId("");
      setSubscriptionStatus("active");
      setExpiresAt("");
    }
    setDialogOpen(true);
  };

  const handleSaveSubscription = async () => {
    if (!selectedMember || !selectedPlanId) {
      toast({ title: "Error", description: "Please select a plan", variant: "destructive" });
      return;
    }

    try {
      const currentSub = selectedMember.user_subscriptions?.[0];
      const subscriptionData = {
        user_id: selectedMember.id,
        plan_id: selectedPlanId,
        status: subscriptionStatus,
        expires_at: expiresAt || null,
      };

      if (currentSub) {
        // Update existing subscription
        const { error } = await supabase
          .from("user_subscriptions")
          .update(subscriptionData)
          .eq("id", currentSub.id);

        if (error) throw error;
        toast({ title: "Success", description: "Subscription updated successfully" });
      } else {
        // Create new subscription
        const { error } = await supabase
          .from("user_subscriptions")
          .insert([subscriptionData]);

        if (error) throw error;
        toast({ title: "Success", description: "Subscription created successfully" });
      }

      setDialogOpen(false);
      fetchMembers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleCancelSubscription = async () => {
    if (!selectedMember) return;

    const currentSub = selectedMember.user_subscriptions?.[0];
    if (!currentSub) return;

    if (!confirm("Are you sure you want to cancel this subscription?")) return;

    try {
      const { error } = await supabase
        .from("user_subscriptions")
        .delete()
        .eq("id", currentSub.id);

      if (error) throw error;
      toast({ title: "Success", description: "Subscription cancelled successfully" });
      setDialogOpen(false);
      fetchMembers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const premiumCount = members.filter(m => m.user_subscriptions && m.user_subscriptions.length > 0 && m.user_subscriptions[0].status === 'active').length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Members Management</h1>
          <p className="text-gray-600 mt-1">Manage member accounts and subscriptions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <UserCheck className="w-4 h-4 mr-2" />
            Total: {members.length}
          </Button>
          <Button variant="outline">
            <Crown className="w-4 h-4 mr-2" />
            Premium: {premiumCount}
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No members found
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const subscription = member.user_subscriptions?.[0];
                  const hasPremium = subscription && subscription.status === 'active';
                  
                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
                            {member.name?.[0]?.toUpperCase() || member.email?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="font-medium">{member.name || "N/A"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{member.email || "N/A"}</td>
                      <td className="px-6 py-4 text-sm">{member.country || "N/A"}</td>
                      <td className="px-6 py-4">
                        {hasPremium ? (
                          <div>
                            <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 w-fit mb-1">
                              <Crown className="w-3 h-3" />
                              {subscription.subscription_plans?.name || 'Premium'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              subscription.status === 'active' ? 'bg-green-100 text-green-700' :
                              subscription.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {subscription.status}
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            Free
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(member.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Subscription Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-semibold">{selectedMember.name}</p>
                <p className="text-xs text-gray-600">{selectedMember.email}</p>
              </div>

              <div>
                <Label>Subscription Plan</Label>
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - £{plan.price}/{plan.interval}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={subscriptionStatus} onValueChange={setSubscriptionStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Expires At (Optional)</Label>
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveSubscription} className="flex-1">
                  Save Subscription
                </Button>
                {selectedMember.user_subscriptions?.[0] && (
                  <Button
                    variant="destructive"
                    onClick={handleCancelSubscription}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
