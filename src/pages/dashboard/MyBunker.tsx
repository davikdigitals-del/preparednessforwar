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
  Save, RefreshCw, MessageSquare
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

  const scoreColor = readinessScore >= 75 ? "text-[#00703c]" : readinessScore >= 50 ? "text-[#f47738]" : "text-[#d4351c]";
  const scoreBg = readinessScore >= 75 ? "bg-[#e8f4ee] border-[#00703c]/30" : readinessScore >= 50 ? "bg-[#fdf0e8] border-[#f47738]/30" : "bg-[#fde8e8] border-[#d4351c]/30";

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
    <div className="min-h-screen flex items-center justify-center bg-[#f3f2f1]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[#505a5f] text-sm">Loading your bunker...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f2f1]">
      {/* Header */}
      <div className="bg-white border-b border-[#b1b4b6]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm text-[#505a5f] mb-1">
                <Link to="/dashboard" className="hover:text-[#1d70b8]">Dashboard</Link>
                <ChevronRight className="w-3 h-3" />
                <span>My Bunker</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0b0c0c] flex items-center gap-2">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#1d70b8]" />
                My Bunker
              </h1>
              <p className="text-xs sm:text-sm text-[#505a5f] mt-0.5">Personal survival command centre — works offline</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${isOnline ? "bg-[#e8f4ee] text-[#00703c] border-[#00703c]" : "bg-[#fdf0e8] text-[#f47738] border-[#f47738]"}`}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span className="hidden sm:inline">{isOnline ? "Online" : "Offline"}</span>
              </div>
              {isOnline && (
                <Button variant="outline" size="sm" onClick={loadAllData} className="h-7 px-2 text-xs border-[#b1b4b6]">
                  <RefreshCw className="w-3 h-3 sm:mr-1" /><span className="hidden sm:inline">Sync</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6">
        {/* Mobile tab selector */}
        <div className="md:hidden mb-4">
          <select
            value={activeTab}
            onChange={e => setActiveTab(e.target.value as Tab)}
            className="w-full border border-[#b1b4b6] px-3 py-2.5 text-sm bg-white font-medium text-[#0b0c0c]"
          >
            {tabs.map(t => (
              <option key={t.key} value={t.key}>
                {t.label}{t.count !== undefined && t.count > 0 ? ` (${t.count})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-6">
          {/* Sidebar — desktop only */}
          <aside className="w-56 flex-shrink-0 hidden md:block">
            <nav className="bg-white border border-[#b1b4b6] overflow-hidden sticky top-4">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm border-b border-[#f3f2f1] last:border-0 transition-colors ${
                    activeTab === tab.key
                      ? "bg-[#1d70b8] text-white font-medium"
                      : "text-[#0b0c0c] hover:bg-[#e8f0f8] hover:text-[#1d70b8]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-[#003078] text-white" : "bg-[#f3f2f1] text-[#505a5f]"}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {activeTab === "overview" && <OverviewTab score={readinessScore} scoreColor={scoreColor} scoreBg={scoreBg} contacts={contacts} inventory={inventory} checklists={checklists} savedArticles={savedArticles} orderQueue={orderQueue} setActiveTab={setActiveTab} isOnline={isOnline} />}
            {activeTab === "contacts" && <ContactsTab user={user} />}
            {activeTab === "inventory" && <InventoryTab user={user} />}
            {activeTab === "supplies" && <SuppliesTab user={user} isOnline={isOnline} toast={toast} wishlist={wishlist} setWishlist={setWishlist} setOrderQueue={setOrderQueue} orderQueue={orderQueue} />}
            {activeTab === "bugout" && <BugoutTab user={user} />}
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
      <div className={`border p-6 ${scoreBg}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#0b0c0c] text-lg">Readiness Score</h2>
          <span className={`text-4xl font-black ${scoreColor}`}>{score}%</span>
        </div>
        <div className="w-full bg-[#f3f2f1] h-3 mb-3">
          <div className={`h-3 transition-all ${score >= 75 ? "bg-[#00703c]" : score >= 50 ? "bg-[#f47738]" : "bg-[#d4351c]"}`} style={{ width: `${score}%` }} />
        </div>
        <p className="text-sm text-[#505a5f]">
          {score >= 75 ? "Well prepared. Keep maintaining your supplies." : score >= 50 ? "Moderately prepared. Complete your checklists and stock up." : "Low readiness. Take action now — add contacts, supplies, and complete your bug-out plan."}
        </p>
      </div>

      {!isOnline && (
        <div className="bg-[#fdf0e8] border border-[#f47738] p-4 flex items-start gap-3">
          <WifiOff className="w-5 h-5 text-[#f47738] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#0b0c0c]">You are offline</p>
            <p className="text-sm text-[#505a5f] mt-0.5">All your bunker data is available. Changes will sync when you reconnect.</p>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {[
          { label: "Emergency Contacts", value: contacts.length, icon: Users, tab: "contacts" },
          { label: "Supply Categories", value: `${covered.length}/4`, icon: Package, tab: "inventory" },
          { label: "Checklist Progress", value: totalItems > 0 ? `${completedItems}/${totalItems}` : "0", icon: ListChecks, tab: "checklists" },
          { label: "Saved Articles", value: savedArticles.length, icon: BookOpen, tab: "saved" },
        ].map(s => (
          <button key={s.label} onClick={() => setActiveTab(s.tab)} className="bg-white border border-[#b1b4b6] p-4 text-left hover:border-[#1d70b8] hover:bg-[#e8f0f8] transition-all">
            <s.icon className="w-5 h-5 text-[#1d70b8] mb-2" />
            <p className="text-2xl font-bold text-[#0b0c0c]">{s.value}</p>
            <p className="text-xs text-[#505a5f] mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Action items */}
      <div className="bg-white border border-[#b1b4b6] p-5">
        <h3 className="font-bold text-[#0b0c0c] mb-4">Priority Actions</h3>
        <div className="space-y-3">
          {contacts.length === 0 && <ActionItem text="Add emergency contacts" to="contacts" setActiveTab={setActiveTab} />}
          {covered.length < 4 && <ActionItem text={`Stock up on: ${categories.filter(c => !covered.includes(c)).join(", ")}`} to="inventory" setActiveTab={setActiveTab} />}
          {!inventory.some((i: any) => i.category === "water") && <ActionItem text="Add water supply (target: 14 days)" to="inventory" setActiveTab={setActiveTab} />}
          {checklists.length === 0 && <ActionItem text="Create a preparedness checklist" to="checklists" setActiveTab={setActiveTab} />}
          {orderQueue.length > 0 && <ActionItem text={`${orderQueue.length} orders queued — connect to submit`} to="orders" setActiveTab={setActiveTab} urgent />}
          {contacts.length > 0 && covered.length >= 4 && checklists.length > 0 && (
            <div className="flex items-center gap-2 text-[#00703c] text-sm">
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
    <button onClick={() => setActiveTab(to)} className={`w-full flex items-center justify-between p-3 border text-left text-sm transition-colors ${urgent ? "bg-[#fdf0e8] border-[#f47738] text-[#0b0c0c] hover:bg-[#fce3d0]" : "bg-[#f3f2f1] border-[#b1b4b6] text-[#0b0c0c] hover:bg-[#e8f0f8]"}`}>
      <div className="flex items-center gap-2">
        <AlertTriangle className={`w-4 h-4 ${urgent ? "text-[#f47738]" : "text-[#f47738]"}`} />
        {text}
      </div>
      <ChevronRight className="w-4 h-4" />
    </button>
  );
}

// ── CONTACTS TAB ─────────────────────────────────────────────────────────────
function ContactsTab({ user }: any) {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const blank = { name: "", relationship: "", phone: "", phone2: "", email: "", address: "", notes: "", priority: "medium" };
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (!user) return;
    supabase.from("emergency_contacts").select("*").eq("user_id", user.id).order("priority", { ascending: false })
      .then(({ data }) => { setContacts(data || []); setLoading(false); });
  }, [user]);

  const openAdd = () => { setForm(blank); setEditId(null); setShowForm(true); };
  const openEdit = (c: any) => {
    setForm({ name: c.name || "", relationship: c.relationship || "", phone: c.phone || "", phone2: c.phone2 || "", email: c.email || "", address: c.address || "", notes: c.notes || "", priority: c.priority || "medium" });
    setEditId(c.id); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) { toast({ title: "Name and phone are required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      if (editId) {
        const { data, error } = await supabase.from("emergency_contacts").update({ ...form, updated_at: new Date().toISOString() }).eq("id", editId).eq("user_id", user.id).select().single();
        if (error) throw error;
        setContacts(contacts.map(c => c.id === editId ? data : c));
        toast({ title: "Contact updated" });
      } else {
        const { data, error } = await supabase.from("emergency_contacts").insert({ ...form, user_id: user.id }).select().single();
        if (error) throw error;
        setContacts([data, ...contacts]);
        toast({ title: "Contact saved" });
      }
      setShowForm(false); setEditId(null); setForm(blank);
    } catch (e: any) { toast({ title: "Save failed", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contact?")) return;
    await supabase.from("emergency_contacts").delete().eq("id", id);
    setContacts(contacts.filter(c => c.id !== id));
    toast({ title: "Contact deleted" });
  };

  if (loading) return <div className="py-8 text-center text-[#505a5f] text-sm">Loading contacts...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[#0b0c0c] text-lg">Emergency Contacts</h2>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Contact</Button>
      </div>
      {showForm && (
        <div className="bg-white border border-[#b1b4b6] p-5 space-y-4">
          <h3 className="font-semibold text-[#0b0c0c]">{editId ? "Edit Contact" : "New Emergency Contact"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Jane Smith" /></div>
            <div><Label>Relationship</Label><Input value={form.relationship} onChange={e => setForm({...form, relationship: e.target.value})} placeholder="e.g. Spouse, Parent, Neighbour" /></div>
            <div><Label>Primary Phone *</Label><Input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="e.g. 07700 900000" /></div>
            <div><Label>Secondary Phone</Label><Input type="tel" value={form.phone2} onChange={e => setForm({...form, phone2: e.target.value})} placeholder="Alternative number" /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@example.com" /></div>
            <div>
              <Label>Priority</Label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full border border-[#b1b4b6] px-3 py-2 text-sm bg-white">
                <option value="high">High — First to call</option>
                <option value="medium">Medium</option>
                <option value="low">Low — Backup</option>
              </select>
            </div>
            <div className="sm:col-span-2"><Label>Address</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Home or meeting point address" /></div>
            <div className="sm:col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} placeholder="Any important notes (medical info, availability, etc.)" /></div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} disabled={saving} size="sm"><Save className="w-4 h-4 mr-1" />{saving ? "Saving..." : "Save Contact"}</Button>
            <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Button>
          </div>
        </div>
      )}
      {contacts.length === 0 && !showForm ? (
        <div className="bg-white border border-[#b1b4b6] p-8 text-center">
          <Users className="w-12 h-12 text-[#b1b4b6] mx-auto mb-3" />
          <p className="text-[#505a5f] mb-3">No emergency contacts yet.</p>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Your First Contact</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((c: any) => (
            <div key={c.id} className="bg-white border border-[#b1b4b6] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-[#0b0c0c]">{c.name}</h3>
                    {c.relationship && <span className="text-xs bg-[#f3f2f1] text-[#505a5f] px-2 py-0.5 rounded">{c.relationship}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${c.priority === "high" ? "bg-red-100 text-red-700" : c.priority === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{c.priority}</span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-[#505a5f]">
                    {c.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /><a href={`tel:${c.phone}`} className="text-[#1d70b8] hover:underline">{c.phone}</a></p>}
                    {c.phone2 && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /><a href={`tel:${c.phone2}`} className="text-[#1d70b8] hover:underline">{c.phone2}</a></p>}
                    {c.email && <p className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /><a href={`mailto:${c.email}`} className="text-[#1d70b8] hover:underline">{c.email}</a></p>}
                    {c.address && <p className="flex items-center gap-2"><Map className="w-3.5 h-3.5" />{c.address}</p>}
                    {c.notes && <p className="text-xs text-[#505a5f] mt-1 italic">{c.notes}</p>}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-[#d4351c]" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// ── INVENTORY TAB ─────────────────────────────────────────────────────────────
function InventoryTab({ user }: any) {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const blank = { name: "", category: "water", quantity: "", unit: "", expiry_date: "", location: "", notes: "", minimum_quantity: "" };
  const [form, setForm] = useState(blank);
  const categories = ["water", "food", "medical", "communication", "tools", "clothing", "documents", "fuel", "other"];

  useEffect(() => {
    if (!user) return;
    supabase.from("supply_inventory").select("*").eq("user_id", user.id).order("category")
      .then(({ data }) => { setInventory(data || []); setLoading(false); });
  }, [user]);

  const openAdd = () => { setForm(blank); setEditId(null); setShowForm(true); };
  const openEdit = (item: any) => {
    setForm({ name: item.name || "", category: item.category || "water", quantity: String(item.quantity || ""), unit: item.unit || "", expiry_date: item.expiry_date || "", location: item.location || "", notes: item.notes || "", minimum_quantity: String(item.minimum_quantity || "") });
    setEditId(item.id); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Item name is required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const payload = { ...form, quantity: Number(form.quantity) || 0, minimum_quantity: Number(form.minimum_quantity) || 0, user_id: user.id };
      if (editId) {
        const { data, error } = await supabase.from("supply_inventory").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editId).eq("user_id", user.id).select().single();
        if (error) throw error;
        setInventory(inventory.map(i => i.id === editId ? data : i));
        toast({ title: "Item updated" });
      } else {
        const { data, error } = await supabase.from("supply_inventory").insert(payload).select().single();
        if (error) throw error;
        setInventory([...inventory, data]);
        toast({ title: "Item added to inventory" });
      }
      setShowForm(false); setEditId(null); setForm(blank);
    } catch (e: any) { toast({ title: "Save failed", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this item?")) return;
    await supabase.from("supply_inventory").delete().eq("id", id);
    setInventory(inventory.filter(i => i.id !== id));
    toast({ title: "Item removed" });
  };

  const grouped = categories.reduce((acc, cat) => {
    const items = inventory.filter(i => i.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) return <div className="py-8 text-center text-[#505a5f] text-sm">Loading inventory...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[#0b0c0c] text-lg">Supply Inventory</h2>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Item</Button>
      </div>
      {showForm && (
        <div className="bg-white border border-[#b1b4b6] p-5 space-y-4">
          <h3 className="font-semibold text-[#0b0c0c]">{editId ? "Edit Item" : "Add Supply Item"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label>Item Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Bottled Water, First Aid Kit" /></div>
            <div>
              <Label>Category</Label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border border-[#b1b4b6] px-3 py-2 text-sm bg-white capitalize">
                {categories.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="0" min="0" /></div>
            <div><Label>Unit</Label><Input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} placeholder="e.g. litres, packs, units" /></div>
            <div><Label>Expiry Date</Label><Input type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} /></div>
            <div><Label>Minimum Stock Alert</Label><Input type="number" value={form.minimum_quantity} onChange={e => setForm({...form, minimum_quantity: e.target.value})} placeholder="Alert when below this" min="0" /></div>
            <div><Label>Storage Location</Label><Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Garage shelf, Kitchen cupboard" /></div>
            <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Brand, condition, etc." /></div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} disabled={saving} size="sm"><Save className="w-4 h-4 mr-1" />{saving ? "Saving..." : "Save Item"}</Button>
            <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Button>
          </div>
        </div>
      )}
      {inventory.length === 0 && !showForm ? (
        <div className="bg-white border border-[#b1b4b6] p-8 text-center">
          <Package className="w-12 h-12 text-[#b1b4b6] mx-auto mb-3" />
          <p className="text-[#505a5f] mb-3">No supplies tracked yet.</p>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add First Item</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="bg-white border border-[#b1b4b6] overflow-hidden">
              <div className="px-4 py-2 bg-[#f3f2f1] border-b border-[#b1b4b6]">
                <h3 className="font-semibold text-[#0b0c0c] capitalize text-sm">{cat} <span className="text-[#505a5f] font-normal">({items.length} items)</span></h3>
              </div>
              <div className="divide-y divide-[#f3f2f1]">
                {items.map((item: any) => {
                  const isLow = item.minimum_quantity > 0 && item.quantity <= item.minimum_quantity;
                  const isExpiring = item.expiry_date && new Date(item.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                  return (
                    <div key={item.id} className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-[#0b0c0c] text-sm">{item.name}</span>
                          {isLow && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Low stock</span>}
                          {isExpiring && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Expiring soon</span>}
                        </div>
                        <div className="text-xs text-[#505a5f] mt-0.5 flex gap-3 flex-wrap">
                          <span>Qty: <strong>{item.quantity} {item.unit}</strong></span>
                          {item.expiry_date && <span>Expires: {new Date(item.expiry_date).toLocaleDateString()}</span>}
                          {item.location && <span>📍 {item.location}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Edit className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="w-3.5 h-3.5 text-[#d4351c]" /></Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// ── BUGOUT TAB ────────────────────────────────────────────────────────────────
function BugoutTab({ user }: any) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const emptyPlan = {
    primary_location: "", primary_address: "", primary_route: "",
    secondary_location: "", secondary_address: "", secondary_route: "",
    meeting_point: "", meeting_point_address: "",
    trigger_conditions: "", transport_method: "", fuel_plan: "",
    bag_contents: "", documents_list: "", communication_plan: "",
    pets_plan: "", medical_needs: "", special_considerations: "",
    last_updated: "",
  };
  const [plan, setPlan] = useState(emptyPlan);

  useEffect(() => {
    if (!user) return;
    supabase.from("bugout_plans").select("*").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setPlan({ ...emptyPlan, ...data }); setLoading(false); });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...plan, user_id: user.id, last_updated: new Date().toISOString() };
      const { error } = await supabase.from("bugout_plans").upsert(payload, { onConflict: "user_id" });
      if (error) throw error;
      setSaved(true);
      toast({ title: "Bug-Out Plan saved", description: "Your plan is stored privately" });
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) { toast({ title: "Save failed", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const field = (key: keyof typeof emptyPlan, label: string, placeholder: string, type: "input" | "textarea" = "input") => (
    <div>
      <Label className="font-semibold text-sm">{label}</Label>
      {type === "textarea"
        ? <Textarea value={plan[key]} onChange={e => { setPlan({...plan, [key]: e.target.value}); setSaved(false); }} rows={3} placeholder={placeholder} className="mt-1" />
        : <Input value={plan[key]} onChange={e => { setPlan({...plan, [key]: e.target.value}); setSaved(false); }} placeholder={placeholder} className="mt-1" />
      }
    </div>
  );

  if (loading) return <div className="py-8 text-center text-[#505a5f] text-sm">Loading plan...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[#0b0c0c] text-lg">Bug-Out Plan</h2>
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? "Saving..." : saved ? "✓ Saved" : <><Save className="w-3.5 h-3.5 mr-1" />Save Plan</>}
        </Button>
      </div>
      <div className="bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
        🔒 Your bug-out plan is private — only you can see it. Fill in as much or as little as you need.
      </div>
      <div className="bg-white border border-[#b1b4b6] p-5 space-y-4">
        <h3 className="font-bold text-[#0b0c0c] flex items-center gap-2"><Map className="w-4 h-4 text-[#1d70b8]" />Primary Destination</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("primary_location", "Location Name", "e.g. Uncle John's Farm, Mountain Cabin")}
          {field("primary_address", "Full Address", "Street, Town, Postcode")}
        </div>
        {field("primary_route", "Route Description", "Describe the route — roads, landmarks, alternatives if main road is blocked", "textarea")}
      </div>
      <div className="bg-white border border-[#b1b4b6] p-5 space-y-4">
        <h3 className="font-bold text-[#0b0c0c] flex items-center gap-2"><Map className="w-4 h-4 text-[#505a5f]" />Secondary Destination (Backup)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("secondary_location", "Location Name", "Backup location if primary is unreachable")}
          {field("secondary_address", "Full Address", "Street, Town, Postcode")}
        </div>
        {field("secondary_route", "Route Description", "Alternative route to backup location", "textarea")}
      </div>
      <div className="bg-white border border-[#b1b4b6] p-5 space-y-4">
        <h3 className="font-bold text-[#0b0c0c] flex items-center gap-2"><Users className="w-4 h-4 text-[#1d70b8]" />Family Meeting Point</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("meeting_point", "Meeting Point Name", "e.g. Local Church, Community Centre")}
          {field("meeting_point_address", "Address", "Full address of meeting point")}
        </div>
      </div>
      <div className="bg-white border border-[#b1b4b6] p-5 space-y-4">
        <h3 className="font-bold text-[#0b0c0c] flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-[#f47738]" />Trigger & Transport</h3>
        {field("trigger_conditions", "When to Bug Out", "List the conditions that would trigger evacuation (e.g. power out 48h, civil unrest, flood warning)", "textarea")}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("transport_method", "Transport Method", "e.g. Car (Reg: AB12 CDE), Bicycle, On foot")}
          {field("fuel_plan", "Fuel Plan", "e.g. Keep tank above half, Jerry can in garage")}
        </div>
      </div>
      <div className="bg-white border border-[#b1b4b6] p-5 space-y-4">
        <h3 className="font-bold text-[#0b0c0c] flex items-center gap-2"><Package className="w-4 h-4 text-[#1d70b8]" />Bag & Documents</h3>
        {field("bag_contents", "Bug-Out Bag Contents", "List key items in your bag (water, food, first aid, torch, radio, cash...)", "textarea")}
        {field("documents_list", "Critical Documents to Grab", "Passports, birth certificates, insurance docs, USB with backups...", "textarea")}
      </div>
      <div className="bg-white border border-[#b1b4b6] p-5 space-y-4">
        <h3 className="font-bold text-[#0b0c0c] flex items-center gap-2"><MessageSquare className="w-4 h-4 text-[#1d70b8]" />Communication & Special Needs</h3>
        {field("communication_plan", "Communication Plan", "How will family members contact each other? Out-of-area contact person?", "textarea")}
        {field("pets_plan", "Pets Plan", "Carriers, food, vet records, where pets go")}
        {field("medical_needs", "Medical Needs", "Medications to grab, medical equipment, special dietary needs")}
        {field("special_considerations", "Other Considerations", "Elderly family members, disabilities, infants, anything else", "textarea")}
      </div>
      <div className="flex items-center gap-3 pb-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : saved ? "✓ Saved" : "Save Bug-Out Plan"}
        </Button>
        {plan.last_updated && <span className="text-xs text-[#505a5f]">Last saved: {new Date(plan.last_updated).toLocaleString()}</span>}
      </div>
    </div>
  );
}// ── NOTES TAB ─────────────────────────────────────────────────────────────────
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
        <h2 className="font-bold text-[#0b0c0c]">Personal Notes</h2>
        <Button size="sm" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4 mr-1" />New Note</Button>
      </div>
      {adding && (
        <div className="bg-white border border-[#b1b4b6] p-5 space-y-3">
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
        <div className="bg-white border border-[#b1b4b6] p-8 text-center">
          <StickyNote className="w-12 h-12 text-[#b1b4b6] mx-auto mb-3" />
          <p className="text-[#505a5f]">No notes yet. Document your plans and observations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note: any) => (
            <div key={note.id} className="bg-white border border-[#b1b4b6] p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-[#0b0c0c]">{note.title}</h3>
                  {note.category && <Badge variant="secondary" className="text-xs mt-1">{note.category}</Badge>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(note.id)}><Trash2 className="w-4 h-4 text-[#d4351c]" /></Button>
              </div>
              <p className="text-sm text-[#505a5f] line-clamp-4 whitespace-pre-wrap">{note.content}</p>
              <p className="text-xs text-[#b1b4b6] mt-2">{new Date(note.created_at).toLocaleDateString()}</p>
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
        <h2 className="font-bold text-[#0b0c0c]">Preparedness Checklists</h2>
        <Button size="sm" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4 mr-1" />New Checklist</Button>
      </div>
      {adding && (
        <div className="bg-white border border-[#b1b4b6] p-5 space-y-3">
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
        <div className="bg-white border border-[#b1b4b6] p-8 text-center">
          <ListChecks className="w-12 h-12 text-[#b1b4b6] mx-auto mb-3" />
          <p className="text-[#505a5f]">No checklists yet. Create checklists to track your preparedness tasks.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {checklists.map((cl: any) => {
            const items = cl.items || [];
            const done = items.filter((i: any) => i.completed).length;
            const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
            return (
              <div key={cl.id} className="bg-white border border-[#b1b4b6] overflow-hidden">
                <div className="px-4 py-3 bg-[#f3f2f1] border-b border-[#b1b4b6] flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[#0b0c0c]">{cl.title}</h3>
                    {cl.description && <p className="text-xs text-[#505a5f]">{cl.description}</p>}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[#505a5f]">{done}/{items.length} completed</span>
                      <div className="w-24 bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${pct === 100 ? "bg-green-500" : pct >= 50 ? "bg-[#fdf0e8]0" : "bg-red-400"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteChecklist(cl.id)}><Trash2 className="w-4 h-4 text-[#d4351c]" /></Button>
                </div>
                <div className="p-4 space-y-2">
                  {items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <Checkbox checked={item.completed} onCheckedChange={() => toggleItem(cl.id, item.id)} />
                      <span className={`text-sm ${item.completed ? "line-through text-[#b1b4b6]" : "text-[#0b0c0c]"}`}>{item.text}</span>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-[#f3f2f1]">
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
        <h2 className="font-bold text-[#0b0c0c]">Saved Articles</h2>
        <p className="text-sm text-[#505a5f]">Bookmark articles from the site to read offline</p>
      </div>
      {articles.length === 0 ? (
        <div className="bg-white border border-[#b1b4b6] p-8 text-center">
          <BookOpen className="w-12 h-12 text-[#b1b4b6] mx-auto mb-3" />
          <p className="text-[#505a5f] mb-2">No saved articles yet.</p>
          <p className="text-sm text-[#b1b4b6]">Browse articles and click the bookmark icon to save them for offline reading.</p>
          <Button asChild variant="outline" size="sm" className="mt-4"><Link to="/latest">Browse Articles</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article: any) => (
            <div key={article.post_id || article.id} className="bg-white border border-[#b1b4b6] p-4 flex items-start gap-4">
              {article.post_image && <img src={article.post_image} alt={article.post_title} className="w-16 h-12 object-cover rounded flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[#0b0c0c] line-clamp-2">{article.post_title}</h3>
                {article.post_excerpt && <p className="text-sm text-[#505a5f] line-clamp-2 mt-0.5">{article.post_excerpt}</p>}
                <div className="flex items-center gap-3 mt-2">
                  {article.post_section && <Badge variant="secondary" className="text-xs">{article.post_section}</Badge>}
                  <span className="text-xs text-[#b1b4b6]">Saved {new Date(article.saved_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {article.post_url && <Button asChild variant="outline" size="sm"><Link to={article.post_url}>Read</Link></Button>}
                <Button variant="ghost" size="sm" onClick={() => handleRemove(article.post_id || article.id)}><Trash2 className="w-4 h-4 text-[#d4351c]" /></Button>
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
        <h2 className="font-bold text-[#0b0c0c]">Emergency Suppliers</h2>
        {!isOnline && <Badge variant="outline" className="text-[#f47738] border-orange-300 text-xs">Cached — Available Offline</Badge>}
      </div>

      <div className="bg-[#fdf0e8] border border-[#f47738]/30 rounded-lg p-3 text-sm text-[#f47738]">
        <strong>No internet?</strong> Call suppliers directly using the numbers below. All contact details are cached and available offline.
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter("all")} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filter === "all" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-[#505a5f] border-[#b1b4b6] hover:border-[#1d70b8]"}`}>All</button>
        {categories.map((cat: any) => (
          <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filter === cat ? "bg-blue-600 text-white border-blue-600" : "bg-white text-[#505a5f] border-[#b1b4b6] hover:border-[#1d70b8]"}`}>
            {categoryLabels[cat] || cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-[#b1b4b6] p-8 text-center">
          <Phone className="w-12 h-12 text-[#b1b4b6] mx-auto mb-3" />
          <p className="text-[#505a5f] mb-1">No emergency suppliers listed yet.</p>
          <p className="text-xs text-[#b1b4b6]">Admin can mark affiliate products as emergency suppliers in the admin panel.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s: any) => (
            <div key={s.id} className="bg-white border border-[#b1b4b6] p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-[#0b0c0c]">{s.name}</h3>
                  <Badge variant="secondary" className="text-xs mt-1">{categoryLabels[s.category] || s.category}</Badge>
                </div>
                {s.supplier_accepts_cash && (
                  <Badge variant="outline" className="text-xs text-green-700 border-green-300">✓ Accepts Cash</Badge>
                )}
              </div>

              {s.description && <p className="text-sm text-[#505a5f] mb-3">{s.description}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {s.supplier_phone && (
                  <a href={`tel:${s.supplier_phone}`} className="flex items-center gap-2 text-[#1d70b8] hover:underline font-semibold">
                    <Phone className="w-4 h-4" />{s.supplier_phone}
                  </a>
                )}
                {s.supplier_address && s.supplier_city && (
                  <p className="flex items-center gap-2 text-[#505a5f]">
                    <Map className="w-4 h-4 text-[#b1b4b6] flex-shrink-0" />
                    {s.supplier_address}, {s.supplier_city} {s.supplier_postcode}
                  </p>
                )}
                {s.supplier_opening_hours && (
                  <p className="text-[#505a5f] text-xs col-span-2">🕐 {s.supplier_opening_hours}</p>
                )}
                {s.supplier_coordinates && (
                  <p className="text-[#b1b4b6] col-span-2">📍 Coords: {s.supplier_coordinates}</p>
                )}
                {s.affiliate_url && isOnline && (
                  <a href={s.affiliate_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#1d70b8] hover:underline text-xs">
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
        <h2 className="font-bold text-[#0b0c0c]">Order Queue</h2>
        {orders.length > 0 && (
          <Button size="sm" onClick={submitQueued} disabled={submitting || !isOnline}>
            <ShoppingCart className="w-4 h-4 mr-1" />
            {submitting ? "Submitting..." : `Submit ${orders.length} Order${orders.length > 1 ? "s" : ""}`}
          </Button>
        )}
      </div>
      {!isOnline && orders.length > 0 && (
        <div className="bg-[#fdf0e8] border border-[#f47738]/30 rounded-lg p-3 text-sm text-[#f47738]">
          <strong>{orders.length} order{orders.length > 1 ? "s" : ""} queued.</strong> Will submit automatically when internet connection is restored.
        </div>
      )}
      {orders.length === 0 ? (
        <div className="bg-white border border-[#b1b4b6] p-8 text-center">
          <ShoppingCart className="w-12 h-12 text-[#b1b4b6] mx-auto mb-3" />
          <p className="text-[#505a5f] mb-2">No queued orders.</p>
          <p className="text-sm text-[#b1b4b6]">When you add items to cart while offline, they appear here and submit when you reconnect.</p>
          <Button asChild variant="outline" size="sm" className="mt-4"><Link to="/shop">Browse Supplies</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white border border-[#b1b4b6] p-4 flex items-center gap-4">
              {order.product_image && <img src={order.product_image} alt={order.product_name} className="w-14 h-14 object-cover rounded flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[#0b0c0c]">{order.product_name}</h3>
                <p className="text-sm text-[#505a5f]">Qty: {order.quantity}</p>
                {order.notes && <p className="text-xs text-[#b1b4b6]">{order.notes}</p>}
                <p className="text-xs text-[#b1b4b6] mt-1">Queued {new Date(order.queued_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[#f47738] border-amber-300 text-xs">Queued</Badge>
                <Button variant="ghost" size="sm" onClick={() => removeOrder(order.id)}><Trash2 className="w-4 h-4 text-[#d4351c]" /></Button>
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
      // Use public client — no auth needed for active products
      const { publicSupabase } = await import("@/integrations/supabase/publicClient");
      const { data } = await publicSupabase
        .from("affiliate_products")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false });
      setProducts(data || []);
    } catch (e) {
      console.error("Failed to load products:", e);
      setProducts([]);
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
          <h2 className="font-bold text-[#0b0c0c]">Supplies Shop</h2>
          <p className="text-xs text-[#505a5f] mt-0.5">
            {isOnline ? "Browse and order essential supplies" : "Cached products — order queued when offline"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("browse")}
            className={`px-3 py-1.5 text-xs font-medium border transition-colors ${view === "browse" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-[#0b0c0c] border-[#b1b4b6] hover:border-gray-500"}`}
          >
            Browse
          </button>
          <button
            onClick={() => setView("wishlist")}
            className={`px-3 py-1.5 text-xs font-medium border transition-colors ${view === "wishlist" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-[#0b0c0c] border-[#b1b4b6] hover:border-gray-500"}`}
          >
            Wishlist ({wishlist.length})
          </button>
        </div>
      </div>

      {!isOnline && (
        <div className="bg-[#fdf0e8] border border-[#f47738]/30 rounded-lg p-3 text-sm text-[#f47738]">
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
                className="w-full border border-[#b1b4b6] rounded-lg px-3 py-2 text-sm pl-8"
              />
              <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-[#b1b4b6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="border border-[#b1b4b6] rounded-lg px-3 py-2 text-sm"
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
              <p className="text-sm text-[#505a5f]">Loading supplies...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-[#b1b4b6] p-8 text-center">
              <Package className="w-12 h-12 text-[#b1b4b6] mx-auto mb-3" />
              <p className="text-[#505a5f]">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((product: any) => (
                <div key={product.id} className="bg-white border border-[#b1b4b6] overflow-hidden hover:shadow-md transition-shadow">
                  {product.image_url && (
                    <img src={product.image_url} alt={product.name} className="w-full h-36 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-[#0b0c0c] text-sm line-clamp-2">{product.name}</h3>
                      <button
                        onClick={() => toggleWishlist(product)}
                        className={`flex-shrink-0 p-1 rounded transition-colors ${isWishlisted(product.id) ? "text-red-500" : "text-[#b1b4b6] hover:text-[#d4351c]"}`}
                        title={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Star className={`w-4 h-4 ${isWishlisted(product.id) ? "fill-red-500" : ""}`} />
                      </button>
                    </div>
                    {product.description && (
                      <p className="text-xs text-[#505a5f] line-clamp-2 mb-3">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      {product.price ? (
                        <span className="font-bold text-[#0b0c0c]">
                          {product.currency === "GBP" ? "£" : product.currency === "EUR" ? "€" : "£"}{product.price}
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
                      <div className="mt-2 pt-2 border-t border-[#f3f2f1]">
                        <a href={`tel:${product.supplier_phone}`} className="text-xs text-[#1d70b8] hover:underline flex items-center gap-1">
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
            <div className="bg-white border border-[#b1b4b6] p-8 text-center">
              <Star className="w-12 h-12 text-[#b1b4b6] mx-auto mb-3" />
              <p className="text-[#505a5f] mb-2">Your wishlist is empty.</p>
              <p className="text-xs text-[#b1b4b6]">Star products while browsing to save them here.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setView("browse")}>
                Browse Supplies
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {wishlist.map((item: any) => (
                <div key={item.id} className="bg-white border border-[#b1b4b6] p-4 flex items-center gap-4">
                  {item.product_image && (
                    <img src={item.product_image} alt={item.product_name} className="w-16 h-12 object-cover rounded flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[#0b0c0c] text-sm">{item.product_name}</h3>
                    {item.product_price && (
                      <p className="text-sm font-bold text-[#0b0c0c] mt-0.5">
                        {"£"}{item.product_price}
                      </p>
                    )}
                    <p className="text-xs text-[#b1b4b6] mt-0.5">
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
                      <Trash2 className="w-4 h-4 text-[#d4351c]" />
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
import { PreparednessPlanner } from "@/components/PreparednessPlanner";
