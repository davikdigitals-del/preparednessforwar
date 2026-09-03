/**
 * Spike Test - Sudden traffic surge
 * 
 * Purpose: Test system resilience to sudden traffic spikes
 * Simulates: Flash sales, viral content, DDoS
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 100 },    // Baseline
    { duration: '10s', target: 5000 },  // Spike to 5K VUs
    { duration: '3m', target: 5000 },   // Stay at spike
    { duration: '10s', target: 100 },   // Drop back
    { duration: '1m', target: 100 },    // Baseline again
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.02'],  // Allow 2% errors during spike
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const res = http.get(`${BASE_URL}/api/trending`, {
    headers: { 'User-Agent': 'k6-spike-test' },
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  sleep(0.1);  // Very short sleep to maximize requests
}
