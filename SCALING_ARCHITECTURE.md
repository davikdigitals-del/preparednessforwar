# Scaling Architecture to 6M Requests/Second

## Executive Summary

This document outlines the architecture required to scale Preparedness for War from a small-scale application to handling **6 million requests per second** with 99.99% uptime.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Global CDN Layer (Edge Caching)               │
│          Cloudflare/CloudFront - Handles 95% of requests         │
│                     ~5.7M req/s cached at edge                   │
└────────────────────┬────────────────────────────────────────────┘
                     │ 300K req/s to origin
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Load Balancer (Layer 7)                       │
│              AWS ALB / NGINX / HAProxy Cluster                   │
│                  SSL/TLS Termination + DDoS                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              Application Tier (Kubernetes/ECS)                   │
│                  ~500-1000 Node.js Pods                          │
│              Each pod: 300-600 req/s sustained                   │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Pod 1   │  │  Pod 2   │  │  Pod 3   │  │  Pod N   │       │
│  │ Express  │  │ Express  │  │ Express  │  │ Express  │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
└───────┼─────────────┼─────────────┼─────────────┼──────────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Redis Cluster (Caching)                       │
│              20-50 nodes, 1TB+ RAM total                         │
│         Rate limiting + Session + Application cache              │
└─────────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Database Tier (PostgreSQL)                      │
│                                                                   │
│  ┌──────────────────┐    ┌─────────────────────────────┐       │
│  │  Primary (Write) │───▶│  20-50 Read Replicas         │       │
│  │  RDS/Aurora      │    │  Geographic distribution     │       │
│  └──────────────────┘    └─────────────────────────────┘       │
│                                                                   │
│  Connection Pooler: PgBouncer (100K+ connections)                │
└─────────────────────────────────────────────────────────────────┘
```

## Phase-by-Phase Implementation

### Phase 1: Foundation (Immediate - Week 1)
**Target: 10K req/s → 100K req/s**

1. **Redis Integration**
   - Distributed rate limiting
   - Session storage
   - API response caching (5-60 seconds)
   
2. **Database Optimization**
   - Connection pooling (PgBouncer)
   - Read replicas (3-5 replicas)
   - Query optimization + indexes
   
3. **Basic CDN**
   - Static asset caching (100% hit rate)
   - HTML caching (5 minutes)
   
**Cost: $500-2,000/month**

### Phase 2: Scale-Up (Week 2-3)
**Target: 100K req/s → 500K req/s**

1. **Containerization**
   - Docker containers
   - Kubernetes/ECS deployment
   - Auto-scaling (10-100 pods)
   
2. **Advanced Caching**
   - Edge caching rules
   - API Gateway cache
   - GraphQL response cache
   
3. **Database Scaling**
   - 10-20 read replicas
   - Write sharding preparation
   - Hot data in Redis
   
**Cost: $5,000-15,000/month**

### Phase 3: Global Scale (Week 4-6)
**Target: 500K req/s → 2M req/s**

1. **Multi-Region Deployment**
   - 3-5 AWS regions (US-East, US-West, EU, Asia, South America)
   - Regional databases
   - Cross-region replication
   
2. **Advanced CDN**
   - Custom edge workers
   - Edge computing (Cloudflare Workers)
   - 95% cache hit ratio
   
3. **Database Distribution**
   - 30-50 read replicas globally
   - CockroachDB or Aurora Global Database
   - Write-through cache strategy
   
**Cost: $20,000-50,000/month**

### Phase 4: Extreme Scale (Week 7-12)
**Target: 2M req/s → 6M+ req/s**

1. **Edge Computing**
   - Cloudflare Workers (handles 4-5M req/s)
   - Lambda@Edge
   - 98% edge cache hit rate
   
2. **Microservices Architecture**
   - Separate services for auth, content, payments
   - Message queue (Kafka/SQS)
   - Event-driven architecture
   
3. **Database Sharding**
   - Horizontal database sharding
   - 100+ read replicas
   - Multi-master writes (if needed)
   
**Cost: $50,000-200,000/month**

## Technology Stack

### Current Stack
- Express.js (Node.js)
- Supabase (PostgreSQL + Auth)
- React SPA
- Stripe

### Scaled Stack
```
CDN:              Cloudflare Enterprise / AWS CloudFront
Load Balancer:    AWS ALB / NGINX Plus
App Runtime:      Node.js 20+ (containerized)
Orchestration:    Kubernetes (EKS/GKE) or AWS ECS
Cache:            Redis Enterprise Cluster (20-50 nodes)
Database:         PostgreSQL (Aurora/RDS) + Read Replicas
                  or CockroachDB for distributed writes
