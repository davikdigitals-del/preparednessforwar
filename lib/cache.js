import { getRedisClient } from './redis.js';

/**
 * Multi-Layer Caching System
 * 
 * Layer 1: In-Memory Cache (fastest, limited size)
 * Layer 2: Redis Cache (fast, distributed)
 * Layer 3: Database (slowest, source of truth)
 * 
 * Cache Hit Rates:
 * - L1 (Memory): 60-70% hit rate, <1ms latency
 * - L2 (Redis): 25-30% hit rate, 1-5ms latency
 * - L3 (Database): 5-10% miss, 10-100ms latency
 */

// ============================================================================
// IN-MEMORY CACHE (L1)
// ============================================================================

class MemoryCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 1000; // Max items
    this.maxAge = options.maxAge || 60000; // 60 seconds default
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
    };

    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  get(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.value;
  }

  set(key, value, ttl = this.maxAge) {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      this.stats.evictions++;
    }

    this.cache.set(key, {
      value,
      expires: Date.now() + ttl,
    });

    this.stats.sets++;
  }

  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) this.stats.deletes++;
    return deleted;
  }

  clear() {
    this.cache.clear();
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired cache entries`);
    }
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: total > 0 ? (this.stats.hits / total * 100).toFixed(2) + '%' : '0%',
    };
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Global L1 cache instance
const memoryCache = new MemoryCache({
  maxSize: parseInt(process.env.MEMORY_CACHE_SIZE || '1000', 10),
  maxAge: parseInt(process.env.MEMORY_CACHE_TTL || '60000', 10),
});

// ============================================================================
// MULTI-LAYER CACHE
// ============================================================================

export class Cache {
  constructor() {
    this.redis = getRedisClient();
    this.memory = memoryCache;
  }

  /**
   * Get value from cache (L1 → L2 → miss)
   */
  async get(key) {
    // Try L1 (memory) first
    const memoryValue = this.memory.get(key);
    if (memoryValue !== null) {
      return { value: memoryValue, source: 'memory' };
    }

    // Try L2 (Redis)
    try {
      const redisValue = await this.redis.get(key);
      if (redisValue !== null) {
        // Populate L1 cache
        const parsed = JSON.parse(redisValue);
        this.memory.set(key, parsed, 30000); // 30 second L1 TTL
        return { value: parsed, source: 'redis' };
      }
    } catch (error) {
      console.error('Redis get error:', error.message);
    }

    return { value: null, source: 'miss' };
  }

  /**
   * Set value in all cache layers
   */
  async set(key, value, options = {}) {
    const {
      ttl = 300, // 5 minutes default for Redis
      l1Ttl = 60000, // 60 seconds for memory
      skipL1 = false,
    } = options;

    // Set in L1 (memory)
    if (!skipL1) {
      this.memory.set(key, value, l1Ttl);
    }

    // Set in L2 (Redis)
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Redis set error:', error.message);
    }
  }

  /**
   * Delete from all cache layers
   */
  async delete(key) {
    this.memory.delete(key);

    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis delete error:', error.message);
    }
  }

  /**
   * Delete by pattern (Redis only, memory cache doesn't support patterns)
   */
  async deletePattern(pattern) {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        console.log(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      console.error('Redis delete pattern error:', error.message);
    }
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet(key, fetchFn, options = {}) {
    // Try to get from cache
    const cached = await this.get(key);
    if (cached.value !== null) {
      return { value: cached.value, cached: true, source: cached.source };
    }

    // Cache miss - fetch from source
    const value = await fetchFn();

    // Store in cache
    if (value !== null && value !== undefined) {
      await this.set(key, value, options);
    }

    return { value, cached: false, source: 'database' };
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      memory: this.memory.getStats(),
    };
  }
}

// ============================================================================
// CACHE KEY BUILDERS
// ============================================================================

export const CacheKeys = {
  user: (userId) => `user:${userId}`,
  userProfile: (userId) => `profile:${userId}`,
  userPosts: (userId, page = 1) => `posts:user:${userId}:page:${page}`,
  post: (postId) => `post:${postId}`,
  postComments: (postId, page = 1) => `comments:post:${postId}:page:${page}`,
  feed: (userId, page = 1) => `feed:${userId}:page:${page}`,
  trending: (category, limit = 10) => `trending:${category}:${limit}`,
  search: (query, page = 1) => `search:${Buffer.from(query).toString('base64')}:${page}`,
  session: (sessionId) => `session:${sessionId}`,
  apiResponse: (endpoint, params) => `api:${endpoint}:${JSON.stringify(params)}`,
};

// ============================================================================
// CACHE MIDDLEWARE
// ============================================================================

/**
 * Express middleware for response caching
 */
export function cacheMiddleware(options = {}) {
  const {
    ttl = 60, // 60 seconds
    keyGenerator = (req) => `http:${req.method}:${req.path}:${JSON.stringify(req.query)}`,
    shouldCache = (req, res) => req.method === 'GET' && res.statusCode === 200,
    varyBy = [], // Headers to vary cache by (e.g., ['accept-language'])
  } = options;

  const cache = new Cache();

  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    let cacheKey = keyGenerator(req);

    // Add vary headers to key
    if (varyBy.length > 0) {
      const varyValues = varyBy.map(header => req.get(header) || '').join(':');
      cacheKey += `:${varyValues}`;
    }

    // Try to get from cache
    const cached = await cache.get(cacheKey);
    if (cached.value) {
      res.setHeader('X-Cache', `HIT-${cached.source.toUpperCase()}`);
      res.setHeader('X-Cache-Key', cacheKey);
      return res.json(cached.value);
    }

    // Cache miss - intercept response
    const originalJson = res.json.bind(res);
    res.json = function (data) {
      // Check if we should cache this response
      if (shouldCache(req, res)) {
        cache.set(cacheKey, data, { ttl }).catch(err => {
          console.error('Cache set error:', err);
        });
      }

      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Cache-Key', cacheKey);
      return originalJson(data);
    };

    next();
  };
}

// ============================================================================
// CACHE WARMING
// ============================================================================

/**
 * Pre-populate cache with hot data
 */
export async function warmCache(warmingFunctions) {
  console.log('Starting cache warming...');
  const cache = new Cache();
  let warmed = 0;

  for (const { key, fetchFn, ttl } of warmingFunctions) {
    try {
      const value = await fetchFn();
      await cache.set(key, value, { ttl });
      warmed++;
    } catch (error) {
      console.error(`Failed to warm cache for key ${key}:`, error.message);
    }
  }

  console.log(`Cache warming complete: ${warmed} keys warmed`);
}

// ============================================================================
// CACHE INVALIDATION PATTERNS
// ============================================================================

export class CacheInvalidator {
  constructor() {
    this.cache = new Cache();
  }

  /**
   * Invalidate user-related caches
   */
  async invalidateUser(userId) {
    await Promise.all([
      this.cache.delete(CacheKeys.user(userId)),
      this.cache.delete(CacheKeys.userProfile(userId)),
      this.cache.deletePattern(`posts:user:${userId}:*`),
      this.cache.deletePattern(`feed:${userId}:*`),
    ]);
  }

  /**
   * Invalidate post-related caches
   */
  async invalidatePost(postId, userId) {
    await Promise.all([
      this.cache.delete(CacheKeys.post(postId)),
      this.cache.deletePattern(`comments:post:${postId}:*`),
      this.cache.deletePattern(`posts:user:${userId}:*`),
      this.cache.deletePattern(`feed:*`), // Invalidate all feeds
    ]);
  }

  /**
   * Invalidate search caches
   */
  async invalidateSearch() {
    await this.cache.deletePattern('search:*');
  }

  /**
   * Invalidate trending caches
   */
  async invalidateTrending() {
    await this.cache.deletePattern('trending:*');
  }
}

// ============================================================================
// CACHE TAGS (for grouped invalidation)
// ============================================================================

export class TaggedCache extends Cache {
  /**
   * Set value with tags for grouped invalidation
   */
  async setWithTags(key, value, tags = [], options = {}) {
    await this.set(key, value, options);

    // Store tags → keys mapping in Redis
    const pipeline = this.redis.pipeline();
    for (const tag of tags) {
      pipeline.sadd(`tag:${tag}`, key);
      pipeline.expire(`tag:${tag}`, options.ttl || 300);
    }
    await pipeline.exec();
  }

  /**
   * Invalidate all keys with a specific tag
   */
  async invalidateTag(tag) {
    try {
      const keys = await this.redis.smembers(`tag:${tag}`);
      if (keys.length > 0) {
        // Delete all tagged keys
        await this.redis.del(...keys);
        // Delete the tag set itself
        await this.redis.del(`tag:${tag}`);
        console.log(`Invalidated ${keys.length} keys with tag: ${tag}`);
      }
    } catch (error) {
      console.error('Tag invalidation error:', error.message);
    }
  }
}

// ============================================================================
// EXPORT DEFAULT INSTANCE
// ============================================================================

export default new Cache();
