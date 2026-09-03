/**
 * Capacity Test - Find maximum sustainable load
 * 
 * Purpose: Determine the maximum RPS the system can handle
 * Target: Test up to 6M req/s
 * 
 * Note: This requires distributed k6 execution across multiple machines
 */

import http from 'k6/http';
import { check } from 'k6';
import { Rate, Counter } from 'k6/metrics';

const errorRate = new Rate('errors');
const successCounter = new Counter('successful_requests');

export const options = {
  // For 6M req/s, you need to run this test distributed
  // Example: 100 k6 instances, each handling 60K req/s
  
  scenarios: {
    capacity_test: {
      executor: 'ramping-arrival-rate',
      startRate: 10000,      // Start at 10K req/s
      timeUnit: '1s',
      preAllocatedVUs: 10000,
      maxVUs: 50000,
      stages: [
        { duration: '5m', target: 100000 },   // 100K req/s
        { duration: '5m', target: 500000 },   // 500K req/s
        { duration: '5m', target: 1000000 },  // 1M req/s
        { duration: '5m', target: 2000000 },  // 2M req/s
        { duration: '5m', target: 3000000 },  // 3M req/s
        { duration: '5m', target: 6000000 },  // 6M req/s (target!)
        { duration: '10m', target: 6000000 }, // Sustain 6M req/s
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<100', 'p(99)<200'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.001'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Optimized for high throughput
export default function () {
  const res = http.get(BASE_URL, {
    headers: {
      'User-Agent': 'k6-capacity-test',
      'Connection': 'keep-alive',
    },
  });
  
  if (res.status === 200) {
    successCounter.add(1);
  } else {
    errorRate.add(1);
  }
}

export function handleSummary(data) {
  const maxRPS = data.metrics.http_reqs.values.rate;
  const targetRPS = 6000000;
  const percentOfTarget = (maxRPS / targetRPS) * 100;
  
  const summary = {
    test_type: 'capacity_test',
    target_rps: targetRPS,
    achieved_rps: maxRPS,
    percent_of_target: percentOfTarget,
    can_handle_6m_rps: maxRPS >= targetRPS && data.metrics.http_req_failed.values.rate < 0.01,
    error_rate: data.metrics.http_req_failed.values.rate,
    p95_response_time: data.metrics.http_req_duration.values['p(95)'],
    p99_response_time: data.metrics.http_req_duration.values['p(99)'],
    total_requests: data.metrics.http_reqs.values.count,
  };
  
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║              CAPACITY TEST - 6M REQ/S TARGET                   ║
╠════════════════════════════════════════════════════════════════╣
║ Target RPS:           ${targetRPS.toLocaleString()} req/s                         ║
║ Achieved RPS:         ${maxRPS.toFixed(0).padStart(10)} req/s                         ║
║ Percentage:           ${percentOfTarget.toFixed(2)}%                                ║
║                                                                ║
║ Error Rate:           ${(summary.error_rate * 100).toFixed(3)}%                              ║
║ P95 Response:         ${summary.p95_response_time.toFixed(2)}ms                             ║
║ P99 Response:         ${summary.p99_response_time.toFixed(2)}ms                             ║
║                                                                ║
║ Result:               ${summary.can_handle_6m_rps ? '✓ PASSED' : '✗ NEEDS OPTIMIZATION'}              ║
╚════════════════════════════════════════════════════════════════╝
  `);
  
  return {
    'summary-capacity.json': JSON.stringify(summary, null, 2),
  };
}
