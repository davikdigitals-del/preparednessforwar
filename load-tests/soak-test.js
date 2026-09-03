/**
 * Soak Test - Extended duration test
 * 
 * Purpose: Detect memory leaks, degradation over time
 * Duration: 2-4 hours
 * Load: Sustained moderate load
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const memoryTrend = new Trend('memory_usage');

export const options = {
  stages: [
    { duration: '5m', target: 500 },    // Ramp up
    { duration: '2h', target: 500 },    // Soak for 2 hours
    { duration: '5m', target: 0 },      // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const res = http.get(`${BASE_URL}/`);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'no memory leak indicators': (r) => {
      // Check for memory-related headers if exposed
      return !r.headers['X-Memory-Warning'];
    },
  }) || errorRate.add(1);

  // Periodically check health endpoint
  if (__ITER % 100 === 0) {
    const healthRes = http.get(`${BASE_URL}/api/health`);
    const health = JSON.parse(healthRes.body);

    if (health.metrics?.memoryUsage) {
      memoryTrend.add(health.metrics.memoryUsage);
    }
  }

  sleep(Math.random() * 3 + 2);  // 2-5 seconds
}
