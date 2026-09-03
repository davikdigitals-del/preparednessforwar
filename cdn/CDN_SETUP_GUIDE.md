# CDN Setup Guide

## Overview

This guide covers setting up Content Delivery Network (CDN) infrastructure to handle 4-5 million requests per second at the edge, achieving 60-70% cache hit rate.

## Why CDN is Critical

```
Without CDN:
6M req/s → Origin servers directly
Need: 1000+ servers
Cost: $100,000+/month
Latency: 50-200ms

With CDN:
6M req/s total
├─ 4.2M (70%) → CDN Edge (<10ms latency)
├─ 1.2M (20%) → Redis cache (3ms)
└─ 600K (10%) → Origin servers

Need: 100-200 servers
Cost: $30,000/month
Latency: 10-50ms
Savings: 70% cost reduction, 5x faster
```

## CDN Options Comparison

| Feature | Cloudflare | AWS CloudFront | Fastly | Akamai |
|---------|-----------|----------------|--------|--------|
| **Global PoPs** | 300+ | 450+ | 70+ | 4,100+ |
| **Free Tier** | Yes (unlimited) | Yes (1TB/month) | No | No |
| **Pricing** | $20-200/month | $85-500/month | $50-500/month | $1,000+/month |
| **DDoS Protection** | ✅ Free | ✅ (AWS Shield) | ✅ Paid | ✅ Included |
| **WAF** | ✅ Included | ✅ Separate | ✅ Included | ✅ Included |
| **Edge Workers** | ✅ Yes | ✅ Lambda@Edge | ✅ Compute@Edge | ✅ EdgeWorkers |
| **HTTP/3** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Image Optimization** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| **Real-time Logs** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Best For** | Startups/Growth | AWS-native | Advanced control | Enterprise |

**Recommendation:** Start with **Cloudflare** (easier, cheaper), migrate to **AWS CloudFront** if heavily using AWS services.

## Cloudflare Setup (Recommended)

### Step 1: Sign Up and Add Domain

```bash
# 1. Sign up at cloudflare.com
# 2. Add your domain
# 3. Update nameservers at your registrar to:
#    - ns1.cloudflare.com
#    - ns2.cloudflare.com
```

### Step 2: Configure DNS

```bash
# In Cloudflare Dashboard → DNS
A    @      YOUR_ORIGIN_IP    ☁️ Proxied
A    www    YOUR_ORIGIN_IP    ☁️ Proxied
A    api    YOUR_ORIGIN_IP    ☁️ Proxied
```

### Step 3: SSL/TLS Configuration

```bash
# SSL/TLS → Overview
Mode: Full (strict)

# Edge Certificates
☑ Always Use HTTPS
☑ HTTP Strict Transport Security (HSTS)
☑ Minimum TLS Version: 1.2
☑ Opportunistic Encryption
☑ TLS 1.3
```

### Step 4: Apply Cache Rules

Use the provided `cdn/cloudflare-config.json`:

```bash
# Apply via Cloudflare Dashboard
Cache → Configuration → Cache Rules

# Or via API:
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/rulesets" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data @cdn/cloudflare-config.json
```

### Step 5: Configure Firewall Rules

```javascript
// Security → WAF → Custom Rules
// See cdn/cloudflare-config.json for firewall_rules
```

### Step 6: Performance Optimization

```bash
# Speed → Optimization
☑ Auto Minify (JavaScript, CSS, HTML)
☑ Brotli
☑ HTTP/2
☑ HTTP/3 (with QUIC)
☑ Early Hints
☑ Mirage (image optimization)
☑ Polish: Lossless
☑ WebP

# Rocket Loader: OFF (can break React apps)
```

### Step 7: Deploy Cloudflare Worker (Optional)

For extreme scale (4M+ req/s at edge):

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login
wrangler login

# Initialize
wrangler init preparednessforwar-worker

# Copy worker code
cp cdn/cloudflare-worker-cache.js wrangler.toml

# Deploy
wrangler publish

# Configure route
# Add route in Cloudflare Dashboard → Workers → Routes
# Route: *preparednessforwar.com/api/*
```

### Step 8: Monitor and Verify

```bash
# Test caching
curl -I https://preparednessforwar.com/
# Look for: CF-Cache-Status: HIT

# Check analytics
# Dashboard → Analytics → Traffic
# Target cache hit rate: >70%
```

## AWS CloudFront Setup

### Step 1: Prerequisites

```bash
# Install AWS CLI
aws --version

# Configure credentials
aws configure

# Request ACM certificate
aws acm request-certificate \
  --domain-name preparednessforwar.com \
  --subject-alternative-names "*.preparednessforwar.com" \
  --validation-method DNS \
  --region us-east-1
