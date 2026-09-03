# Multi-Layer Caching Strategy

## Overview

This document outlines the comprehensive caching architecture designed to achieve **95%+ cache hit rate** and reduce database load by 20x.

## Cache Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CDN Edge (Layer 0)                      │
│                   Cloudflare/CloudFront                     │
│            Static assets + HTML (1 year cache)              │
│                  Cache Hit Rate: 60-70%                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ 30-40% pass through
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Application Memory Cache (Layer 1)             │
│                  In-Process, Per-Pod                        │
│                Hot data, <1ms latency                       │
│                  Cache Hit Rate: 15-20%                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ 15-20% pass through
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                Redis Cache (Layer 2)                        │
│              Distributed, Shared Cache                      │
│               1-5ms latency, Persistent                     │
│                  Cache Hit Rate: 10-15%                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ 5-10% pass through
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database (Layer 3)                         │
│              PostgreSQL with Read Replicas                  │
│                10-100ms latency, Source of truth            │
│                   Cache Miss: 5-10%                         │
└─────────────────────────────────────────────────────────────┘

Total Cache Hit Rate: 90-95%
Database Load Reduction: 10-20x
```

## Cache Layers Explained

### Layer 0: CDN Edge Cache

**What:** Cloudflare/CloudFront edge locations worldwide  
**Stores:** Static assets (JS, CSS, images), HTML pages, API responses  
**TTL:** 
- Static assets: 1 year (immutable)
- HTML: 5-15 minutes
- API responses: 30-60 seconds

**Configuration:**
```javascript
// Cloudflare Cache-Control headers
res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // Static
res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=60');   // HTML
```

**Hit Rate:** 60-70% of all requests  
**Latency:** <10ms (edge location near user)

### Layer 1: Memory Cache (In-Process)

**What:** In-memory Map() per application pod  
**Stores:** Hot data, frequently accessed items  
**TTL:** 30-60 seconds  
**Max Size:** 1,000 items (configurable)

**Implementation:**
```javascript
import cache from './lib/cache.js';

// Get from all cache layers (L1 → L2 → database)
const result = await cache.get('user:123');

// Set in all layers
await cache.set('user:123', userData, { 
  ttl: 300,      // Redis: 5 minutes
  l1Ttl: 60000   // Memory: 60 seconds
});
```

**Pros:**
- Sub-millisecond latency (<1ms)
- No network calls
- Reduces Redis load

**Cons:**
- Limited size per pod
- Not shared between pods
- Lost on pod restart

**Hit Rate:** 15-20% of requests that pass CDN  
**Latency:** <1ms

### Layer 2: Redis Cache (Distributed)

**What:** Shared Redis cluster  
**Stores:** API responses, database queries, session data  
**TTL:** 1-600 seconds (configurable per key)

**Implementation:**
```javascript
// Automatic L1 + L2 caching
await cache.getOrSet('posts:user:123', async () => {
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', '123');
  return data;
}, { ttl: 300 });
```

**Pros:**
- Shared across all pods
- Persistent (survives pod restarts)
- Supports complex data structures
- Distributed (scales horizontally)

**Cons:**
- Network latency (1-5ms)
- Additional infrastructure cost
- Memory-bound

**Hit Rate:** 10-15% of requests that miss L1  
**Latency:** 1-5ms

### Layer 3: Database

**What:** PostgreSQL with read replicas  
**When Hit:** Cache misses only (5-10%)  
**Optimization:** Connection pooling, read replicas, indexes

## Cache TTL Strategy

| Data Type | CDN TTL | Redis TTL | Memory TTL | Reasoning |
|-----------|---------|-----------|------------|-----------|
| Static Assets | 1 year | N/A | N/A | Immutable, versioned URLs |
| User Profile | N/A | 5 min | 60 sec | Changes infrequently |
| Posts | N/A | 3 min | 30 sec | Updates occasionally |
| Comments | N/A | 2 min | 30 sec | Real-time feel needed |
| Feed | N/A | 1 min | 30 sec | Fresh content important |
| Trending | N/A | 1 min | 30 sec | Changes frequently |
| Search Results | N/A | 2 min | 30 sec | Balance freshness/load |
| Settings | N/A | 10 min | 60 sec | Changes very rarely |
| Session Data | N/A | 24 hours | N/A | Long-lived |

## Usage Examples

### Basic Caching

```javascript
import cache, { CacheKeys } from './lib/cache.js';

// Simple get/set
await cache.set('mykey', { foo: 'bar' }, { ttl: 300 });
const result = await cache.get('mykey');

