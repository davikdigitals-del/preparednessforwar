import { supabase, supabaseReadReplica } from './supabasePooled.js';
import cache, { CacheKeys } from './cache.js';

/**
 * Cached Supabase Client
 * Automatically caches SELECT queries with intelligent invalidation
 * 
 * Usage:
 * const { data } = await cachedQuery()
 *   .from('posts')
 *   .select('*')
 *   .eq('user_id', userId)
 *   .cache({ ttl: 300 }); // Cache for 5 minutes
 */

// Default TTL for different data types (in seconds)
const DEFAULT_TTLS = {
  user: 300,        // 5 minutes
  profile: 300,     // 5 minutes
  post: 180,        // 3 minutes
  comment: 120,     // 2 minutes
  settings: 600,    // 10 minutes
  static: 3600,     // 1 hour
  trending: 60,     // 1 minute
  search: 120,      // 2 minutes
};

/**
 * Cached query builder that wraps Supabase queries
 */
class CachedQueryBuilder {
  constructor(table, client = supabaseReadReplica) {
    this.table = table;
    this.client = client;
    this.query = client.from(table);
    this.cacheOptions = null;
    this.cacheKey = null;
    this.filters = [];
  }

  // ── Query methods (proxy to Supabase) ────────────────────────────────────

  select(columns = '*') {
    this.query = this.query.select(columns);
    this.filters.push({ method: 'select', args: [columns] });
    return this;
  }

  eq(column, value) {
    this.query = this.query.eq(column, value);
    this.filters.push({ method: 'eq', args: [column, value] });
    return this;
  }

  neq(column, value) {
    this.query = this.query.neq(column, value);
    this.filters.push({ method: 'neq', args: [column, value] });
    return this;
  }

  gt(column, value) {
    this.query = this.query.gt(column, value);
    this.filters.push({ method: 'gt', args: [column, value] });
    return this;
  }

  gte(column, value) {
    this.query = this.query.gte(column, value);
    this.filters.push({ method: 'gte', args: [column, value] });
    return this;
  }

  lt(column, value) {
    this.query = this.query.lt(column, value);
    this.filters.push({ method: 'lt', args: [column, value] });
    return this;
  }

  lte(column, value) {
    this.query = this.query.lte(column, value);
    this.filters.push({ method: 'lte', args: [column, value] });
    return this;
  }

  like(column, pattern) {
    this.query = this.query.like(column, pattern);
    this.filters.push({ method: 'like', args: [column, pattern] });
    return this;
  }

  ilike(column, pattern) {
    this.query = this.query.ilike(column, pattern);
    this.filters.push({ method: 'ilike', args: [column, pattern] });
    return this;
  }

  in(column, values) {
    this.query = this.query.in(column, values);
    this.filters.push({ method: 'in', args: [column, values] });
    return this;
  }

  is(column, value) {
    this.query = this.query.is(column, value);
    this.filters.push({ method: 'is', args: [column, value] });
    return this;
  }

  order(column, options) {
    this.query = this.query.order(column, options);
    this.filters.push({ method: 'order', args: [column, options] });
    return this;
  }

  limit(count) {
    this.query = this.query.limit(count);
    this.filters.push({ method: 'limit', args: [count] });
    return this;
  }

  range(from, to) {
    this.query = this.query.range(from, to);
    this.filters.push({ method: 'range', args: [from, to] });
    return this;
  }

  single() {
    this.query = this.query.single();
    this.filters.push({ method: 'single', args: [] });
    return this;
  }

  maybeSingle() {
    this.query = this.query.maybeSingle();
    this.filters.push({ method: 'maybeSingle', args: [] });
    return this;
  }

  // ── Caching methods ──────────────────────────────────────────────────────

  /**
   * Enable caching for this query
   */
  cache(options = {}) {
    this.cacheOptions = {
      ttl: options.ttl || DEFAULT_TTLS[this.table] || 300,
      key: options.key || this.generateCacheKey(),
      tags: options.tags || [this.table],
      skipL1: options.skipL1 || false,
    };
    this.cacheKey = this.cacheOptions.key;
    return this;
  }

