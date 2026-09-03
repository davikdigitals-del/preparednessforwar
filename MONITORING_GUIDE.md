# Monitoring and Observability Guide

## Overview

Comprehensive monitoring stack for tracking 6M requests/second infrastructure with real-time metrics, logging, alerting, and visualization.

## Monitoring Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│         Prometheus Metrics + Winston Logging                │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│   Prometheus     │    │      Loki        │
│  (Metrics Store) │    │   (Log Store)    │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
         ┌──────────────────────┐
         │      Grafana         │
         │   (Visualization)    │
         └──────────────────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │    Alertmanager      │
         │  (Alert Routing)     │
         └──────────────────────┘
```

## Key Metrics to Monitor

### 1. Request Metrics

**Target: 6M requests/second**

```
- http_requests_total (counter)
- http_request_duration_seconds (histogram)
- http_request_size_bytes (histogram)
- http_response_size_bytes (histogram)
- http_active_connections (gauge)
```

**Queries:**
```promql
# Current request rate
rate(http_requests_total[1m])

# P95 response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Success rate
sum(rate(http_requests_total{status_code=~"2.."}[5m])) 
/ 
sum(rate(http_requests_total[5m]))
```

### 2. Cache Metrics

**Target: 90%+ hit rate**

```
- cache_hits_total (counter)
- cache_misses_total (counter)
- cache_operation_duration_seconds (histogram)
- cache_size_items (gauge)
- cache_memory_bytes (gauge)
```

**Queries:**
```promql
# Cache hit rate
(sum(rate(cache_hits_total[5m])) 
/ 
(sum(rate(cache_hits_total[5m])) + sum(rate(cache_misses_total[5m]))))
* 100

# Cache operations per second
sum(rate(cache_hits_total[1m])) by (layer)
```

### 3. Database Metrics

**Target: <50ms P95 query time**

```
- db_queries_total (counter)
- db_query_duration_seconds (histogram)
- db_connections_active (gauge)
- db_connections_idle (gauge)
- db_connections_waiting (gauge)
```

**Queries:**
```promql
# P95 query time
histogram_quantile(0.95, sum(rate(db_query_duration_seconds_bucket[5m])) by (le))

# Query rate by operation
sum(rate(db_queries_total[1m])) by (operation)

# Connection pool usage
db_connections_active / (db_connections_active + db_connections_idle)
```

### 4. Redis Metrics

**Target: <5ms P95 command time**

```
- redis_commands_total (counter)
- redis_command_duration_seconds (histogram)
- redis_connections_active (gauge)
```

**Queries:**
```promql
# P95 Redis latency
histogram_quantile(0.95, sum(rate(redis_command_duration_seconds_bucket[5m])) by (le))

# Commands per second
sum(rate(redis_commands_total[1m]))
```

### 5. System Metrics

**Targets:**
- Memory usage: <75%
- CPU usage: <80%
- Event loop lag: <100ms

```
- nodejs_heap_size_used_bytes (gauge)
- nodejs_heap_size_total_bytes (gauge)
- process_cpu_seconds_total (counter)
- event_loop_lag_seconds (histogram)
```

**Queries:**
```promql
# Memory usage %
(nodejs_heap_size_used_bytes / nodejs_heap_size_total_bytes) * 100

# CPU usage %
rate(process_cpu_seconds_total[5m]) * 100

# Event loop lag P95
histogram_quantile(0.95, rate(event_loop_lag_seconds_bucket[5m]))
```

## Setup Instructions

### 1. Install Prometheus

```bash
# Docker Compose
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./monitoring/alerts.yml:/etc/prometheus/alerts.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'

  alertmanager:
    image: prom/alertmanager:latest
    volumes:
      - ./monitoring/alertmanager.yml:/etc/alertmanager/alertmanager.yml
    ports:
      - "9093:9093"

volumes:
  prometheus-data:
```

### 2. Install Grafana

```bash
# Add to docker-compose.yml
  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana-dashboard.json:/etc/grafana/provisioning/dashboards/dashboard.json
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false