```

### Step 2: Create S3 Buckets

```bash
# Assets bucket
aws s3 mb s3://preparednessforwar-assets

# Logs bucket
aws s3 mb s3://preparednessforwar-logs

# Configure bucket policy for CloudFront OAI
aws s3api put-bucket-policy \
  --bucket preparednessforwar-assets \
  --policy file://cdn/s3-bucket-policy.json
```

### Step 3: Create Origin Access Identity

```bash
aws cloudfront create-cloud-front-origin-access-identity \
  --cloud-front-origin-access-identity-config \
  CallerReference="preparednessforwar-$(date +%s)",Comment="OAI for assets"

# Note the ID for later use
```

### Step 4: Create Cache Policies

```bash
# Static assets cache policy
aws cloudfront create-cache-policy \
  --cache-policy-config file://cdn/cache-policy-static.json

# API cache policy
aws cloudfront create-cache-policy \
  --cache-policy-config file://cdn/cache-policy-api.json

# HTML cache policy
aws cloudfront create-cache-policy \
  --cache-policy-config file://cdn/cache-policy-html.json
```

### Step 5: Create WAF WebACL

```bash
# Create WAF rules
aws wafv2 create-web-acl \
  --name preparedness-for-war-waf \
  --scope CLOUDFRONT \
  --default-action Allow={} \
  --rules file://cdn/waf-rules.json \
  --visibility-config \
    SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=PWFWaf \
  --region us-east-1

# Note the ARN for distribution config
```

### Step 6: Create CloudFront Distribution

```bash
# Create distribution
aws cloudfront create-distribution \
  --distribution-config file://cdn/aws-cloudfront-distribution.json

# Wait for deployment (10-15 minutes)
aws cloudfront wait distribution-deployed \
  --id DISTRIBUTION_ID
```

### Step 7: Update DNS

```bash
# Get CloudFront domain name
aws cloudfront get-distribution --id DISTRIBUTION_ID \
  --query 'Distribution.DomainName'

# Add CNAME records in Route 53 or your DNS provider
# preparednessforwar.com → d111111abcdef8.cloudfront.net
# www.preparednessforwar.com → d111111abcdef8.cloudfront.net
```

### Step 8: Test and Monitor

```bash
# Test
curl -I https://preparednessforwar.com/
# Look for: X-Cache: Hit from cloudfront

# Monitor in CloudWatch
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value=DISTRIBUTION_ID \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

## Cache Invalidation

### Cloudflare

```bash
# Purge everything
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'

# Purge specific files
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://preparednessforwar.com/index.html"]}'

# Purge by tag (requires Enterprise plan)
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"tags":["api","posts"]}'
```

### AWS CloudFront

```bash
# Invalidate all
aws cloudfront create-invalidation \
  --distribution-id DISTRIBUTION_ID \
  --paths "/*"

# Invalidate specific paths
aws cloudfront create-invalidation \
  --distribution-id DISTRIBUTION_ID \
  --paths "/api/*" "/index.html"

# Check invalidation status
aws cloudfront get-invalidation \
  --distribution-id DISTRIBUTION_ID \
  --id INVALIDATION_ID
```

## CI/CD Integration

### Automatic Cache Invalidation on Deploy

```yaml
# .github/workflows/deploy.yml
name: Deploy and Invalidate Cache

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build
        run: npm run build
      
      - name: Deploy to S3
        run: aws s3 sync dist/ s3://preparednessforwar-assets/
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
      
      - name: Purge Cloudflare Cache
        run: |
          curl -X POST "https://api.cloudflare.com/client/v4/zones/${{ secrets.CLOUDFLARE_ZONE_ID }}/purge_cache" \
            -H "Authorization: Bearer ${{ secrets.CLOUDFLARE_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            --data '{"purge_everything":true}'
```

## Multi-CDN Strategy (Advanced)

For extreme reliability and performance:

```
User Request
     │
     ├─→ Primary CDN (Cloudflare) → 80% traffic
     │
     ├─→ Failover CDN (CloudFront) → 15% traffic
     │
     └─→ Tertiary CDN (Fastly) → 5% traffic
```

### DNS-based Load Balancing

```javascript
// Route 53 weighted routing policy
{
  "ResourceRecordSets": [
    {
      "Name": "preparednessforwar.com",
      "Type": "CNAME",
      "SetIdentifier": "cloudflare-80",
      "Weight": 80,
      "TTL": 60,
      "ResourceRecords": [{"Value": "cloudflare-domain.com"}]
    },
    {
      "Name": "preparednessforwar.com",
      "Type": "CNAME",
      "SetIdentifier": "cloudfront-15",
      "Weight": 15,
      "TTL": 60,
      "ResourceRecords": [{"Value": "d111111abcdef8.cloudfront.net"}]
    },
    {
      "Name": "preparednessforwar.com",
      "Type": "CNAME",
      "SetIdentifier": "fastly-5",
      "Weight": 5,
      "TTL": 60,
      "ResourceRecords": [{"Value": "fastly-domain.com"}]
    }
  ]
}
```

