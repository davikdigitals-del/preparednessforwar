# Load Testing Suite

Comprehensive load testing suite for validating 6M requests/second capacity.

## Test Types

### 1. Smoke Test
**Purpose:** Quick sanity check  
**Duration:** 1 minute  
**Load:** 1-10 VUs  
**Run:** `k6 run smoke-test.js`

```bash
k6 run smoke-test.js
```

### 2. Load Test
**Purpose:** Test under expected load  
**Duration:** 10 minutes  
**Target:** 100K req/s  
**VUs:** 1,000  
**Run:** `k6 run load-test.js`

```bash
k6 run load-test.js --vus 1000 --duration 10m
```

### 3. Stress Test
**Purpose:** Find breaking point  
**Duration:** 20 minutes  
**Target:** Gradually increase to 20K VUs  
**Run:** `k6 run stress-test.js`

```bash
k6 run stress-test.js
```

### 4. Spike Test
**Purpose:** Test sudden traffic surge  
**Duration:** 5 minutes  
**Pattern:** Sudden spike from 100 → 5,000 VUs  
**Run:** `k6 run spike-test.js`

```bash
k6 run spike-test.js
```

### 5. Soak Test
**Purpose:** Detect memory leaks  
**Duration:** 2 hours  
**Load:** Sustained 500 VUs  
**Run:** `k6 run soak-test.js`

```bash
k6 run soak-test.js
```

### 6. Capacity Test
**Purpose:** Validate 6M req/s capacity  
**Duration:** 45 minutes  
**Target:** 6M req/s  
**Run:** Requires distributed execution

```bash
# Run distributed capacity test
k6 cloud run capacity-test.js
```

## Prerequisites

### Install k6

**macOS:**
```bash
brew install k6
```

**Windows:**
```powershell
choco install k6
```

**Linux:**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

## Running Tests

### Local Testing

```bash
# Set base URL
export BASE_URL=http://localhost:3000

# Run smoke test
k6 run smoke-test.js

# Run load test
k6 run load-test.js

# Run with custom parameters
k6 run --vus 500 --duration 5m load-test.js
```

### Testing Production

```bash
# Set production URL
export BASE_URL=https://preparednessforwar.com

# Run with rate limiting consideration
k6 run --vus 100 load-test.js
```

### Distributed Testing (for 6M req/s)

```bash
# Option 1: k6 Cloud
k6 cloud login
k6 cloud run capacity-test.js

# Option 2: Self-hosted distributed testing
# Run on multiple machines and aggregate results
k6 run --out json=results.json capacity-test.js
```

## Test Scenarios

### Scenario 1: Daily Peak Traffic
```bash
# Simulate 100K req/s during peak hours
k6 run --vus 1000 --duration 10m load-test.js
```

### Scenario 2: Marketing Campaign
```bash
# Simulate sudden 10x traffic spike
k6 run spike-test.js
```

### Scenario 3: Sustained High Load
```bash
# Run for 24 hours to check stability
k6 run --duration 24h soak-test.js
```

### Scenario 4: DDoS Simulation
```bash
# Test rate limiting under attack
k6 run --vus 10000 --duration 5m stress-test.js
```

## Interpreting Results

### Success Criteria

**Smoke Test:**
- ✅ All checks pass
- ✅ Error rate < 1%
- ✅ P95 response time < 500ms

**Load Test:**
- ✅ Error rate < 1%
- ✅ P95 < 100ms
- ✅ P99 < 200ms
- ✅ Can sustain 100K req/s

**Stress Test:**
- ✅ Error rate < 5%
- ✅ P95 < 500ms
- ✅ System doesn't crash
- ✅ Recovers after load drops

**Spike Test:**
- ✅ Error rate < 2% during spike
- ✅ Auto-scaling triggers
- ✅ Returns to normal after spike

**Soak Test:**
- ✅ No memory leaks
- ✅ Consistent performance over time
- ✅ Error rate remains < 1%

**Capacity Test:**
- ✅ Can handle 6M req/s
- ✅ Error rate < 1%
- ✅ P95 < 100ms at target load
- ✅ P99 < 200ms at target load

### Key Metrics

```
http_reqs..................: Total HTTP requests
http_req_duration..........: Response time
  - avg...................: Average response time
  - p(95).................: 95th percentile
  - p(99).................: 99th percentile
http_req_failed............: Failed requests %
vus........................: Virtual users
vus_max....................: Max virtual users
iteration_duration.........: Time per iteration
```

## Monitoring During Tests

### Watch Kubernetes Pods

```bash
# Watch pod count (should auto-scale)
watch -n 1 kubectl get pods -n production

# Watch HPA
watch -n 1 kubectl get hpa -n production

# Watch resource usage
watch -n 1 kubectl top pods -n production
```

### Watch Metrics

```bash
# Grafana dashboard
open http://grafana-url/d/preparednessforwar

# Prometheus queries
# Request rate: rate(http_requests_total[1m])
# P95 latency: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
# Error rate: rate(http_requests_total{status_code=~"5.."}[1m])
```

## Distributed Load Testing

For 6M req/s, you need distributed execution:

### Method 1: k6 Cloud

```bash
# Sign up at k6.io/cloud
k6 cloud login

# Run distributed test
k6 cloud run capacity-test.js \
  --vus 100000 \
  --duration 30m
```

### Method 2: Self-Hosted with k6-operator (Kubernetes)

```bash
# Install k6-operator
kubectl apply -f https://github.com/grafana/k6-operator/releases/download/v0.0.12/bundle.yaml

# Create test job
kubectl apply -f k8s/k6-job.yaml

# Monitor test
kubectl logs -f job/k6-test -n production
```

### Method 3: Multiple Machines

```bash
# Run on 100 machines, each doing 60K req/s
# Machine 1-100:
k6 run --vus 6000 capacity-test.js

# Aggregate results with custom script
node aggregate-results.js results-*.json
```

## Cost Estimates

### k6 Cloud
```
100K VUs for 1 hour: ~$150
1M VUs for 1 hour: ~$1,500
For 6M req/s testing: ~$500-1,000 per test run
```

### Self-Hosted
```
AWS EC2: 100 × c5.2xlarge (8 vCPU) = $34/hour
Total for 1-hour test: ~$34
```

## Troubleshooting

### Test Failing

**Error: Too many open files**
```bash
# Increase file descriptor limit
ulimit -n 65536
```

**Error: Cannot create more VUs**
```bash
# Reduce VUs or use distributed testing
k6 run --vus 1000 test.js  # Instead of 10000
```

**High error rate**
- Check if rate limiting is blocking
- Verify endpoints are accessible
- Check application logs
- Monitor resource usage

### Results Not Matching Expected

1. Check network bandwidth
2. Verify application is auto-scaling
3. Check database connection pool
4. Verify Redis is not bottlenecking
5. Check CDN is serving cached content

## Best Practices

1. **Start small:** Run smoke test first
2. **Incremental:** Gradually increase load
3. **Monitor:** Watch metrics during tests
4. **Clean up:** Reset state between tests
5. **Baseline:** Establish performance baseline
6. **Repeat:** Run tests multiple times
7. **Document:** Record results and observations

## Next Steps

1. ✅ Run smoke test locally
2. → Run load test to verify 100K req/s
3. → Deploy to staging and run stress test
4. → Run soak test overnight
5. → Deploy to production
6. → Run distributed capacity test for 6M req/s
7. → Document actual capacity achieved

---

**Target:** Validate system can handle 6M requests/second with P95 < 100ms and error rate < 1%
