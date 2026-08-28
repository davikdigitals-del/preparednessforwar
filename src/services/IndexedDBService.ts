// ============================================================================
// IndexedDB Service — Full offline storage for member portal
// Stores all member data locally so everything works without internet
// ============================================================================

const DB_NAME = "pfw-member-portal";
const DB_VERSION = 1;

// Store names
export const STORES = {
  POSTS: "cached_posts",
  COURSES: "cached_courses",
  ALERTS: "cached_alerts",
  NOTES: "member_notes",
  CHECKLISTS: "preparedness_checklists",
  CONTACTS: "emergency_contacts",
  SUPPLY_INVENTORY: "supply_inventory",
  BUGOUT_PLAN: "bugout_plan",
  SAVED_ARTICLES: "saved_articles",
  ORDER_QUEUE: "order_queue",
  SUPPLIERS: "emergency_suppliers",
  SYNC_QUEUE: "sync_queue",
  USER_DATA: "user_data",
} as const;

class IndexedDBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        console.warn("IndexedDB not supported");
        resolve();
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create all stores
        Object.values(STORES).forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: "id" });
            // Add indexes for common queries
            if (storeName === STORES.POSTS) {
              store.createIndex("section", "section", { unique: false });
              store.createIndex("cached_at", "cached_at", { unique: false });
            }
            if (storeName === STORES.SYNC_QUEUE) {
              store.createIndex("status", "status", { unique: false });
              store.createIndex("created_at", "created_at", { unique: false });
            }
          }
        });
      };
    });
  }

  private getStore(storeName: string, mode: IDBTransactionMode = "readonly"): IDBObjectStore | null {
    if (!this.db) return null;
    try {
      const tx = this.db.transaction(storeName, mode);
      return tx.objectStore(storeName);
    } catch {
      return null;
    }
  }

  // ── GENERIC CRUD ──────────────────────────────────────────────────────────

  async set(storeName: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, "readwrite");
      if (!store) { resolve(); return; }
      const req = store.put({ ...data, _cached_at: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async setMany(storeName: string, items: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db || !items.length) { resolve(); return; }
      const tx = this.db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      items.forEach(item => store.put({ ...item, _cached_at: Date.now() }));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async get(storeName: string, id: string): Promise<any | null> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName);
      if (!store) { resolve(null); return; }
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async getAll(storeName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName);
      if (!store) { resolve([]); return; }
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, "readwrite");
      if (!store) { resolve(); return; }
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, "readwrite");
      if (!store) { resolve(); return; }
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // ── SYNC QUEUE ────────────────────────────────────────────────────────────
  // Queue writes when offline, sync when back online

  async addToSyncQueue(action: {
    type: string;
    table: string;
    data: any;
    method: "INSERT" | "UPDATE" | "DELETE";
  }): Promise<void> {
    const item = {
      id: `sync_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      ...action,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    await this.set(STORES.SYNC_QUEUE, item);
  }

  async getPendingSyncItems(): Promise<any[]> {
    const all = await this.getAll(STORES.SYNC_QUEUE);
    return all.filter(item => item.status === "pending");
  }

  async markSyncItemComplete(id: string): Promise<void> {
    const item = await this.get(STORES.SYNC_QUEUE, id);
    if (item) {
      await this.set(STORES.SYNC_QUEUE, { ...item, status: "completed" });
    }
  }

  async markSyncItemFailed(id: string, error: string): Promise<void> {
    const item = await this.get(STORES.SYNC_QUEUE, id);
    if (item) {
      await this.set(STORES.SYNC_QUEUE, { ...item, status: "failed", error });
    }
  }

  // ── USER DATA ─────────────────────────────────────────────────────────────

  async saveUserData(userId: string, data: any): Promise<void> {
    await this.set(STORES.USER_DATA, { id: userId, ...data });
  }

  async getUserData(userId: string): Promise<any | null> {
    return this.get(STORES.USER_DATA, userId);
  }

  // ── CACHE POSTS ───────────────────────────────────────────────────────────

  async cachePosts(posts: any[]): Promise<void> {
    await this.setMany(STORES.POSTS, posts.map(p => ({ ...p, id: p.id || p.slug })));
  }

  async getCachedPosts(): Promise<any[]> {
    return this.getAll(STORES.POSTS);
  }

  // ── CACHE SUPPLIERS ───────────────────────────────────────────────────────

  async cacheSuppliers(suppliers: any[]): Promise<void> {
    await this.setMany(STORES.SUPPLIERS, suppliers);
  }

  async getCachedSuppliers(): Promise<any[]> {
    return this.getAll(STORES.SUPPLIERS);
  }

  // ── CACHE ALERTS ──────────────────────────────────────────────────────────

  async cacheAlerts(alerts: any[]): Promise<void> {
    await this.setMany(STORES.ALERTS, alerts.map(a => ({ ...a, id: a.id || String(Date.now()) })));
  }

  async getCachedAlerts(): Promise<any[]> {
    return this.getAll(STORES.ALERTS);
  }

  // ── ORDER QUEUE ───────────────────────────────────────────────────────────

  async addToOrderQueue(order: any): Promise<void> {
    const item = {
      id: `order_${Date.now()}`,
      ...order,
      status: "queued",
      queued_at: new Date().toISOString(),
    };
    await this.set(STORES.ORDER_QUEUE, item);
  }

  async getOrderQueue(): Promise<any[]> {
    const all = await this.getAll(STORES.ORDER_QUEUE);
    return all.filter(o => o.status === "queued");
  }

  // ── SAVED ARTICLES ────────────────────────────────────────────────────────

  async saveArticle(article: any): Promise<void> {
    await this.set(STORES.SAVED_ARTICLES, {
      id: article.post_id || article.id,
      ...article,
      saved_at: new Date().toISOString(),
    });
  }

  async getSavedArticles(): Promise<any[]> {
    return this.getAll(STORES.SAVED_ARTICLES);
  }

  async removeSavedArticle(postId: string): Promise<void> {
    await this.delete(STORES.SAVED_ARTICLES, postId);
  }

  // ── SUPPLY INVENTORY ──────────────────────────────────────────────────────

  async saveSupplyItem(item: any): Promise<void> {
    await this.set(STORES.SUPPLY_INVENTORY, item);
  }

  async getSupplyInventory(): Promise<any[]> {
    return this.getAll(STORES.SUPPLY_INVENTORY);
  }

  // ── BUGOUT PLAN ───────────────────────────────────────────────────────────

  async saveBugoutPlan(plan: any): Promise<void> {
    await this.set(STORES.BUGOUT_PLAN, { id: "bugout_plan", ...plan });
  }

  async getBugoutPlan(): Promise<any | null> {
    return this.get(STORES.BUGOUT_PLAN, "bugout_plan");
  }

  // ── READINESS SCORE ───────────────────────────────────────────────────────

  async calculateReadinessScore(userId: string): Promise<number> {
    try {
      const [inventory, contacts, notes, checklists, bugout] = await Promise.all([
        this.getAll(STORES.SUPPLY_INVENTORY),
        this.getAll(STORES.CONTACTS),
        this.getAll(STORES.NOTES),
        this.getAll(STORES.CHECKLISTS),
        this.getBugoutPlan(),
      ]);

      let score = 0;
      const maxScore = 100;

      // Supply inventory (30 points)
      const categories = ["water", "food", "medical", "communication"];
      const coveredCategories = categories.filter(cat =>
        inventory.some(i => i.category === cat && i.quantity > 0)
      );
      score += (coveredCategories.length / categories.length) * 30;

      // Emergency contacts (20 points)
      if (contacts.length >= 1) score += 10;
      if (contacts.length >= 3) score += 10;

      // Bug-out plan (20 points)
      if (bugout?.primary_route) score += 10;
      if (bugout?.rally_point_1) score += 10;

      // Notes/checklists (15 points)
      if (notes.length > 0) score += 5;
      if (checklists.length > 0) score += 10;

      // Checklist completion (15 points)
      if (checklists.length > 0) {
        const totalItems = checklists.reduce((s: number, c: any) => s + (c.items?.length || 0), 0);
        const completedItems = checklists.reduce((s: number, c: any) =>
          s + (c.items?.filter((i: any) => i.completed).length || 0), 0);
        if (totalItems > 0) {
          score += (completedItems / totalItems) * 15;
        }
      }

      return Math.min(Math.round(score), maxScore);
    } catch {
      return 0;
    }
  }
}

export const idb = new IndexedDBService();

// Initialize on import
idb.init().catch(console.error);