volumes:
  grafana-data:
```

### 3. Configure Application

Update your application server to expose metrics:

```javascript
// server-redis.js - Add metrics endpoint
import { register } from './lib/metrics.js';
import { metricsMiddleware, exportMetrics } from './lib/monitoring.js';
import { httpLogger } from './lib/logger.js';

// Apply middleware
app.use(httpLogger);
app.use(metricsMiddleware);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await exportMetrics());
  } catch (error) {
    res.status(500).end(error.message);
  }
});
```

### 4. Start Monitoring Stack

```bash
# Start all services
docker-compose up -d

# Access Grafana
open http://localhost:3001
# Login: admin / admin

# Access Prometheus
open http://localhost:9090

# Access Alertmanager
open http://localhost:9093
```

### 5. Import Grafana Dashboard

1. Login to Grafana (http://localhost:3001)
2. Go to Dashboards → Import
3. Upload `monitoring/grafana-dashboard.json`
4. Select Prometheus as data source
5. Click Import

## Alerting Configuration

### Alertmanager Setup

```yaml
# monitoring/alertmanager.yml
global:
  resolve_timeout: 5m
  slack_api_url: 'YOUR_SLACK_WEBHOOK_URL'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'slack-critical'
  routes:
    - match:
        severity: critical
      receiver: 'slack-critical'
      continue: true
    
    - match:
        severity: warning
      receiver: 'slack-warnings'

receivers:
  - name: 'slack-critical'
    slack_configs:
      - channel: '#alerts-critical'
        title: '🚨 Critical Alert'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
        send_resolved: true

  - name: 'slack-warnings'
    slack_configs:
      - channel: '#alerts-warnings'
        title: '⚠️ Warning Alert'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
        send_resolved: true

  - name: 'email'
    email_configs:
      - to: 'ops-team@preparednessforwar.com'
        from: 'alerts@preparednessforwar.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alerts@preparednessforwar.com'
        auth_password: 'YOUR_PASSWORD'

  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_KEY'
```

### Alert Notification Channels

**1. Slack**
- Critical alerts → #alerts-critical
- Warnings → #alerts-warnings
- Recovery notifications

**2. Email**
- ops-team@preparednessforwar.com
- Batched every 5 minutes

**3. PagerDuty**
- On-call rotation
- Escalation policies
- Incident management

**4. SMS (Twilio)**
- Critical alerts only
- Rate limited

## Logging Strategy

### Log Levels

```javascript
import { log } from './lib/logger.js';

// DEBUG: Development debugging
log.debug('Cache lookup', { key: 'user:123', found: true });

// INFO: Normal operations
log.info('User logged in', { userId: '123', ip: '1.2.3.4' });

// WARN: Warning conditions
log.warn('Slow query detected', { duration: 1500, query: 'SELECT...' });

// ERROR: Error conditions
log.error('Database connection failed', { error: err.message });

// HTTP: Request logging (automatic)
// Handled by httpLogger middleware
```

### Log Structure

```json
{
  "timestamp": "2024-01-15 10:30:45:123",
  "level": "INFO",
  "message": "User logged in",
  "userId": "123",
  "ip": "1.2.3.4",
  "userAgent": "Mozilla/5.0...",
  "duration": "145ms"
}
```

### Log Aggregation with Loki

```yaml
# docker-compose.yml
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - ./monitoring/loki-config.yml:/etc/loki/local-config.yaml
    command: -config.file=/etc/loki/local-config.yaml

  promtail:
    image: grafana/promtail:latest
    volumes:
      - ./logs:/var/log
      - ./monitoring/promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