// Get or set (cache-aside pattern)
const user = await cache.getOrSet(
  CacheKeys.user(userId),
  async () => {
    // Fetch from database if not cached
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return data;
  },
  { ttl: 300 }
);
```

### Cached Supabase Queries

```javascript
import { cachedQuery, cachedSupabase } from './lib/supabaseCached.js';

// Manual caching with query builder
const { data, cached, cacheSource } = await cachedQuery()
  .from('posts')
  .select('id, title, content')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(20)
  .cache({ ttl: 180 }); // Cache for 3 minutes

console.log(`Cache: ${cached ? 'HIT' : 'MISS'} from ${cacheSource}`);

// Helper functions with built-in caching
const profile = await cachedSupabase.getUserProfile(userId);
const trending = await cachedSupabase.getTrendingPosts('tech', 10);
const searchResults = await cachedSupabase.search('emergency', 1, 20);
```

### HTTP Response Caching

```javascript
import { cacheMiddleware } from './lib/cache.js';

// Cache GET requests automatically
app.get('/api/posts/:userId', 
  cacheMiddleware({ 
    ttl: 180,  // 3 minutes
    keyGenerator: (req) => `posts:${req.params.userId}:${req.query.page || 1}`,
  }),
  async (req, res) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page || '1', 10);
    
    // This response will be cached
    const posts = await getPosts(userId, page);
    res.json(posts);
  }
);
```

### Tagged Caching (Grouped Invalidation)

```javascript
import { TaggedCache } from './lib/cache.js';

const cache = new TaggedCache();

// Set with tags
await cache.setWithTags(
  'post:123',
  postData,
  ['user:456', 'category:tech', 'trending'],
  { ttl: 300 }
);

// Invalidate all posts by user 456
await cache.invalidateTag('user:456');

// Invalidate all tech category posts
await cache.invalidateTag('category:tech');
```

## Cache Invalidation

### Strategies

**1. Time-based (TTL)**
- Simplest approach
- Automatic expiration
- May serve stale data until expiry

**2. Event-based (Proactive)**
- Invalidate on mutations (INSERT, UPDATE, DELETE)
- Always fresh data
- More complex to implement

**3. Hybrid**
- TTL + event-based invalidation
- Best balance of simplicity and freshness

### Implementation

```javascript
import { CacheInvalidator } from './lib/cache.js';

const invalidator = new CacheInvalidator();

// After updating a user
async function updateUser(userId, updates) {
  await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);
  
  // Invalidate related caches
  await invalidator.invalidateUser(userId);
}

// After creating a post
async function createPost(userId, postData) {
  const { data } = await supabase
    .from('posts')
    .insert(postData)
    .select()
    .single();
  
  // Invalidate user posts, feed, and trending
  await Promise.all([
    invalidator.invalidateUser(userId),
    invalidator.invalidateTrending(),
    cache.deletePattern('feed:*'), // All user feeds
  ]);
  
  return data;
}
```

## Cache Warming

Pre-populate cache with hot data on startup or schedule:

```javascript
import { warmCache } from './lib/cache.js';

// Warm cache on server start
warmCache([
  {
    key: 'trending:all:10',
    fetchFn: async () => {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .order('views', { ascending: false })
        .limit(10);
      return data;
    },
    ttl: 60,
  },
  {
    key: 'settings:global',
    fetchFn: async () => {
      const { data } = await supabase
        .from('settings')
        .select('*')
        .eq('scope', 'global')
        .single();
      return data;
    },
    ttl: 600,
  },
]);
```

## Monitoring

### Cache Statistics

```javascript
import cache from './lib/cache.js';

// Get L1 (memory) cache stats
const stats = cache.getStats();
console.log(stats);
// {
//   hits: 1250,
//   misses: 250,
//   sets: 300,
//   size: 450,
//   hitRate: '83.33%'
// }
```

### Cache Headers

Every cached response includes headers:

```
X-Cache: HIT-MEMORY        # Served from L1 cache
X-Cache: HIT-REDIS         # Served from L2 cache
X-Cache: MISS              # Fetched from database
X-Cache-Key: posts:user:123:page:1
```

### Prometheus Metrics

```
# Cache hit rate by layer
cache_hits_total{layer="memory"} 12500
cache_hits_total{layer="redis"} 3200
cache_misses_total 800