## Monitoring and Alerts

### Key Metrics to Monitor

```
1. Cache Hit Rate: Target >70%
2. Origin Requests: Should be <30% of total
3. Error Rate: Target <0.1%
4. Latency (P95): Target <100ms
5. Bandwidth Usage
6. Geographic Distribution
```

### Cloudflare Alerts

```bash
# Set up via Dashboard → Notifications → Add
- Cache Hit Rate < 70%
- Error Rate > 1%
- Origin Response Time > 500ms
- DDoS Attack Detected
```

### CloudWatch Alarms (AWS)

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name cf-cache-hit-rate-low \
  --alarm-description "Alert when cache hit rate drops below 70%" \
  --metric-name CacheHitRate \
  --namespace AWS/CloudFront \
  --statistic Average \
  --period 300 \
  --threshold 70 \
  --comparison-operator LessThanThreshold \
  --evaluation-periods 2
```

## Cost Optimization

### Cloudflare Pricing

```
Free Plan: $0/month
- Unlimited bandwidth
- Universal SSL
- DDoS protection
- 100 Cache Rules

Pro Plan: $20/month
- Image optimization
- WAF
- 20 Cache Rules upgrade

Business Plan: $200/month
- Custom SSL
- 100% uptime SLA
- PCI compliance

Enterprise: Custom pricing
- 99.99% SLA
- Dedicated account team
- Advanced DDoS
```

### AWS CloudFront Pricing

```
Data Transfer Out:
- First 10 TB: $0.085/GB
- Next 40 TB: $0.080/GB
- Next 100 TB: $0.060/GB
- Over 150 TB: $0.040/GB

Requests:
- HTTP: $0.0075 per 10,000
- HTTPS: $0.0100 per 10,000

Example (1 TB out, 100M requests):
1000 GB × $0.085 = $85
100M requests × $0.001 = $100
Total: $185/month
```

### Cost Reduction Tips

1. **Increase Cache TTLs** - Reduce origin requests
2. **Use Origin Shield** - Consolidate requests (AWS)
3. **Compress responses** - Reduce bandwidth
4. **Optimize images** - Use WebP, compression
5. **Remove unused assets** - Clean up old files
6. **Use tiered caching** - Regional edge caches

## Troubleshooting

### Low Cache Hit Rate

**Problem:** Cache hit rate < 70%

**Diagnosis:**
```bash
# Check cache headers
curl -I https://preparednessforwar.com/api/posts
# Look for: Cache-Control header

# Check query string impact
curl -I "https://preparednessforwar.com/page?v=1"
curl -I "https://preparednessforwar.com/page?v=2"
# Each creates separate cache entry
```

**Solutions:**
1. Increase TTL values
2. Normalize query strings
3. Remove cookies from cacheable requests
4. Use cache keys properly

### Cache Not Working

**Problem:** Always getting MISS

**Solutions:**
```bash
# 1. Check Cache-Control headers from origin
curl -I https://origin.preparednessforwar.com/
# Should have: Cache-Control: public, max-age=300

# 2. Verify cache rules are applied
# 3. Check if Authorization header is present
# 4. Ensure proper cache key configuration
```

### High Origin Load

**Problem:** Too many requests hitting origin

**Solutions:**
1. Enable Origin Shield (AWS)
2. Increase edge cache TTL
3. Pre-warm cache for popular content
4. Use stale-while-revalidate

## Security Best Practices

1. **Always use HTTPS** - Redirect HTTP to HTTPS
2. **Enable HSTS** - Prevent SSL stripping
3. **Configure WAF** - Block malicious traffic
4. **Rate limiting** - Prevent abuse
5. **DDoS protection** - Use CDN's built-in protection
6. **Hide origin** - Don't expose origin IP
7. **Validate certificates** - Use ACM or Cloudflare certs
8. **Monitor logs** - Watch for suspicious activity

## Next Steps

1. ✅ Choose CDN provider (Cloudflare recommended)
2. ✅ Configure DNS and SSL
3. ✅ Apply cache rules
4. → Test cache hit rate
5. → Monitor performance
6. → Optimize based on metrics
7. → Set up alerts
8. → Document runbooks

---

**Target Performance After CDN:**
- 70% requests served from edge (<10ms)
- 20% requests served from Redis (3ms)
- 10% requests hit origin (50ms)
- Overall P95 latency: <20ms
- Cost reduction: 70%
