import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, TrendingUp, Plus, Edit, Trash2, Users, DollarSign } from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  is_active: boolean;
  created_at: string;
}

interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  payment_ref: string | null;
  subscription_plans?: {
    name: string;
    price: number;
    currency: string;
  };
}

export default function AdminSubscriptions() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "0",
    currency: "GBP",
    interval: "month",
    features: "",
    is_active: true,
  });

  useEffect(() => {
    loadData();

    // Set up real-time subscription for plans
    const plansChannel = supabase
      .channel('subscription_plans_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscription_plans'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    // Set up real-time subscription for user subscriptions
    const subsChannel = supabase
      .channel('user_subscriptions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(plansChannel);
      supabase.removeChannel(subsChannel);
    };
  }, []);

  const loadData = async () => {
    console.log("AdminSubscriptions: Loading data...");
    setLoading(true);
    
    try {
      const dataPromise = fetchData();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Data load timeout")), 8000)
      );
      
      await Promise.race([dataPromise, timeoutPromise]);
      console.log("AdminSubscriptions: Data loaded successfully");
    } catch (error) {
      console.error("AdminSubscriptions: Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch plans
      const { data: plansData, error: plansError } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price", { ascending: true });

      if (plansError) throw plansError;
      setPlans(plansData || []);

      // Fetch subscriptions without nested joins
      const { data: subsData, error: subsError } = await supabase
        .from("user_subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (subsError) throw subsError;

      // Fetch plans separately and merge
      const { data: plansForSubs } = await supabase
        .from("subscription_plans")
        .select("id, name, price, currency");

      const merged = (subsData || []).map(sub => ({
        ...sub,
        subscription_plans: (plansForSubs || []).find(p => p.id === sub.plan_id) || null,
      }));

      setSubscriptions(merged);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const planData = {
        name: formData.name,
        slug: formData.slug,
        price: parseFloat(formData.price),
        currency: formData.currency,
        interval: formData.interval,
        features: formData.features.split("\n").filter(f => f.trim()),
        is_active: formData.is_active,
      };

      if (editingPlan) {
        const { data, error } = await supabase
          .from("subscription_plans")
          .update(planData)
          .eq("id", editingPlan.id)
          .select();

        if (error) throw error;

        // If no rows returned, RLS blocked the update silently
        if (!data || data.length === 0) {
          throw new Error("Update failed: You may not have admin permissions. Please run FIX_ALL_ADMIN_PERMISSIONS.sql in Supabase.");
        }

        // Optimistically update local state immediately
        setPlans(prev => prev.map(p => p.id === editingPlan.id ? { ...p, ...planData } : p));
        toast({ title: "Success", description: "Plan updated successfully" });
      } else {
        const { data, error } = await supabase
          .from("subscription_plans")
          .insert([planData])
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          setPlans(prev => [...prev, data[0]]);
        }
        toast({ title: "Success", description: "Plan created successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      price: plan.price.toString(),
      currency: plan.currency,
      interval: plan.interval,
      features: plan.features.join("\n"),
      is_active: plan.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      const { error, count } = await supabase
        .from("subscription_plans")
        .delete({ count: "exact" })
        .eq("id", id);

      if (error) throw error;

      // count === 0 means RLS silently blocked the delete
      if (count === 0) {
        throw new Error("Delete failed: You may not have admin permissions. Please run FIX_ALL_ADMIN_PERMISSIONS.sql in Supabase.");
      }

      // Optimistically remove from local state immediately
      setPlans(prev => prev.filter(p => p.id !== id));
      toast({ title: "Success", description: "Plan deleted successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      price: "0",
      currency: "GBP",
      interval: "month",
      features: "",
      is_active: true,
    });
    setEditingPlan(null);
  };

  // Calculate stats
  const activeSubscriptions = subscriptions.filter(s => s.status === "active").length;
  const monthlyRevenue = subscriptions
    .filter(s => s.status === "active" && s.subscription_plans?.currency)
    .reduce((sum, s) => {
      const price = s.subscription_plans?.price || 0;
      return sum + price;
    }, 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Subscriptions & Revenue</h1>
          <p className="text-gray-600 mt-1">Manage subscription plans and monitor revenue</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPlan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Plan Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Premium Monthly"
                    required
                  />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="premium-monthly"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Interval</Label>
                  <Select value={formData.interval} onValueChange={(v) => setFormData({ ...formData, interval: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Features (one per line)</Label>
                <textarea
                  className="w-full min-h-[120px] px-3 py-2 border rounded-md"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Access to premium articles&#10;Exclusive videos&#10;Priority support"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <Label htmlFor="is_active" className="cursor-pointer">Active Plan</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingPlan ? "Update Plan" : "Create Plan"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Active Subscriptions</span>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold">{activeSubscriptions}</div>
            <div className="text-sm text-gray-500 mt-1">Total active users</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Monthly Revenue</span>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold">£{monthlyRevenue.toFixed(2)}</div>
            <div className="text-sm text-gray-500 mt-1">Recurring revenue</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Plans</span>
              <CreditCard className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold">{plans.length}</div>
            <div className="text-sm text-gray-500 mt-1">Available plans</div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Plans */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading plans...</div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No plans found. Create your first plan!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      <p className="text-sm text-gray-500">{plan.slug}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(plan)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(plan.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="text-2xl font-bold">
                      £{plan.price}
                    </span>
                    <span className="text-gray-500">/{plan.interval}</span>
                  </div>
                  <ul className="space-y-1 text-sm">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <span className={`text-xs px-2 py-1 rounded ${plan.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                      {plan.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading subscriptions...</div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No active subscriptions yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Plan</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Started</th>
                    <th className="text-left py-3 px-4">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-sm text-gray-500 font-mono">{sub.user_id?.slice(0, 8)}...</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{sub.subscription_plans?.name}</div>
                          <div className="text-sm text-gray-500">
                            £{sub.subscription_plans?.price}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          sub.status === "active" ? "bg-green-100 text-green-700" :
                          sub.status === "cancelled" ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(sub.started_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
