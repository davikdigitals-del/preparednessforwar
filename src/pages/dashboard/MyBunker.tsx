import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { idb, STORES } from "@/services/IndexedDBService";
import {
  Shield, Users, StickyNote, ListChecks, Map,
  Package, Phone, Globe, Plus, Trash2, Edit,
  CheckCircle, AlertTriangle, Wifi, WifiOff,
  BookOpen, ShoppingCart, Star, ChevronRight,
  Save, RefreshCw
} from "lucide-react";

type Tab = "overview" | "contacts" | "inventory" | "supplies" | "bugout" | "notes" | "checklists" | "saved" | "suppliers" | "orders";

export default function MyBunker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [readinessScore, setReadinessScore] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Data states
  const [contacts, setContacts] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [bugoutPlan, setBugoutPlan] = useState<any>({});
  const [savedArticles, setSavedArticles] = useState<any[]>([]);
  const [orderQueue, setOrderQueue] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);

  useEffect(() => {
    const onOnline = () => { setIsOnline(true); syncToServer(); };
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  useEffect(() => {
    if (user) loadAllData();
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (isOnline) {
        await fetchFromServer();
      } else {
        await loadFromIndexedDB();
      }
      const score = await idb.calculateReadinessScore(user.id);
      setReadinessScore(score);
      setLastSync(new Date().toLocaleTimeString());
    } catch (e) {
      console.error("Load error:", e);
      await loadFromIndexedDB();
    } finally {
      setLoading(false);
    }
  };

  const fetchFromServer = async () => {
    if (!user) return;
    const [contactsRes, notesRes, checklistsRes, inventoryRes, bugoutRes, savedRes, ordersRes, suppliersRes] = await Promise.all([
      supabase.from("emergency_contacts").select("*").eq("user_id", user.id).order("priority", { ascending: false }),
      supabase.from("member_notes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("preparedness_checklists").select("*").eq("user_id", user.id),
      supabase.from("supply_inventory").select("*").eq("user_id", user.id).order("category"),
      supabase.from("bugout_plans").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("saved_articles").select("*").eq("user_id", user.id).order("saved_at", { ascending: false }),
      supabase.from("order_queue").select("*").eq("user_id", user.id).eq("status", "queued"),
      supabase.from("affiliate_products").select("id, name, category, description, supplier_phone, supplier_address, supplier_city, supplier_postcode, supplier_opening_hours, supplier_accepts_cash, supplier_coordinates, affiliate_url").eq("is_active", true).eq("is_emergency_supplier", true).order("name"),
    ]);

    const c = contactsRes.data || [];
    const n = notesRes.data || [];
    const ch = checklistsRes.data || [];
    const inv = inventoryRes.data || [];
    const bp = bugoutRes.data || {};
    const sa = savedRes.data || [];
    const oq = ordersRes.data || [];
    const sup = suppliersRes.data || [];

    setContacts(c); setNotes(n); setChecklists(ch); setInventory(inv);
    setBugoutPlan(bp); setSavedArticles(sa); setOrderQueue(oq); setSuppliers(sup);

    // Cache everything in IndexedDB for offline use
    await Promise.all([
      idb.setMany(STORES.CONTACTS, c.map(i => ({ ...i }))),
      idb.setMany(STORES.NOTES, n.map(i => ({ ...i }))),
      idb.setMany(STORES.CHECKLISTS, ch.map(i => ({ ...i }))),
      idb.setMany(STORES.SUPPLY_INVENTORY, inv.map(i => ({ ...i }))),
      bp?.id ? idb.saveBugoutPlan(bp) : Promise.resolve(),
      idb.setMany(STORES.SAVED_ARTICLES, sa.map(i => ({ ...i, id: i.post_id || i.id }))),
      idb.setMany(STORES.ORDER_QUEUE, oq.map(i => ({ ...i }))),
      idb.cacheSuppliers(sup),
    ]);
  };

  const loadFromIndexedDB = async () => {
    const [c, n, ch, inv, bp, sa, oq, sup] = await Promise.all([
      idb.getAll(STORES.CONTACTS),
      idb.getAll(STORES.NOTES),
      idb.getAll(STORES.CHECKLISTS),
      idb.getAll(STORES.SUPPLY_INVENTORY),
      idb.getBugoutPlan(),
      idb.getSavedArticles(),
      idb.getOrderQueue(),
      idb.getCachedSuppliers(),
    ]);
    setContacts(c); setNotes(n); setChecklists(ch); setInventory(inv);
    setBugoutPlan(bp || {}); setSavedArticles(sa); setOrderQueue(oq); setSuppliers(sup);
  };

  const syncToServer = async () => {
    const pending = await idb.getPendingSyncItems();
    for (const item of pending) {
      try {
        if (item.method === "INSERT") await supabase.from(item.table).insert(item.data);
        else if (item.method === "UPDATE") await supabase.from(item.table).update(item.data).eq("id", item.data.id);
        else if (item.method === "DELETE") await supabase.from(item.table).delete().eq("id", item.data.id);
        await idb.markSyncItemComplete(item.id);
      } catch (e) {
        await idb.markSyncItemFailed(item.id, String(e));
      }
    }
    if (pending.length > 0) {
      toast({ title: `Synced ${pending.length} offline changes` });
      await fetchFromServer();
    }
  };

  const scoreColor = readinessScore >= 75 ? "text-green-600" : readinessScore >= 50 ? "text-amber-600" : "text-red-600";
  const scoreBg = readinessScore >= 75 ? "bg-green-50 border-green-200" : readinessScore >= 50 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: "overview", label: "Overview", icon: Shield },
    { key: "contacts", label: "Emergency Contacts", icon: Users, count: contacts.length },
    { key: "inventory", label: "Supply Inventory", icon: Package, count: inventory.length },
    { key: "supplies", label: "Supplies Shop", icon: ShoppingCart },
    { key: "bugout", label: "Bug-Out Plan", icon: Map },
    { key: "notes", label: "Notes", icon: StickyNote, count: notes.length },
    { key: "checklists", label: "Checklists", icon: ListChecks, count: checklists.length },
    { key: "saved", label: "Saved Articles", icon: BookOpen, count: savedArticles.length },
    { key: "suppliers", label: "Emergency Suppliers", icon: Phone, count: suppliers.length },
    { key: "orders", label: "Order Queue", icon: ShoppingCart, count: orderQueue.length },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading your bunker...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
                <ChevronRight className="w-3 h-3" />
                <span>My Bunker</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                My Bunker
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Personal survival command centre — works offline</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded border ${isOnline ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isOnline ? "Online" : "Offline Mode"}
              </div>
              {lastSync && <span className="text-xs text-gray-400">Synced {lastSync}</span>}
              {isOnline && (
                <Button variant="outline" size="sm" onClick={loadAllData}>
                  <RefreshCw className="w-3 h-3 mr-1" />Sync
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-56 flex-shrink-0 hidden md:block">
            <nav className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm border-b border-gray-100 last:border-0 transition-colors ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Mobile tabs */}
          <div className="md:hidden w-full mb-4">
            <select
              value={activeTab}
              onChange={e => setActiveTab(e.target.value as Tab)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {tabs.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {activeTab === "overview" && <OverviewTab score={readinessScore} scoreColor={scoreColor} scoreBg={scoreBg} contacts={contacts} inventory={inventory} checklists={checklists} savedArticles={savedArticles} orderQueue={orderQueue} setActiveTab={setActiveTab} isOnline={isOnline} />}
            {activeTab === "contacts" && <ContactsTab contacts={contacts} setContacts={setContacts} user={user} isOnline={isOnline} toast={toast} />}
            {activeTab === "inventory" && <InventoryTab inventory={inventory} setInventory={setInventory} user={user} isOnline={isOnline} toast={toast} />}
            {activeTab === "supplies" && <SuppliesTab user={user} isOnline={isOnline} toast={toast} wishlist={wishlist} setWishlist={setWishlist} setOrderQueue={setOrderQueue} orderQueue={orderQueue} />}
            {activeTab === "bugout" && <BugoutTab plan={bugoutPlan} setPlan={setBugoutPlan} user={user} isOnline={isOnline} toast={toast} />}
            {activeTab === "notes" && <NotesTab notes={notes} setNotes={setNotes} user={user} isOnline={isOnline} toast={toast} />}
            {activeTab === "checklists" && <ChecklistsTab checklists={checklists} setChecklists={setChecklists} user={user} isOnline={isOnline} toast={toast} />}
            {activeTab === "saved" && <SavedArticlesTab articles={savedArticles} setSavedArticles={setSavedArticles} user={user} isOnline={isOnline} toast={toast} />}
            {activeTab === "suppliers" && <SuppliersTab suppliers={suppliers} isOnline={isOnline} />}
            {activeTab === "orders" && <OrderQueueTab orders={orderQueue} setOrderQueue={setOrderQueue} user={user} isOnline={isOnline} toast={toast} />}
          </main>
        </div>
      </div>
    </div>
  );
}

// ── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function OverviewTab({ score, scoreColor, scoreBg, contacts, inventory, checklists, savedArticles, orderQueue, setActiveTab, isOnline }: any) {
  const categories = ["water","food","medical","communication"];
  const covered = categories.filter(cat => inventory.some((i: any) => i.category === cat && i.quantity > 0));
  const totalItems = checklists.reduce((s: number, c: any) => s + (c.items?.length || 0), 0);
  const completedItems = checklists.reduce((s: number, c: any) => s + (c.items?.filter((i: any) => i.completed).length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Readiness Score */}
      <div className={`border rounded-lg p-6 ${scoreBg}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 text-lg">Readiness Score</h2>
          <span className={`text-4xl font-black ${scoreColor}`}>{score}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
          <div className={`h-3 rounded-full transition-all ${score >= 75 ? "bg-green-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${score}%` }} />
        </div>
        <p className="text-sm text-gray-600">
          {score >= 75 ? "Well prepared. Keep maintaining your supplies." : score >= 50 ? "Moderately prepared. Complete your checklists and stock up." : "Low readiness. Take action now — add contacts, supplies, and complete your bug-out plan."}
        </p>
      </div>

      {!isOnline && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
          <WifiOff className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-900">You are offline</p>
            <p className="text-sm text-orange-700 mt-0.5">All your bunker data is available. Changes will sync when you reconnect.</p>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Emergency Contacts", value: contacts.length, icon: Users, tab: "contacts", target: 3 },
          { label: "Supply Categories", value: `${covered.length}/4`, icon: Package, tab: "inventory", target: 4 },
          { label: "Checklist Progress", value: totalItems > 0 ? `${completedItems}/${totalItems}` : "0", icon: ListChecks, tab: "checklists", target: null },
          { label: "Saved Articles", value: savedArticles.length, icon: BookOpen, tab: "saved", target: null },
        ].map(s => (
          <button key={s.label} onClick={() => setActiveTab(s.tab)} className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-blue-300 hover:shadow-sm transition-all">
            <s.icon className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Action items */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Priority Actions</h3>
        <div className="space-y-3">
          {contacts.length === 0 && <ActionItem text="Add emergency contacts" to="contacts" setActiveTab={setActiveTab} />}
          {covered.length < 4 && <ActionItem text={`Stock up on: ${categories.filter(c => !covered.includes(c)).join(", ")}`} to="inventory" setActiveTab={setActiveTab} />}
          {!inventory.some((i: any) => i.category === "water") && <ActionItem text="Add water supply (target: 14 days)" to="inventory" setActiveTab={setActiveTab} />}
          {checklists.length === 0 && <ActionItem text="Create a preparedness checklist" to="checklists" setActiveTab={setActiveTab} />}
          {orderQueue.length > 0 && <ActionItem text={`${orderQueue.length} orders queued — connect to submit`} to="orders" setActiveTab={setActiveTab} urgent />}
          {contacts.length > 0 && covered.length >= 4 && checklists.length > 0 && (
            <div className="flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Good work! Keep your supplies updated regularly.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionItem({ text, to, setActiveTab, urgent }: any) {
  return (
    <button onClick={() => setActiveTab(to)} className={`w-full flex items-center justify-between p-3 rounded-lg border text-left text-sm transition-colors ${urgent ? "bg-red-50 border-red-200 text-red-800 hover:bg-red-100" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"}`}>
      <div className="flex items-center gap-2">
        <AlertTriangle className={`w-4 h-4 ${urgent ? "text-red-500" : "text-amber-500"}`} />
        {text}
      </div>
      <ChevronRight className="w-4 h-4" />
    </button>
  );
}

// ── CONTACTS TAB ─────────────────────────────────────────────────────────────
function ContactsTab({ contacts, setContacts, user, isOnline, toast }: any) {
  const [form, setForm] = useState({ name: "", relationship: "", phone: "", email: "", address: "", notes: "", priority: 0 });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name || !user) return;
    setSaving(true);
    const item = { ...form, user_id: user.id, id: `contact_${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    try {
      if (isOnline) {
        const { data, error } = await supabase.from("emergency_contacts").insert({ ...form, user_id: user.id }).select().single();
        if (error) throw error;
        setContacts([...contacts, data]);
        await idb.set(STORES.CONTACTS, data);
      } else {
        await idb.set(STORES.CONTACTS, item);
        await idb.addToSyncQueue({ type: "contact", table: "emergency_contacts", data: item, method: "INSERT" });
        setContacts([...contacts, item]);
        toast({ title: "Saved offline", description: "Will sync when connected" });
      }
      setForm({ name: "", relationship: "", phone: "", email: "", address: "", notes: "", priority: 0 });
      setAdding(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contact?")) return;
    if (isOnline) { await supabase.from("emergency_contacts").delete().eq("id", id); }
    else { await idb.addToSyncQueue({ type: "contact", table: "emergency_contacts", data: { id }, method: "DELETE" }); }
    await idb.delete(STORES.CONTACTS, id);
    setContacts(contacts.filter((c: any) => c.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">Emergency Contacts</h2>
        <Button size="sm" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4 mr-1" />Add Contact</Button>
      </div>
      {adding && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full name" /></div>
            <div><Label>Relationship</Label><Input value={form.relationship} onChange={e => setForm({...form, relationship: e.target.value})} placeholder="e.g. Spouse, Parent" /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+44 7700 000000" /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@example.com" /></div>
          </div>
          <div><Label>Address / Location</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Home address or rally point" /></div>
          <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} placeholder="Any important notes..." /></div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} size="sm"><Save className="w-4 h-4 mr-1" />{saving ? "Saving..." : "Save"}</Button>
            <Button variant="outline" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {contacts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No emergency contacts yet. Add contacts for family, friends, and rally points.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((c: any) => (
            <div key={c.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{c.name}</h3>
                  {c.relationship && <p className="text-sm text-gray-500">{c.relationship}</p>}
                  <div className="mt-2 space-y-1 text-sm">
                    {c.phone && <p className="flex items-center gap-2"><Phone className="w-3 h-3 text-gray-400" /><a href={`tel:${c.phone}`} className="text-blue-600 hover:underline">{c.phone}</a></p>}
                    {c.email && <p className="text-gray-600">{c.email}</p>}
                    {c.address && <p className="text-gray-600">{c.address}</p>}
                    {c.notes && <p className="text-gray-500 italic">{c.notes}</p>}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── INVENTORY TAB ─────────────────────────────────────────────────────────────
function InventoryTab({ inventory, setInventory, user, isOnline, toast }: any) {
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ category: "water", item_name: "", quantity: "", unit: "litres", target_quantity: "", notes: "" });

  const categories = [
    { value: "water", label: "💧 Water", target: "14 days supply" },
    { value: "food", label: "🥫 Food", target: "30 days supply" },
    { value: "medical", label: "🏥 Medical", target: "Full first aid kit" },
    { value: "fuel", label: "⛽ Fuel", target: "Full tank + 20L reserve" },
    { value: "communication", label: "📻 Communication", target: "Radio + batteries" },
    { value: "shelter", label: "🏕️ Shelter", target: "Tent + sleeping bags" },
    { value: "documents", label: "📄 Documents", target: "All IDs + copies" },
    { value: "clothing", label: "👕 Clothing", target: "7 days per person" },
    { value: "weapons", label: "🔒 Security", target: "As applicable" },
    { value: "other", label: "📦 Other", target: "" },
  ];

  const grouped = categories.map(cat => ({
    ...cat,
    items: inventory.filter((i: any) => i.category === cat.value),
  }));

  const handleSave = async () => {
    if (!form.item_name || !user) return;
    setSaving(true);
    const item = { ...form, quantity: parseFloat(form.quantity) || 0, target_quantity: parseFloat(form.target_quantity) || null, user_id: user.id, id: `inv_${Date.now()}`, created_at: new Date().toISOString(), last_updated: new Date().toISOString() };
    try {
      if (isOnline) {
        const { data, error } = await supabase.from("supply_inventory").insert({ ...form, quantity: parseFloat(form.quantity) || 0, target_quantity: parseFloat(form.target_quantity) || null, user_id: user.id }).select().single();
        if (error) throw error;
        setInventory([...inventory, data]);
        await idb.saveSupplyItem(data);
      } else {
        await idb.saveSupplyItem(item);
        await idb.addToSyncQueue({ type: "inventory", table: "supply_inventory", data: item, method: "INSERT" });
        setInventory([...inventory, item]);
        toast({ title: "Saved offline", description: "Will sync when connected" });
      }
      setForm({ category: "water", item_name: "", quantity: "", unit: "litres", target_quantity: "", notes: "" });
      setAdding(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (isOnline) await supabase.from("supply_inventory").delete().eq("id", id);
    else await idb.addToSyncQueue({ type: "inventory", table: "supply_inventory", data: { id }, method: "DELETE" });
    await idb.delete(STORES.SUPPLY_INVENTORY, id);
    setInventory(inventory.filter((i: any) => i.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">Supply Inventory</h2>
        <Button size="sm" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4 mr-1" />Add Item</Button>
      </div>
      {adding && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div><Label>Item Name *</Label><Input value={form.item_name} onChange={e => setForm({...form, item_name: e.target.value})} placeholder="e.g. Bottled water" /></div>
            <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="0" /></div>
            <div><Label>Unit</Label><Input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} placeholder="litres, days, kg, units" /></div>
            <div><Label>Target Quantity</Label><Input type="number" value={form.target_quantity} onChange={e => setForm({...form, target_quantity: e.target.value})} placeholder="Goal amount" /></div>
            <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Expiry date, location..." /></div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} size="sm"><Save className="w-4 h-4 mr-1" />{saving ? "Saving..." : "Save"}</Button>
            <Button variant="outline" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {grouped.filter(g => g.items.length > 0).map(group => (
          <div key={group.value} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h3 className="font-semibold text-sm text-gray-700">{group.label}</h3>
              {group.target && <p className="text-xs text-gray-400">Target: {group.target}</p>}
            </div>
            <div className="divide-y divide-gray-100">
              {group.items.map((item: any) => {
                const pct = item.target_quantity ? Math.min((item.quantity / item.target_quantity) * 100, 100) : null;
                return (
                  <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{item.item_name}</p>
                      <p className="text-xs text-gray-500">{item.quantity} {item.unit}{item.target_quantity ? ` / ${item.target_quantity} ${item.unit}` : ""}</p>
                      {pct !== null && (
                        <div className="mt-1 w-32 bg-gray-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${pct >= 75 ? "bg-green-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
                        </div>
                      )}
                      {item.notes && <p className="text-xs text-gray-400 mt-0.5">{item.notes}</p>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {inventory.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No supplies tracked yet. Start adding your inventory.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── BUGOUT TAB ────────────────────────────────────────────────────────────────
function BugoutTab({ plan, setPlan, user, isOnline, toast }: any) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ primary_route: "", secondary_route: "", rally_point_1: "", rally_point_1_coords: "", rally_point_2: "", rally_point_2_coords: "", destination: "", destination_coords: "", vehicle_info: "", fuel_plan: "", communication_plan: "", notes: "" });

  useEffect(() => { if (plan) setForm({ primary_route: plan.primary_route || "", secondary_route: plan.secondary_route || "", rally_point_1: plan.rally_point_1 || "", rally_point_1_coords: plan.rally_point_1_coords || "", rally_point_2: plan.rally_point_2 || "", rally_point_2_coords: plan.rally_point_2_coords || "", destination: plan.destination || "", destination_coords: plan.destination_coords || "", vehicle_info: plan.vehicle_info || "", fuel_plan: plan.fuel_plan || "", communication_plan: plan.communication_plan || "", notes: plan.notes || "" }); }, [plan]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (isOnline) {
        if (plan?.id) {
          await supabase.from("bugout_plans").update(form).eq("id", plan.id);
        } else {
          const { data } = await supabase.from("bugout_plans").insert({ ...form, user_id: user.id }).select().single();
          setPlan(data);
        }
      } else {
        await idb.saveBugoutPlan({ ...form, id: plan?.id || "bugout_plan", user_id: user.id });
        await idb.addToSyncQueue({ type: "bugout", table: "bugout_plans", data: { ...form, user_id: user.id, id: plan?.id }, method: plan?.id ? "UPDATE" : "INSERT" });
        toast({ title: "Saved offline", description: "Will sync when connected" });
      }
      toast({ title: "Bug-out plan saved" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const Field = ({ label, field, placeholder, multiline }: any) => (
    <div>
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      {multiline
        ? <Textarea value={(form as any)[field]} onChange={e => setForm({...form, [field]: e.target.value})} placeholder={placeholder} rows={3} className="mt-1" />
        : <Input value={(form as any)[field]} onChange={e => setForm({...form, [field]: e.target.value})} placeholder={placeholder} className="mt-1" />
      }
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">Bug-Out Plan</h2>
        <Button size="sm" onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-1" />{saving ? "Saving..." : "Save Plan"}</Button>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-5">
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">Routes</h3>
          <div className="space-y-3">
            <Field label="Primary Route" field="primary_route" placeholder="Main evacuation route description..." multiline />
            <Field label="Secondary Route (Backup)" field="secondary_route" placeholder="Alternative route if primary is blocked..." multiline />
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">Rally Points</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Rally Point 1" field="rally_point_1" placeholder="Location name or address" />
            <Field label="Coordinates 1" field="rally_point_1_coords" placeholder="e.g. 51.5074, -0.1278" />
            <Field label="Rally Point 2" field="rally_point_2" placeholder="Backup rally location" />
            <Field label="Coordinates 2" field="rally_point_2_coords" placeholder="e.g. 51.5074, -0.1278" />
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">Destination</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Final Destination" field="destination" placeholder="Safe house, bunker, family location..." />
            <Field label="Destination Coordinates" field="destination_coords" placeholder="e.g. 51.5074, -0.1278" />
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">Logistics</h3>
          <div className="space-y-3">
            <Field label="Vehicle Information" field="vehicle_info" placeholder="Vehicle type, registration, fuel type, range..." />
            <Field label="Fuel Plan" field="fuel_plan" placeholder="Fuel stops, reserve cans, alternative transport..." />
            <Field label="Communication Plan" field="communication_plan" placeholder="Radio frequencies, check-in times, code words..." />
            <Field label="Additional Notes" field="notes" placeholder="Any other important information..." multiline />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── NOTES TAB ─────────────────────────────────────────────────────────────────
function NotesTab({ notes, setNotes, user, isOnline, toast }: any) {
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "" });

  const handleSave = async () => {
    if (!form.title || !user) return;
    setSaving(true);
    const item = { ...form, user_id: user.id, id: `note_${Date.now()}`, is_pinned: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    try {
      if (isOnline) {
        const { data, error } = await supabase.from("member_notes").insert({ ...form, user_id: user.id }).select().single();
        if (error) throw error;
        setNotes([data, ...notes]);
        await idb.set(STORES.NOTES, data);
      } else {
        await idb.set(STORES.NOTES, item);
        await idb.addToSyncQueue({ type: "note", table: "member_notes", data: item, method: "INSERT" });
        setNotes([item, ...notes]);
        toast({ title: "Saved offline" });
      }
      setForm({ title: "", content: "", category: "" });
      setAdding(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    if (isOnline) await supabase.from("member_notes").delete().eq("id", id);
    else await idb.addToSyncQueue({ type: "note", table: "member_notes", data: { id }, method: "DELETE" });
    await idb.delete(STORES.NOTES, id);
    setNotes(notes.filter((n: any) => n.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">Personal Notes</h2>
        <Button size="sm" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4 mr-1" />New Note</Button>
      </div>
      {adding && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
          <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Note title" /></div>
          <div><Label>Category</Label><Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="e.g. Medical, Security, Contacts" /></div>
          <div><Label>Content</Label><Textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={5} placeholder="Write your note..." /></div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} size="sm"><Save className="w-4 h-4 mr-1" />{saving ? "Saving..." : "Save"}</Button>
            <Button variant="outline" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {notes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <StickyNote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No notes yet. Document your plans and observations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note: any) => (
            <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{note.title}</h3>
                  {note.category && <Badge variant="secondary" className="text-xs mt-1">{note.category}</Badge>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(note.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
              </div>
              <p className="text-sm text-gray-600 line-clamp-4 whitespace-pre-wrap">{note.content}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(note.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── CHECKLISTS TAB ────────────────────────────────────────────────────────────
function ChecklistsTab({ checklists, setChecklists, user, isOnline, toast }: any) {
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "" });
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});

  const handleCreateChecklist = async () => {
    if (!form.title || !user) return;
    setSaving(true);
    const item = { ...form, user_id: user.id, id: `cl_${Date.now()}`, items: [], is_template: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    try {
      if (isOnline) {
        const { data, error } = await supabase.from("preparedness_checklists").insert({ ...form, user_id: user.id, items: [] }).select().single();
        if (error) throw error;
        setChecklists([...checklists, data]);
        await idb.set(STORES.CHECKLISTS, data);
      } else {
        await idb.set(STORES.CHECKLISTS, item);
        await idb.addToSyncQueue({ type: "checklist", table: "preparedness_checklists", data: item, method: "INSERT" });
        setChecklists([...checklists, item]);
        toast({ title: "Saved offline" });
      }
      setForm({ title: "", description: "", category: "" });
      setAdding(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const toggleItem = async (checklistId: string, itemId: string) => {
    const cl = checklists.find((c: any) => c.id === checklistId);
    if (!cl) return;
    const updatedItems = cl.items.map((i: any) => i.id === itemId ? { ...i, completed: !i.completed } : i);
    const updated = { ...cl, items: updatedItems };
    if (isOnline) await supabase.from("preparedness_checklists").update({ items: updatedItems }).eq("id", checklistId);
    else await idb.addToSyncQueue({ type: "checklist", table: "preparedness_checklists", data: { id: checklistId, items: updatedItems }, method: "UPDATE" });
    await idb.set(STORES.CHECKLISTS, updated);
    setChecklists(checklists.map((c: any) => c.id === checklistId ? updated : c));
  };

  const addItem = async (checklistId: string) => {
    const text = newItemText[checklistId]?.trim();
    if (!text) return;
    const cl = checklists.find((c: any) => c.id === checklistId);
    if (!cl) return;
    const newItem = { id: `item_${Date.now()}`, text, completed: false, priority: "medium" };
    const updatedItems = [...(cl.items || []), newItem];
    const updated = { ...cl, items: updatedItems };
    if (isOnline) await supabase.from("preparedness_checklists").update({ items: updatedItems }).eq("id", checklistId);
    else await idb.addToSyncQueue({ type: "checklist", table: "preparedness_checklists", data: { id: checklistId, items: updatedItems }, method: "UPDATE" });
    await idb.set(STORES.CHECKLISTS, updated);
    setChecklists(checklists.map((c: any) => c.id === checklistId ? updated : c));
    setNewItemText({ ...newItemText, [checklistId]: "" });
  };

  const deleteChecklist = async (id: string) => {
    if (!confirm("Delete this checklist?")) return;
    if (isOnline) await supabase.from("preparedness_checklists").delete().eq("id", id);
    else await idb.addToSyncQueue({ type: "checklist", table: "preparedness_checklists", data: { id }, method: "DELETE" });
    await idb.delete(STORES.CHECKLISTS, id);
    setChecklists(checklists.filter((c: any) => c.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">Preparedness Checklists</h2>
        <Button size="sm" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4 mr-1" />New Checklist</Button>
      </div>
      {adding && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
          <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. 72-Hour Bug-Out Bag" /></div>
          <div><Label>Category</Label><Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="e.g. Evacuation, Medical, Home" /></div>
          <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief description..." /></div>
          <div className="flex gap-2">
            <Button onClick={handleCreateChecklist} disabled={saving} size="sm"><Save className="w-4 h-4 mr-1" />{saving ? "Saving..." : "Create"}</Button>
            <Button variant="outline" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {checklists.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <ListChecks className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No checklists yet. Create checklists to track your preparedness tasks.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {checklists.map((cl: any) => {
            const items = cl.items || [];
            const done = items.filter((i: any) => i.completed).length;
            const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
            return (
              <div key={cl.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{cl.title}</h3>
                    {cl.description && <p className="text-xs text-gray-500">{cl.description}</p>}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">{done}/{items.length} completed</span>
                      <div className="w-24 bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${pct === 100 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteChecklist(cl.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                </div>
                <div className="p-4 space-y-2">
                  {items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <Checkbox checked={item.completed} onCheckedChange={() => toggleItem(cl.id, item.id)} />
                      <span className={`text-sm ${item.completed ? "line-through text-gray-400" : "text-gray-700"}`}>{item.text}</span>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <Input
                      value={newItemText[cl.id] || ""}
                      onChange={e => setNewItemText({ ...newItemText, [cl.id]: e.target.value })}
                      onKeyDown={e => e.key === "Enter" && addItem(cl.id)}
                      placeholder="Add item..."
                      className="text-sm h-8"
                    />
                    <Button size="sm" variant="outline" onClick={() => addItem(cl.id)} className="h-8 px-2"><Plus className="w-3 h-3" /></Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── SAVED ARTICLES TAB ────────────────────────────────────────────────────────
function SavedArticlesTab({ articles, setSavedArticles, user, isOnline, toast }: any) {
  const handleRemove = async (postId: string) => {
    if (isOnline) await supabase.from("saved_articles").delete().eq("user_id", user.id).eq("post_id", postId);
    await idb.removeSavedArticle(postId);
    setSavedArticles(articles.filter((a: any) => (a.post_id || a.id) !== postId));
    toast({ title: "Removed from saved articles" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">Saved Articles</h2>
        <p className="text-sm text-gray-500">Bookmark articles from the site to read offline</p>
      </div>
      {articles.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No saved articles yet.</p>
          <p className="text-sm text-gray-400">Browse articles and click the bookmark icon to save them for offline reading.</p>
          <Button asChild variant="outline" size="sm" className="mt-4"><Link to="/latest">Browse Articles</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article: any) => (
            <div key={article.post_id || article.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-4">
              {article.post_image && <img src={article.post_image} alt={article.post_title} className="w-16 h-12 object-cover rounded flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 line-clamp-2">{article.post_title}</h3>
                {article.post_excerpt && <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{article.post_excerpt}</p>}
                <div className="flex items-center gap-3 mt-2">
                  {article.post_section && <Badge variant="secondary" className="text-xs">{article.post_section}</Badge>}
                  <span className="text-xs text-gray-400">Saved {new Date(article.saved_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {article.post_url && <Button asChild variant="outline" size="sm"><Link to={article.post_url}>Read</Link></Button>}
                <Button variant="ghost" size="sm" onClick={() => handleRemove(article.post_id || article.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SUPPLIERS TAB ─────────────────────────────────────────────────────────────
function SuppliersTab({ suppliers, isOnline }: any) {
  const categories = [...new Set(suppliers.map((s: any) => s.category))];
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? suppliers : suppliers.filter((s: any) => s.category === filter);

  const categoryLabels: Record<string, string> = {
    "survival-gear": "🎒 Survival Gear",
    "food-supplies": "🥫 Food & Water",
    "medical": "🏥 Medical",
    "bunker": "🏕️ Bunker & Shelter",
    "tools": "🔧 Tools & Power",
    "communication": "📻 Communication",
    "books": "📚 Books & Guides",
    "other": "📦 Other",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">Emergency Suppliers</h2>
        {!isOnline && <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">Cached — Available Offline</Badge>}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
        <strong>No internet?</strong> Call suppliers directly using the numbers below. All contact details are cached and available offline.
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter("all")} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filter === "all" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-300"}`}>All</button>
        {categories.map((cat: any) => (
          <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filter === cat ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-300"}`}>
            {categoryLabels[cat] || cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <Phone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-1">No emergency suppliers listed yet.</p>
          <p className="text-xs text-gray-400">Admin can mark affiliate products as emergency suppliers in the admin panel.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s: any) => (
            <div key={s.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{s.name}</h3>
                  <Badge variant="secondary" className="text-xs mt-1">{categoryLabels[s.category] || s.category}</Badge>
                </div>
                {s.supplier_accepts_cash && (
                  <Badge variant="outline" className="text-xs text-green-700 border-green-300">✓ Accepts Cash</Badge>
                )}
              </div>

              {s.description && <p className="text-sm text-gray-600 mb-3">{s.description}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {s.supplier_phone && (
                  <a href={`tel:${s.supplier_phone}`} className="flex items-center gap-2 text-blue-600 hover:underline font-semibold">
                    <Phone className="w-4 h-4" />{s.supplier_phone}
                  </a>
                )}
                {s.supplier_address && s.supplier_city && (
                  <p className="flex items-center gap-2 text-gray-600">
                    <Map className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    {s.supplier_address}, {s.supplier_city} {s.supplier_postcode}
                  </p>
                )}
                {s.supplier_opening_hours && (
                  <p className="text-gray-500 text-xs col-span-2">🕐 {s.supplier_opening_hours}</p>
                )}
                {s.supplier_coordinates && (
                  <p className="text-gray-400 text-xs col-span-2">📍 Coords: {s.supplier_coordinates}</p>
                )}
                {s.affiliate_url && isOnline && (
                  <a href={s.affiliate_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline text-xs">
                    <Globe className="w-3 h-3" />Order Online
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ORDER QUEUE TAB ───────────────────────────────────────────────────────────
function OrderQueueTab({ orders, setOrderQueue, user, isOnline, toast }: any) {
  const [submitting, setSubmitting] = useState(false);

  const submitQueued = async () => {
    if (!isOnline) { toast({ title: "No internet connection", description: "Orders will submit automatically when you reconnect", variant: "destructive" }); return; }
    setSubmitting(true);
    let submitted = 0;
    for (const order of orders) {
      try {
        await supabase.from("order_queue").update({ status: "submitted", submitted_at: new Date().toISOString() }).eq("id", order.id);
        await idb.set(STORES.ORDER_QUEUE, { ...order, status: "submitted" });
        submitted++;
      } catch (e) { console.error("Order submit error:", e); }
    }
    setOrderQueue(orders.filter((o: any) => o.status === "queued").map((o: any) => ({ ...o, status: "submitted" })));
    toast({ title: `${submitted} orders submitted` });
    setSubmitting(false);
  };

  const removeOrder = async (id: string) => {
    if (isOnline) await supabase.from("order_queue").delete().eq("id", id);
    await idb.delete(STORES.ORDER_QUEUE, id);
    setOrderQueue(orders.filter((o: any) => o.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">Order Queue</h2>
        {orders.length > 0 && (
          <Button size="sm" onClick={submitQueued} disabled={submitting || !isOnline}>
            <ShoppingCart className="w-4 h-4 mr-1" />
            {submitting ? "Submitting..." : `Submit ${orders.length} Order${orders.length > 1 ? "s" : ""}`}
          </Button>
        )}
      </div>
      {!isOnline && orders.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
          <strong>{orders.length} order{orders.length > 1 ? "s" : ""} queued.</strong> Will submit automatically when internet connection is restored.
        </div>
      )}
      {orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No queued orders.</p>
          <p className="text-sm text-gray-400">When you add items to cart while offline, they appear here and submit when you reconnect.</p>
          <Button asChild variant="outline" size="sm" className="mt-4"><Link to="/shop">Browse Supplies</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
              {order.product_image && <img src={order.product_image} alt={order.product_name} className="w-14 h-14 object-cover rounded flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900">{order.product_name}</h3>
                <p className="text-sm text-gray-500">Qty: {order.quantity}</p>
                {order.notes && <p className="text-xs text-gray-400">{order.notes}</p>}
                <p className="text-xs text-gray-400 mt-1">Queued {new Date(order.queued_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">Queued</Badge>
                <Button variant="ghost" size="sm" onClick={() => removeOrder(order.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SUPPLIES TAB ──────────────────────────────────────────────────────────────
function SuppliesTab({ user, isOnline, toast, wishlist, setWishlist, orderQueue, setOrderQueue }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [view, setView] = useState<"browse" | "wishlist">("browse");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      if (isOnline) {
        const { data } = await supabase
          .from("affiliate_products")
          .select("*")
          .eq("is_active", true)
          .order("is_featured", { ascending: false });
        const products = data || [];
        setProducts(products);
        // Cache for offline
        await idb.setMany("cached_affiliate_products" as any, products.map((p: any) => ({ ...p })));
      } else {
        const cached = await idb.getAll("cached_affiliate_products" as any);
        setProducts(cached);
      }
    } catch (e) {
      const cached = await idb.getAll("cached_affiliate_products" as any);
      setProducts(cached);
    } finally {
      setLoading(false);
    }
  };

  const isWishlisted = (productId: string) => wishlist.some((w: any) => w.product_id === productId);

  const toggleWishlist = async (product: any) => {
    if (isWishlisted(product.id)) {
      const updated = wishlist.filter((w: any) => w.product_id !== product.id);
      setWishlist(updated);
      toast({ title: "Removed from wishlist" });
    } else {
      const item = {
        id: `wish_${Date.now()}`,
        product_id: product.id,
        product_name: product.name,
        product_image: product.image_url,
        product_price: product.price,
        product_currency: product.currency,
        product_url: product.affiliate_url,
        added_at: new Date().toISOString(),
      };
      setWishlist([...wishlist, item]);
      toast({ title: "Added to wishlist", description: "Saved in your bunker" });
    }
  };

  const handleOrder = (product: any) => {
    if (isOnline) {
      // Track click and open affiliate URL
      window.open(product.affiliate_url, "_blank", "noopener,noreferrer");
    } else {
      // Queue the order for when back online
      const order = {
        id: `order_${Date.now()}`,
        product_id: product.id,
        product_name: product.name,
        product_image: product.image_url,
        product_url: product.affiliate_url,
        quantity: 1,
        status: "queued",
        queued_at: new Date().toISOString(),
        user_id: user?.id,
      };
      idb.set(STORES.ORDER_QUEUE, order);
      setOrderQueue([...orderQueue, order]);
      toast({
        title: "Order queued",
        description: "Will open supplier link when you reconnect",
      });
    }
  };

  const categories = ["all", ...new Set(products.map((p: any) => p.category).filter(Boolean))];

  const filtered = products.filter((p: any) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const categoryLabels: Record<string, string> = {
    "survival-gear": "Survival Gear",
    "food-supplies": "Food & Water",
    "medical": "Medical",
    "bunker": "Bunker Equipment",
    "tools": "Tools",
    "books": "Books & Guides",
    "other": "Other",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900">Supplies Shop</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isOnline ? "Browse and order essential supplies" : "Cached products — order queued when offline"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("browse")}
            className={`px-3 py-1.5 text-xs font-medium border transition-colors ${view === "browse" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"}`}
          >
            Browse
          </button>
          <button
            onClick={() => setView("wishlist")}
            className={`px-3 py-1.5 text-xs font-medium border transition-colors ${view === "wishlist" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"}`}
          >
            Wishlist ({wishlist.length})
          </button>
        </div>
      </div>

      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          <strong>Offline mode.</strong> Showing cached products. Orders will be queued and opened when you reconnect.
        </div>
      )}

      {/* BROWSE VIEW */}
      {view === "browse" && (
        <>
          {/* Search & Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search supplies..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm pl-8"
              />
              <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : categoryLabels[cat] || cat}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading supplies...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((product: any) => (
                <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {product.image_url && (
                    <img src={product.image_url} alt={product.name} className="w-full h-36 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                      <button
                        onClick={() => toggleWishlist(product)}
                        className={`flex-shrink-0 p-1 rounded transition-colors ${isWishlisted(product.id) ? "text-red-500" : "text-gray-300 hover:text-red-400"}`}
                        title={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Star className={`w-4 h-4 ${isWishlisted(product.id) ? "fill-red-500" : ""}`} />
                      </button>
                    </div>
                    {product.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      {product.price ? (
                        <span className="font-bold text-gray-900">
                          {product.currency === "GBP" ? "£" : product.currency === "EUR" ? "€" : "$"}{product.price}
                        </span>
                      ) : <span />}
                      <Button
                        size="sm"
                        onClick={() => handleOrder(product)}
                        className="text-xs"
                      >
                        {isOnline ? "Order Now" : "Queue Order"}
                      </Button>
                    </div>
                    {product.is_emergency_supplier && product.supplier_phone && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <a href={`tel:${product.supplier_phone}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3" />Call: {product.supplier_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* WISHLIST VIEW */}
      {view === "wishlist" && (
        <>
          {wishlist.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">Your wishlist is empty.</p>
              <p className="text-xs text-gray-400">Star products while browsing to save them here.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setView("browse")}>
                Browse Supplies
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {wishlist.map((item: any) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
                  {item.product_image && (
                    <img src={item.product_image} alt={item.product_name} className="w-16 h-12 object-cover rounded flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm">{item.product_name}</h3>
                    {item.product_price && (
                      <p className="text-sm font-bold text-gray-700 mt-0.5">
                        {item.product_currency === "GBP" ? "£" : "$"}{item.product_price}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      Saved {new Date(item.added_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (isOnline) {
                          window.open(item.product_url, "_blank", "noopener,noreferrer");
                        } else {
                          const order = {
                            id: `order_${Date.now()}`,
                            product_id: item.product_id,
                            product_name: item.product_name,
                            product_image: item.product_image,
                            product_url: item.product_url,
                            quantity: 1,
                            status: "queued",
                            queued_at: new Date().toISOString(),
                            user_id: user?.id,
                          };
                          idb.set(STORES.ORDER_QUEUE, order);
                          setOrderQueue([...orderQueue, order]);
                          toast({ title: "Order queued" });
                        }
                      }}
                      className="text-xs"
                    >
                      {isOnline ? "Order" : "Queue"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setWishlist(wishlist.filter((w: any) => w.id !== item.id))}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Missing imports needed at top - add these
import { supabase } from "@/integrations/supabase/client";
