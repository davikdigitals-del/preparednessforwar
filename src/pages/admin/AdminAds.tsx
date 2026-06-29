import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Eye, MousePointer, TrendingUp, Search, CheckCircle, Clock, XCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdPurchase {
  id: string;
  title: string;
  image_url: string;
  destination_url: string;
  placement_name: string;
  placement_location: string;
  duration_type: string;
  duration_value: number;
  start_date: string;
  end_date: string;
  amount: number;
  currency: string;
  payment_status: string;
  is_active: boolean;
  impression_count: number;
  click_count: number;
  created_at: string;
  user_id: string;
}

export default function AdminAds() {
  const { toast } = useToast();
  const [ads, setAds] = useState<AdPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchAds(); }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ad_purchases")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAds(data || []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Deactivate this ad? It will be removed from the website.")) return;
    const { error } = await supabase.from("ad_purchases").update({ is_active: false }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ad deactivated" });
      fetchAds();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this ad record?")) return;
    const { error } = await supabase.from("ad_purchases").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted" });
      fetchAds();
    }
  };

  const liveAds = ads.filter(a => a.is_active && a.payment_status === "paid");
  const pendingAds = ads.filter(a => a.payment_status === "pending");
  const expiredAds = ads.filter(a => a.payment_status === "paid" && !a.is_active);

  const totalRevenue = ads.filter(a => a.payment_status === "paid").reduce((s, a) => s + a.amount, 0);
  const totalImpressions = ads.reduce((s, a) => s + a.impression_count, 0);
  const totalClicks = ads.reduce((s, a) => s + a.click_count, 0);

  const filtered = ads.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.placement_name.toLowerCase().includes(search.toLowerCase())
  );

  const AdRow = ({ ad }: { ad: AdPurchase }) => (
    <Card className="mb-3">
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          {ad.image_url && (
            <img src={ad.image_url} alt={ad.title} className="w-24 h-16 object-cover rounded border flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <h3 className="font-semibold">{ad.title}</h3>
                <a href={ad.destination_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline truncate block max-w-xs">
                  {ad.destination_url}
                </a>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {ad.payment_status === "pending" && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-400">
                    <Clock className="w-3 h-3 mr-1" />Pending Payment
                  </Badge>
                )}
                {ad.payment_status === "paid" && ad.is_active && (
                  <Badge className="bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />Live
                  </Badge>
                )}
                {ad.payment_status === "paid" && !ad.is_active && (
                  <Badge variant="secondary">Expired</Badge>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>{ad.placement_name}</span>
              <span>·</span>
              <span>{ad.duration_value} {ad.duration_type}{ad.duration_value > 1 ? "s" : ""}</span>
              <span>·</span>
              <span className="font-medium text-foreground">£{ad.amount}</span>
              {ad.start_date && (
                <>
                  <span>·</span>
                  <span>{new Date(ad.start_date).toLocaleDateString("en-GB")} → {new Date(ad.end_date).toLocaleDateString("en-GB")}</span>
                </>
              )}
            </div>
            {ad.payment_status === "paid" && (
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{ad.impression_count}</span>
                <span className="flex items-center gap-1"><MousePointer className="w-4 h-4" />{ad.click_count}</span>
                {ad.impression_count > 0 && (
                  <span>CTR: {((ad.click_count / ad.impression_count) * 100).toFixed(1)}%</span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            {ad.is_active && (
              <Button variant="outline" size="sm" onClick={() => handleDeactivate(ad.id)}>
                <XCircle className="w-4 h-4 mr-1" />Deactivate
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => handleDelete(ad.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Ad Management</h1>
        <p className="text-muted-foreground">Ads placed by members — live immediately after payment</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card><CardContent className="pt-6">
          <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-2xl font-bold">£{totalRevenue.toFixed(0)}</p>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <CheckCircle className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-2xl font-bold">{liveAds.length}</p>
          <p className="text-sm text-muted-foreground">Live Ads</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <Eye className="w-8 h-8 text-purple-600 mb-2" />
          <p className="text-2xl font-bold">{totalImpressions.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Impressions</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <MousePointer className="w-8 h-8 text-orange-600 mb-2" />
          <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Clicks</p>
        </CardContent></Card>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search ads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Tabs defaultValue="live">
        <TabsList>
          <TabsTrigger value="live">Live ({liveAds.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending Payment ({pendingAds.length})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({expiredAds.length})</TabsTrigger>
          <TabsTrigger value="all">All ({ads.length})</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        ) : (
          <>
            <TabsContent value="live" className="mt-6">
              {liveAds.length === 0 ? <p className="text-center text-muted-foreground py-8">No live ads</p>
                : liveAds.filter(a => a.title.toLowerCase().includes(search.toLowerCase())).map(a => <AdRow key={a.id} ad={a} />)}
            </TabsContent>
            <TabsContent value="pending" className="mt-6">
              {pendingAds.length === 0 ? <p className="text-center text-muted-foreground py-8">No pending ads</p>
                : pendingAds.filter(a => a.title.toLowerCase().includes(search.toLowerCase())).map(a => <AdRow key={a.id} ad={a} />)}
            </TabsContent>
            <TabsContent value="expired" className="mt-6">
              {expiredAds.length === 0 ? <p className="text-center text-muted-foreground py-8">No expired ads</p>
                : expiredAds.filter(a => a.title.toLowerCase().includes(search.toLowerCase())).map(a => <AdRow key={a.id} ad={a} />)}
            </TabsContent>
            <TabsContent value="all" className="mt-6">
              {filtered.length === 0 ? <p className="text-center text-muted-foreground py-8">No ads found</p>
                : filtered.map(a => <AdRow key={a.id} ad={a} />)}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
