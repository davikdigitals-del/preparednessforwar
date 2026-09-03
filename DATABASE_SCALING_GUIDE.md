# Database Scaling Guide

## Overview

This guide explains how to scale your PostgreSQL/Supabase database to handle millions of requests per second.

## Connection Pooling Architecture

```
6M req/s from users
        ↓
500-1000 Application Servers
        ↓
10-50 connections per server
        ↓
PgBouncer/Supavisor (Connection Pooler)
        ↓
PostgreSQL Database (100-500 actual connections)
```

## Supabase Connection Pooling

### Enable Supavisor (Supabase's Connection Pooler)

1. **In Supabase Dashboard:**
   - Go to Project Settings → Database
   - Find "Connection Pooling" section
   - Note the pooler URL (ends with `.pooler.supabase.com`)

2. **Configuration:**
```env
SUPABASE_USE_POOLER=true
SUPABASE_POOL_MODE=transaction
```

### Pooling Modes

**Transaction Mode (Recommended)**
- Best for high throughput
- Connections released after each transaction
- Cannot use: prepared statements, advisory locks, LISTEN/NOTIFY
- ✅ Use for: REST API, most web applications

**Session Mode**
- Connections persist for entire session
- Supports all PostgreSQL features
- Lower throughput
- ✅ Use for: Admin operations, complex transactions

## Connection Pool Configuration

### Application-Level Pool

```javascript
// lib/supabasePooled.js
db: {
  pool: {
    min: 2,           // Minimum connections per pod
    max: 10,          // Maximum connections per pod
    idleTimeoutMillis: 30000,  // 30 seconds
    connectionTimeoutMillis: 5000, // 5 seconds
  }
}
```

### Scaling Calculation

```
Total App Servers: 500
Max Connections per Server: 10
Total = 500 × 10 = 5,000 connections

PgBouncer Pool: 5,000 pooled connections
PostgreSQL: 100-500 actual connections
```

## Read Replicas

### Setup Read Replicas (Supabase Pro/Enterprise)

1. **Create Read Replicas** in Supabase Dashboard
2. **Configure Environment:**
```env
SUPABASE_READ_REPLICA_URL=https://xxx.supabase.co
```

3. **Use in Code:**
```javascript
import { getSupabaseClient } from './lib/supabasePooled.js';

// Automatically routes to read replica
const client = getSupabaseClient('read');
const { data } = await client.from('posts').select('*');
```

### Read/Write Separation Strategy

```
Read Queries (95%):
- SELECT statements
- Route to read replicas (5-50 replicas)
- Can be slightly stale (replication lag: 0-100ms)

Write Queries (5%):
- INSERT, UPDATE, DELETE
- Route to primary database
- Immediate consistency
```

## Database Optimization

### 1. Indexing Strategy

```sql
-- Find missing indexes
SELECT * FROM get_slow_queries(5);

-- Create indexes for common queries
CREATE INDEX CONCURRENTLY idx_posts_user_id_created 
ON posts(user_id, created_at DESC);

-- Partial indexes for active records
CREATE INDEX idx_active_users 
ON users(last_login) 
WHERE status = 'active';
```

### 2. Query Optimization

```sql
-- Use EXPLAIN ANALYZE to find slow queries
EXPLAIN ANALYZE
SELECT * FROM posts WHERE user_id = 'xxx';

-- Optimize with proper indexes
-- Avoid SELECT * (select only needed columns)
-- Use LIMIT for pagination
```

### 3. Prepared Statements

```javascript
// Supabase automatically uses prepared statements
// Just use consistent query patterns
const { data } = await supabase
  .from('posts')
  .select('id, title')
  .eq('user_id', userId)
  .limit(20);
```

## Monitoring

### Check Connection Pool Stats

```sql
SELECT * FROM get_connection_pool_stats();
```

**Output:**
```json
{
  "total_connections": 45,
  "active_connections": 12,
  "idle_connections": 33,
  "max_connections": 100
}
```

### Monitor Active Connections

```sql
SELECT * FROM connection_monitor;
```

### Find Slow Queries

```sql
SELECT * FROM get_slow_queries(5); -- Queries > 5 seconds
```

### Find Connection Leaks

```sql
SELECT * FROM get_connection_leaks(10); -- Idle > 10 minutes
```

### Check Table Bloat

```sql
SELECT * FROM get_table_bloat();
```

## Performance Tuning

### PostgreSQL Configuration (Supabase handles this, but for reference)

```sql
-- Shared memory (25% of total RAM)
shared_buffers = '4GB'

-- Effective cache (50-75% of total RAM)
effective_cache_size = '12GB'

-- Worker processes
max_worker_processes = 8
max_parallel_workers_per_gather = 4

-- Connection limits
max_connections = 500

-- Statement timeout (prevent runaway queries)
statement_timeout = '30s'

-- Lock timeout
lock_timeout = '10s'
```

### Vacuum Strategy

```sql
-- Check tables needing vacuum
SELECT * FROM get_tables_needing_vacuum();

-- Auto-vacuum settings (Supabase default)
autovacuum = on
autovacuum_vacuum_threshold = 50
autovacuum_vacuum_scale_factor = 0.2
```