# Cache latency
cache_latency_seconds{layer="memory",quantile="0.95"} 0.0005
cache_latency_seconds{layer="redis",quantile="0.95"} 0.003
```

## CDN Configuration

### Cloudflare

```javascript
// cloudflare-cache-rules.json
{
  "rules": [
    {
      "description": "Cache static assets",
      "expression": "(http.request.uri.path matches \"^/assets/\")",
      "action": "cache",
      "action_parameters": {
        "cache": true,
        "edge_ttl": {
          "mode": "override_origin",
          "default": 31536000  // 1 year
        }
      }
    },
    {
      "description": "Cache HTML with short TTL",
      "expression": "(http.request.uri.path matches \"\\.html$\" or http.request.uri.path eq \"/\")",
      "action": "cache",
      "action_parameters": {
        "cache": true,
        "edge_ttl": {
          "mode": "override_origin",
          "default": 300  // 5 minutes
        },
        "browser_ttl": {
          "mode": "override_origin",
          "default": 0  // No browser cache
        }
      }
    },
    {
      "description": "Cache API responses",
      "expression": "(http.request.uri.path matches \"^/api/\")",
      "action": "cache",
      "action_parameters": {
        "cache": true,
        "edge_ttl": {
          "mode": "respect_origin",  // Use Cache-Control header
          "default": 60
        },
        "cache_key": {
          "custom_key": {
            "query_string": {
              "include": "*"
            },
            "header": {
              "include": ["Authorization"]
            }
          }
        }
      }
    }
  ]
}
```

### AWS CloudFront

```javascript
// cloudfront-cache-policy.json
{
  "CachePolicyConfig": {
    "Name": "PreparednessForWarCachePolicy",
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "MinTTL": 1,
    "ParametersInCacheKeyAndForwardedToOrigin": {
      "EnableAcceptEncodingGzip": true,
      "EnableAcceptEncodingBrotli": true,
      "HeadersConfig": {
        "HeaderBehavior": "whitelist",
        "Headers": {
          "Items": ["Authorization", "CloudFront-Viewer-Country"]
        }
      },
      "QueryStringsConfig": {
        "QueryStringBehavior": "all"
      },
      "CookiesConfig": {
        "CookieBehavior": "none"
      }
    }
  }
}
```

## Performance Impact

### Before Caching

```
6M requests/sec → Database
Database load: 100%
Avg response time: 50-200ms
Database connections: 10,000+
Cost: $100,000/month (database scaling)
```

### After Caching (95% hit rate)

```
6M requests/sec total
  ├─ 4.2M (70%) → CDN edge (10ms)
  ├─ 900K (15%) → Memory cache (<1ms)
  ├─ 600K (10%) → Redis cache (3ms)
  └─ 300K (5%) → Database (50ms)

Database load: 5% of original
Avg response time: 5-15ms
Database connections: 500-1,000
Cost: $10,000/month (database) + $5,000/month (Redis) = $15,000/month
Savings: $85,000/month (85% reduction)
```

## Best Practices

1. **Cache reads, not writes**: Only cache SELECT queries
2. **Short TTLs for dynamic data**: 1-5 minutes for user-generated content
3. **Long TTLs for static data**: Hours to days for settings, categories
4. **Invalidate proactively**: Clear cache on mutations
5. **Monitor hit rates**: Aim for >90% overall hit rate
6. **Use cache tags**: Group related keys for bulk invalidation
7. **Warm critical caches**: Pre-load trending, popular content
8. **Set appropriate limits**: Prevent memory bloat in L1 cache
9. **Use compression**: Reduce Redis memory usage
10. **Plan for cache failures**: Fail open, don't crash on cache errors

## Troubleshooting

### Low Hit Rate

**Problem:** Cache hit rate < 80%

**Solutions:**
1. Increase TTL values
2. Check cache key generation (too specific?)
3. Warm cache with popular items
4. Review invalidation strategy (too aggressive?)

### Stale Data

**Problem:** Users seeing outdated content

**Solutions:**
1. Reduce TTL values
2. Implement event-based invalidation
3. Add cache versioning
4. Use Cache-Control: must-revalidate

### High Memory Usage

**Problem:** Redis/Memory cache consuming too much RAM

**Solutions:**
1. Reduce L1 cache max size
2. Implement LRU eviction
3. Compress large cached values
4. Review what's being cached (too much?)

### Cache Stampede

**Problem:** Many requests hit database simultaneously on cache miss

**Solutions:**
1. Implement cache locking
2. Use probabilistic early expiration
3. Stagger cache warming
4. Implement request coalescing

---

**Next Steps:**
1. ✅ Implement caching layer
2. → Configure CDN rules
3. → Set up cache monitoring
4. → Load test cache performance
5. → Tune TTL values based on metrics