  /**
   * Generate cache key from query
   */
  generateCacheKey() {
    const filterString = JSON.stringify(this.filters);
    const hash = Buffer.from(filterString).toString('base64').substring(0, 32);
    return `query:${this.table}:${hash}`;
  }

  /**
   * Execute query with caching
   */
  async execute() {
    // If caching is not enabled, execute normally
    if (!this.cacheOptions) {
      return await this.query;
    }

    // Try to get from cache
    const cached = await cache.get(this.cacheKey);
    if (cached.value !== null) {
      return {
        data: cached.value.data,
        error: cached.value.error,
        count: cached.value.count,
        status: cached.value.status,
        statusText: cached.value.statusText,
        cached: true,
        cacheSource: cached.source,
      };
    }

    // Execute query
    const result = await this.query;

    // Cache successful results
    if (!result.error) {
      await cache.set(this.cacheKey, result, {
        ttl: this.cacheOptions.ttl,
        skipL1: this.cacheOptions.skipL1,
      });
    }

    return {
      ...result,
      cached: false,
      cacheSource: 'database',
    };
  }

  // Make the query thenable (allows await)
  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

/**
 * Create cached query builder
 */
export function cachedQuery(useWriteClient = false) {
  return {
    from: (table) => new CachedQueryBuilder(table, useWriteClient ? supabase : supabaseReadReplica),
  };
}

/**
 * Cached Supabase helpers
 */
export const cachedSupabase = {
  /**
   * Get user profile with caching
   */
  async getUserProfile(userId) {
    return await cache.getOrSet(
      CacheKeys.userProfile(userId),
      async () => {
        const { data, error } = await supabaseReadReplica
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        return error ? null : data;
      },
      { ttl: DEFAULT_TTLS.profile }
    );
  },

  /**
   * Get post with caching
   */
  async getPost(postId) {
    return await cache.getOrSet(
      CacheKeys.post(postId),
      async () => {
        const { data, error } = await supabaseReadReplica
          .from('posts')
          .select('*')
          .eq('id', postId)
          .single();
        return error ? null : data;
      },
      { ttl: DEFAULT_TTLS.post }
    );
  },

  /**
   * Get user posts with pagination and caching
   */
  async getUserPosts(userId, page = 1, limit = 20) {
    return await cache.getOrSet(
      CacheKeys.userPosts(userId, page),
      async () => {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error } = await supabaseReadReplica
          .from('posts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(from, to);

        return error ? null : data;
      },
      { ttl: DEFAULT_TTLS.post }
    );
  },

  /**
   * Get trending posts with caching
   */
  async getTrendingPosts(category = 'all', limit = 10) {
    return await cache.getOrSet(
      CacheKeys.trending(category, limit),
      async () => {
        let query = supabaseReadReplica
          .from('posts')
          .select('*')
          .order('views', { ascending: false })
          .limit(limit);

        if (category !== 'all') {
          query = query.eq('category', category);
        }

        const { data, error } = await query;
        return error ? null : data;
      },
      { ttl: DEFAULT_TTLS.trending }
    );
  },

  /**
   * Search with caching
   */
  async search(query, page = 1, limit = 20) {
    return await cache.getOrSet(
      CacheKeys.search(query, page),
      async () => {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error } = await supabaseReadReplica
          .from('posts')
          .select('*')
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .range(from, to);

        return error ? null : data;
      },
      { ttl: DEFAULT_TTLS.search }
    );
  },

  /**
   * Invalidate caches after mutations
   */
  async invalidateUser(userId) {
    await Promise.all([
      cache.delete(CacheKeys.user(userId)),
      cache.delete(CacheKeys.userProfile(userId)),
      cache.deletePattern(`posts:user:${userId}:*`),
    ]);
  },

  async invalidatePost(postId) {
    await Promise.all([
      cache.delete(CacheKeys.post(postId)),
      cache.deletePattern(`comments:post:${postId}:*`),
    ]);
  },

  async invalidateTrending() {
    await cache.deletePattern('trending:*');
  },
};

export default cachedSupabase;