Message Queue:    AWS SQS / Apache Kafka
Monitoring:       Datadog / New Relic / Prometheus + Grafana
Logging:          ELK Stack / CloudWatch
Secrets:          AWS Secrets Manager / HashiCorp Vault
CI/CD:            GitHub Actions + ArgoCD
```

## Key Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Response Time (P95) | < 100ms | CDN edge caching, Redis cache |
| Response Time (P99) | < 200ms | Hot data in memory, optimized queries |
| Availability | 99.99% | Multi-region, auto-scaling, health checks |
| Cache Hit Rate | > 95% | Aggressive edge + Redis caching |
| Database Queries | < 1000/s | Cache everything, read replicas |
| Error Rate | < 0.01% | Circuit breakers, retries, fallbacks |

## Caching Strategy

### Layer 1: CDN Edge (5.7M req/s)
- **Static Assets**: 1 year cache (immutable)
- **HTML Pages**: 5-15 minutes
- **API Public Data**: 30-60 seconds
- **Personalized Content**: No cache (pass to origin)

### Layer 2: Application Cache (Redis)
- **User Sessions**: 24 hours
- **Rate Limit Counters**: 1 minute sliding window
- **API Responses**: 10-60 seconds
- **Database Query Results**: 5-30 seconds
- **Hot Data**: Keep in memory indefinitely

### Layer 3: Database
- **Query Result Cache**: Built-in PostgreSQL cache
- **Prepared Statements**: Connection-level cache
- **Materialized Views**: Pre-computed aggregations

## Database Scaling Strategy

### Connection Management
```
Users (6M active) → 500K active connections
                  ↓
         PgBouncer Pool (10K connections)
                  ↓
         PostgreSQL (1K connections per instance)
```

### Read/Write Separation
- **Writes**: Primary instance only (5-10K/s max)
- **Reads**: 50 replicas × 2K reads/s = 100K reads/s
- **Total Capacity**: 100K+ database operations/s

### Sharding Strategy (if needed)
```
Shard by:
- User ID % 10 → 10 database clusters
- Geographic region → 5 regional databases
- Feature domain → Auth DB, Content DB, Analytics DB
```

## Rate Limiting Strategy

### Redis-based Distributed Rate Limiter
```javascript
// Token bucket algorithm
User/IP → Redis key: rate:{ip}:{minute}
Rules:
- Anonymous: 100 req/min
- Authenticated: 1000 req/min
- Premium: 10000 req/min
- Admin: Unlimited
```

### Multi-Layer Rate Limiting
1. **CDN Level**: DDoS protection (10M req/s)
2. **Load Balancer**: Basic rate limits (1M req/s)
3. **Application**: Business logic limits (100K req/s)

## Cost Breakdown (At 6M req/s)

| Component | Monthly Cost |
|-----------|--------------|
| CDN (Cloudflare Enterprise) | $20,000 - $50,000 |
| Kubernetes Cluster (500-1000 nodes) | $30,000 - $80,000 |
| Redis Enterprise Cluster | $10,000 - $30,000 |
| PostgreSQL (Primary + 50 Replicas) | $15,000 - $40,000 |
| Load Balancers | $2,000 - $5,000 |
| Monitoring & Logging | $3,000 - $10,000 |
| Data Transfer | $10,000 - $30,000 |
| **Total Estimated Cost** | **$90,000 - $245,000/month** |

## Security Considerations

1. **DDoS Protection**: Cloudflare/AWS Shield
2. **WAF**: Web Application Firewall at CDN
3. **Rate Limiting**: Multi-layer protection
4. **Encryption**: TLS 1.3, encrypted at rest
5. **Secrets Management**: Vault/AWS Secrets Manager
6. **RBAC**: Fine-grained access control
7. **Audit Logging**: All actions logged

## Monitoring & Alerts

### Key Metrics to Track
- Request rate (per second)
- Response time (P50, P95, P99)
- Error rate (4xx, 5xx)
- Cache hit rate (CDN + Redis)
- Database connection pool usage
- CPU/Memory per pod
- Network throughput
- Disk I/O

### Alert Thresholds
- Error rate > 0.1% → Page on-call
- Response time P99 > 500ms → Warning
- Cache hit rate < 90% → Investigate
- Database connections > 80% → Scale
- Pod CPU > 80% → Auto-scale

## Disaster Recovery

1. **Backups**: Hourly database backups, 30-day retention
2. **Multi-Region**: Active-active in 3+ regions
3. **Failover**: Automatic (< 30 seconds)
4. **Recovery Time Objective (RTO)**: < 5 minutes
5. **Recovery Point Objective (RPO)**: < 1 minute

## Development Workflow

```
Developer Push
     ↓
GitHub Actions (CI)
     ↓
Build Docker Image
     ↓
Push to ECR/Registry
     ↓
ArgoCD (CD) - Detects change
     ↓
Rolling Update (10% → 50% → 100%)
     ↓
Health Checks Pass
     ↓
Production Live
```

## Progressive Rollout Strategy

When deploying to handle 6M req/s, use gradual rollout:

1. **Canary Deployment**: 1% traffic → new version
2. **Monitor**: Error rates, latency, metrics
3. **Expand**: 5% → 10% → 25% → 50% → 100%
4. **Rollback**: Instant if issues detected

## Next Steps

1. ✅ Review this architecture document
2. → Implement Redis-based rate limiting
3. → Setup database connection pooling
4. → Deploy CDN configuration
5. → Containerize application
6. → Setup Kubernetes/ECS
7. → Implement monitoring
8. → Load test at each phase
9. → Scale gradually

---

**Note**: This architecture can handle 6M+ requests/second, but actual implementation should be **incremental**. Start with Phase 1, validate performance, then proceed to next phases based on actual traffic growth.
