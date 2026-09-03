/**
 * Stress Test - Push beyond normal limits
 * 
 * Purpose: Find the breaking point of the system
 * Duration: 20 minutes
 * Target: Gradually increase until failure
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    { duration: '2m', target: 1000 },   // Normal load
    { duration: '3m', target: 2000 },   // Increase to 2K VUs
    { duration: '3m', target: 5000 },   // Increase to 5K VUs
    { duration: '3m', target: 10000 },  // Increase to 10K VUs
    { duration: '3m', target: 15000 },  // Push to 15K VUs
    { duration: '3m', target: 20000 },  // Push to 20K VUs
    { duration: '3m', target: 0 },      // Ramp down
  ],
  thresholds: {
    // More lenient thresholds for stress test
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.05'],  // Allow up to 5% errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const res = http.get(`${BASE_URL}/`, {
    headers: { 'User-Agent': 'k6-stress-test' },
  });
  
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  if (!success) {
    errorRate.add(1);
  }
  
  responseTime.add(res.timings.duration);
  
  sleep(0.5);  // Shorter sleep for stress test
}

export function handleSummary(data) {
  const breakingPoint = findBreakingPoint(data);
  
  return {
    'summary-stress.json': JSON.stringify({
      max_vus: data.metrics.vus_max.values.max,
      breaking_point: breakingPoint,
      max_rps: data.metrics.http_reqs.values.rate,
      error_rate_at_peak: data.metrics.http_req_failed.values.rate,
      response_time_p99_at_peak: data.metrics.http_req_duration.values['p(99)'],
    }, null, 2),
  };
}

function findBreakingPoint(data) {
  // Simplified: consider system broken when error rate > 5% or P99 > 2s
  if (data.metrics.http_req_failed.values.rate > 0.05) {
    return `Error rate exceeded 5%: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%`;
  }
  if (data.metrics.http_req_duration.values['p(99)'] > 2000) {
    return `P99 response time exceeded 2s: ${data.metrics.http_req_duration.values['p(99)'].toFixed(0)}ms`;
  }
  return 'System remained stable';
}
