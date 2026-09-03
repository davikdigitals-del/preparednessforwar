/**
 * Smoke Test - Quick sanity check
 * 
 * Purpose: Verify system is working with minimal load
 * Duration: 1 minute
 * VUs: 1-10
 * Expected: All requests should succeed
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 5 },   // Ramp up to 5 users
    { duration: '30s', target: 10 },  // Stay at 10 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],    // Error rate should be less than 1%
    errors: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test health endpoint
  let healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health response is valid': (r) => {
      const body = JSON.parse(r.body);
      return body.status === 'healthy' || body.status === 'degraded';
    },
  }) || errorRate.add(1);

  sleep(1);

  // Test metrics endpoint
  let metricsRes = http.get(`${BASE_URL}/metrics`);
  check(metricsRes, {
    'metrics status is 200': (r) => r.status === 200,
    'metrics response contains data': (r) => r.body.length > 0,
  }) || errorRate.add(1);

  sleep(1);

  // Test ping endpoint
  let pingRes = http.get(`${BASE_URL}/ping`);
  check(pingRes, {
    'ping status is 200': (r) => r.status === 200,
    'ping response is pong': (r) => r.body === 'pong',
  }) || errorRate.add(1);

  sleep(2);
}

export function handleSummary(data) {
  return {
    'summary-smoke.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options?.indent || '';
  const enableColors = options?.enableColors || false;
  
  let summary = `
${indent}Smoke Test Summary
${indent}═══════════════════════════════════════════
${indent}
${indent}✓ Checks: ${data.metrics.checks.passes}/${data.metrics.checks.passes + data.metrics.checks.fails}
${indent}✗ Failed: ${data.metrics.http_req_failed.values.rate * 100}%
${indent}⏱ Duration: ${data.state.testRunDurationMs / 1000}s
${indent}
${indent}Response Times:
${indent}  avg: ${data.metrics.http_req_duration.values.avg}ms
${indent}  p95: ${data.metrics.http_req_duration.values['p(95)']}ms
${indent}  p99: ${data.metrics.http_req_duration.values['p(99)']}ms
${indent}
${indent}Requests: ${data.metrics.http_reqs.values.count}
${indent}Rate: ${data.metrics.http_reqs.values.rate}/s
${indent}
`;

  return summary;
}