## Scaling Phases

### Phase 1: Single Database (0-1K req/s)
- Single PostgreSQL instance
- Basic connection pooling
- Indexes on common queries
```
Cost: $25-100/month
```

### Phase 2: Connection Pooler (1K-10K req/s)
- Enable Supavisor/PgBouncer
- Optimize connection pools
- Add monitoring
```
Cost: $100-500/month
```

### Phase 3: Read Replicas (10K-100K req/s)
- 3-5 read replicas
- Read/write separation in code
- Caching layer (Redis)
```
Cost: $500-2,000/month
```

### Phase 4: Sharding (100K-1M+ req/s)
- Horizontal database sharding
- 10-50 read replicas per shard
- Multi-region deployment
```
Cost: $5,000-50,000/month
```

## Database Sharding Strategy

### When to Shard

Shard when:
- Single database exceeds 10K writes/second
- Database size > 1TB
- Query performance degrades despite optimization

### Sharding Strategies

**1. User-Based Sharding**
```
User ID % 10 → Shard 0-9
```

**2. Geographic Sharding**
```
US-East → Shard 1
US-West → Shard 2
EU → Shard 3
Asia → Shard 4
```

**3. Feature-Based Sharding**
```
Auth DB → User accounts, sessions
Content DB → Posts, comments, media
Analytics DB → Metrics, logs
```

### Implementation

```javascript
// Shard router
function getShardForUser(userId) {
  const shardId = hashCode(userId) % SHARD_COUNT;
  return shards[shardId];
}

const shard = getShardForUser(user.id);
const { data } = await shard.from('posts').select('*');
```

## Caching Strategy

### Cache Everything Possible

```
95% Cache Hit Rate Target:
- Redis: Hot data (1-60 seconds)
- CDN: Static content (1 year)
- Application: Session data (24 hours)

Remaining 5% hits database:
- 5% of 6M req/s = 300K req/s
- Manageable with replicas + sharding
```

### Cache Layers

```
Request → CDN (95% hit)
  ↓ 5% miss
Redis Cache (80% hit of misses)
  ↓ 20% miss
Read Replica (90% of DB queries)
  ↓ 10% writes
Primary Database
```

## Disaster Recovery

### Backup Strategy

```
Hourly: Incremental backups (retain 24 hours)
Daily: Full backups (retain 7 days)
Weekly: Full backups (retain 4 weeks)
Monthly: Full backups (retain 12 months)
```

### Point-in-Time Recovery (PITR)

Supabase Pro includes PITR:
- Restore to any point in last 7 days
- Recovery time: 5-30 minutes
- Zero data loss (RPO: 0 seconds)

### High Availability

```
Primary Database (US-East-1a)
   ↓ Synchronous replication
Standby Database (US-East-1b)
   ↓ Automatic failover (30 seconds)
```

## Monitoring Checklist

- [ ] Connection pool usage < 80%
- [ ] Query response time P95 < 50ms
- [ ] No queries > 5 seconds
- [ ] No idle connections > 10 minutes
- [ ] Database CPU < 70%
- [ ] Replication lag < 100ms
- [ ] Table bloat < 20%
- [ ] Index hit rate > 95%

## Common Issues

### Issue: Connection Pool Exhausted

**Symptoms:**
```
Error: Connection pool exhausted
```

**Solution:**
1. Increase `DB_POOL_MAX` (10 → 20)
2. Enable connection pooler
3. Add more application servers
4. Check for connection leaks

### Issue: Slow Queries

**Symptoms:**
- Response time > 1 second
- High database CPU

**Solution:**
1. Find slow queries: `SELECT * FROM get_slow_queries(1);`
2. Add indexes
3. Optimize query (use EXPLAIN ANALYZE)
4. Cache results in Redis

### Issue: Replication Lag

**Symptoms:**
- Read replicas showing stale data
- Lag > 1 second

**Solution:**
1. Check network between primary and replicas
2. Reduce write load
3. Upgrade database tier
4. Add more replicas to distribute load

### Issue: Database Connection Timeout

**Symptoms:**
```
Error: Connection timeout after 5000ms
```

**Solution:**
1. Enable connection pooler
2. Increase `DB_CONNECTION_TIMEOUT`
3. Check database health
4. Scale database instance

## Setup Instructions

### 1. Run Setup SQL

```bash
# In Supabase SQL Editor
psql -h your-project.supabase.co -U postgres -f database/SETUP_CONNECTION_POOLING.sql
```

### 2. Update Environment Variables

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Update Application Code

```javascript
// Replace old import
// import { supabase } from './integrations/supabase/client';

// With new pooled version
import { supabase } from './lib/supabasePooled';
```

### 4. Test Connection

```javascript
import { checkDatabaseHealth } from './lib/supabasePooled';

const healthy = await checkDatabaseHealth();
console.log('Database healthy:', healthy);
```

## Next Steps

1. ✅ Enable connection pooling
2. ✅ Run monitoring setup SQL
3. → Add Redis caching layer
4. → Setup read replicas
5. → Implement database sharding (if needed)
6. → Load test with realistic traffic

---

**Remember:** Start with connection pooling and read replicas. Only implement sharding when you exceed 100K req/s sustained load.
