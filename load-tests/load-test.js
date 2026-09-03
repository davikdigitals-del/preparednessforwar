/**
 * Load Test - Sustained load testing
 * 
 * Purpose: Test system under normal expected load
 * Duration: 10 minutes
 * Target: 100K req/s (1.6% of max capacity)
 * VUs: ~1,000
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const requestCounter = new Counter('total_requests');

export const options = {
  stages: [
    { duration: '2m', target: 500 },   // Ramp up to 500 VUs
    { duration: '2m', target: 1000 },  // Ramp up to 1000 VUs
    { duration: '4m', target: 1000 },  // Stay at 1000 VUs for 4 minutes
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<100', 'p(99)<200'],  // 95% < 100ms, 99% < 200ms
    http_req_failed: ['rate<0.01'],                 // Error rate < 1%
    errors: ['rate<0.01'],
    response_time: ['p(95)<100'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Simulated endpoints with weights
const endpoints = [
  { path: '/', weight: 40 },
  { path: '/api/health', weight: 10 },
  { path: '/api/posts', weight: 25 },
  { path: '/api/trending', weight: 15 },
  { path: '/api/search?q=emergency', weight: 10 },
];

function weightedRandom(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * total;
  
  for (const item of items) {
    if (random < item.weight) {
      return item;
    }
    random -= item.weight;
  }
  
  return items[0];
}

export default function () {
  const endpoint = weightedRandom(endpoints);
  const startTime = new Date().getTime();
  
  const res = http.get(`${BASE_URL}${endpoint.path}`, {
    headers: {
      'User-Agent': 'k6-load-test',
    },
  });
  
  const duration = new Date().getTime() - startTime;
  responseTime.add(duration);
  requestCounter.add(1);
  
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  if (!success) {
    errorRate.add(1);
  }
  
  // Think time: simulate real user behavior
  sleep(Math.random() * 2 + 1);  // 1-3 seconds
}

export function handleSummary(data) {
  const summary = {
    test_type: 'load_test',
    duration: data.state.testRunDurationMs,
    vus_max: data.metrics.vus_max.values.max,
    requests_total: data.metrics.http_reqs.values.count,
    requests_per_second: data.metrics.http_reqs.values.rate,
    error_rate: data.metrics.http_req_failed.values.rate,
    response_times: {
      avg: data.metrics.http_req_duration.values.avg,
      min: data.metrics.http_req_duration.values.min,
      max: data.metrics.http_req_duration.values.max,
      p50: data.metrics.http_req_duration.values['p(50)'],
      p95: data.metrics.http_req_duration.values['p(95)'],
      p99: data.metrics.http_req_duration.values['p(99)'],
    },
    passed: data.metrics.checks.passes > 0 && 
            data.metrics.http_req_failed.values.rate < 0.01,
  };
  
  return {
    'summary-load.json': JSON.stringify(summary, null, 2),
    stdout: generateTextSummary(summary),
  };
}

function generateTextSummary(summary) {
  return `
╔════════════════════════════════════════════════════════════════╗
║                      LOAD TEST SUMMARY                         ║
╠════════════════════════════════════════════════════════════════╣
║ Test Duration:        ${(summary.duration / 1000).toFixed(0)}s                                    ║
║ Max VUs:              ${summary.vus_max}                                      ║
║ Total Requests:       ${summary.requests_total.toLocaleString()}                               ║
║ Requests/sec:         ${summary.requests_per_second.toFixed(2)}                              ║
║ Error Rate:           ${(summary.error_rate * 100).toFixed(2)}%                              ║
╠════════════════════════════════════════════════════════════════╣
║ Response Times:                                                ║
║   Average:            ${summary.response_times.avg.toFixed(2)}ms                             ║
║   Median (P50):       ${summary.response_times.p50.toFixed(2)}ms                             ║
║   P95:                ${summary.response_times.p95.toFixed(2)}ms                             ║
║   P99:                ${summary.response_times.p99.toFixed(2)}ms                             ║
╠════════════════════════════════════════════════════════════════╣
║ Status:               ${summary.passed ? '✓ PASSED' : '✗ FAILED'}                              ║
╚════════════════════════════════════════════════════════════════╝
`;
}