```

## Dashboard Panels

### Essential Panels

1. **Request Rate (req/s)**
   - Total requests
   - 2xx, 4xx, 5xx breakdown
   - Target: 6M req/s

2. **Response Time (P50, P95, P99)**
   - Target: P95 <100ms
   - Target: P99 <200ms

3. **Cache Hit Rate**
   - Memory cache hit rate
   - Redis cache hit rate
   - Combined hit rate
   - Target: >90%

4. **Error Rate**
   - % of failed requests
   - Target: <0.1%

5. **Database Performance**
   - Query duration
   - Connection pool usage
   - Slow queries

6. **System Resources**
   - CPU usage
   - Memory usage
   - Event loop lag

## Performance Targets

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Request Rate | 6M req/s | <100K req/s |
| Response Time P95 | <100ms | >200ms |
| Response Time P99 | <200ms | >500ms |
| Cache Hit Rate | >90% | <70% |
| Error Rate | <0.1% | >1% |
| Database Query P95 | <50ms | >500ms |
| Redis Command P95 | <5ms | >10ms |
| Memory Usage | <75% | >90% |
| CPU Usage | <80% | >90% |
| Active Connections | <10K | >10K |

## Troubleshooting with Metrics

### High Response Time

```promql
# Find slowest routes
topk(10, 
  histogram_quantile(0.95, 
    sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route)
  )
)

# Check database queries
topk(10,
  histogram_quantile(0.95,
    sum(rate(db_query_duration_seconds_bucket[5m])) by (le, table)
  )
)
```

### Low Cache Hit Rate

```promql
# Hit rate by layer
(sum(rate(cache_hits_total[5m])) by (layer)
/
(sum(rate(cache_hits_total[5m])) + sum(rate(cache_misses_total[5m]))) by (layer))
* 100
```

### High Error Rate

```promql
# Errors by type
sum(rate(errors_total[5m])) by (type, code)

# Failed requests by route
sum(rate(http_requests_total{status_code=~"5.."}[5m])) by (route)
```

### Memory Leak Detection

```promql
# Heap growth over time
increase(nodejs_heap_size_used_bytes[1h])

# Memory growth rate
rate(nodejs_heap_size_used_bytes[5m])
```

## Custom Metrics

### Adding Business Metrics

```javascript
import { Counter, Gauge } from 'prom-client';

// Track premium conversions
const premiumConversions = new Counter({
  name: 'premium_conversions_total',
  help: 'Total premium subscriptions',
});

premiumConversions.inc();

// Track revenue
const revenue = new Gauge({
  name: 'revenue_usd',
  help: 'Current revenue in USD',
});

revenue.set(12500.50);
```

## Monitoring Checklist

- [ ] Prometheus scraping all pods (check `/targets`)
- [ ] All alerts configured and firing correctly
- [ ] Grafana dashboards loaded and displaying data
- [ ] Alertmanager routing to correct channels
- [ ] Log aggregation working (Loki)
- [ ] Retention policies set (30 days Prometheus, 90 days Loki)
- [ ] Backup of Grafana dashboards
- [ ] On-call rotation configured
- [ ] Runbooks documented for each alert
- [ ] Load testing to verify metrics accuracy

## Cost Estimates

### Self-Hosted (AWS)

```
Prometheus + Grafana + Loki:
- EC2 instances (3x t3.medium): $75/month
- EBS storage (500GB): $50/month
- Data transfer: $20/month
Total: ~$145/month
```

### Managed Services

```
Datadog: $15-31/host/month = $1,500-$3,100/month (100 hosts)
New Relic: $99-349/user/month
Grafana Cloud: $49-299/month
Prometheus Cloud: $19-99/month

Recommended for enterprise: Datadog or New Relic
Recommended for startup: Grafana Cloud or self-hosted
```

## Next Steps

1. ✅ Implement Prometheus metrics in application
2. ✅ Deploy Prometheus + Grafana stack
3. → Configure alerts and notification channels
4. → Create runbooks for common incidents
5. → Set up log aggregation with Loki
6. → Configure dashboards for business metrics
7. → Test alert firing with load tests
8. → Train team on dashboard usage

---

**Remember:** Monitoring is not just about collecting data—it's about actionable insights that help you maintain 99.99% uptime at 6M req/s scale.
