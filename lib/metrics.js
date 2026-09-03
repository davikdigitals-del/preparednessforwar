import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

/**
 * Prometheus Metrics for Monitoring
 * Provides detailed metrics for requests, cache, database, and system health
 */

// Create a Registry
export const register = new Registry();

// Collect default metrics (CPU, memory, event loop, etc.)
collectDefaultMetrics({
  register,
  prefix: 'nodejs_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5], // GC duration buckets
});

// ============================================================================
// HTTP METRICS
// ============================================================================

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

export const httpRequestSize = new Histogram({
  name: 'http_request_size_bytes',
  help: 'HTTP request size in bytes',
  labelNames: ['method', 'route'],
  buckets: [100, 1000, 10000, 100000, 1000000, 10000000],
  registers: [register],
});

export const httpResponseSize = new Histogram({
  name: 'http_response_size_bytes',
  help: 'HTTP response size in bytes',
  labelNames: ['method', 'route'],
  buckets: [100, 1000, 10000, 100000, 1000000, 10000000],
  registers: [register],
});

export const activeConnections = new Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections',
  registers: [register],
});

// ============================================================================
// CACHE METRICS
// ============================================================================

export const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['layer'], // memory, redis
  registers: [register],
});

export const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['layer'],
  registers: [register],
});

export const cacheOperationDuration = new Histogram({
  name: 'cache_operation_duration_seconds',
  help: 'Cache operation duration in seconds',
  labelNames: ['operation', 'layer'], // get, set, delete
  buckets: [0.0001, 0.0005, 0.001, 0.005, 0.01, 0.05, 0.1],
  registers: [register],
});

export const cacheSize = new Gauge({
  name: 'cache_size_items',
  help: 'Number of items in cache',
  labelNames: ['layer'],
  registers: [register],
});

export const cacheMemoryUsage = new Gauge({
  name: 'cache_memory_bytes',
  help: 'Memory usage by cache in bytes',
  labelNames: ['layer'],
  registers: [register],
});

// ============================================================================
// DATABASE METRICS
// ============================================================================

export const dbQueriesTotal = new Counter({
  name: 'db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table', 'status'], // select, insert, update, delete
  registers: [register],
});

export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Database query duration in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

export const dbConnectionsActive = new Gauge({
  name: 'db_connections_active',
  help: 'Number of active database connections',
  labelNames: ['pool'], // primary, replica
  registers: [register],
});

export const dbConnectionsIdle = new Gauge({
  name: 'db_connections_idle',
  help: 'Number of idle database connections',
  labelNames: ['pool'],
  registers: [register],
});

export const dbConnectionsWaiting = new Gauge({
  name: 'db_connections_waiting',
  help: 'Number of waiting database connections',
  labelNames: ['pool'],
  registers: [register],
});

// ============================================================================
// REDIS METRICS
// ============================================================================

export const redisCommandsTotal = new Counter({
  name: 'redis_commands_total',
  help: 'Total number of Redis commands',
  labelNames: ['command', 'status'],
  registers: [register],
});

export const redisCommandDuration = new Histogram({
  name: 'redis_command_duration_seconds',
  help: 'Redis command duration in seconds',
  labelNames: ['command'],
  buckets: [0.0001, 0.0005, 0.001, 0.005, 0.01, 0.05, 0.1],
  registers: [register],
});

export const redisConnectionsActive = new Gauge({
  name: 'redis_connections_active',
  help: 'Number of active Redis connections',
  registers: [register],
});

// ============================================================================
// RATE LIMITING METRICS
// ============================================================================

export const rateLimitExceeded = new Counter({
  name: 'rate_limit_exceeded_total',
  help: 'Total number of rate limit violations',
  labelNames: ['tier', 'endpoint'], // anonymous, authenticated, premium, admin
  registers: [register],
});

export const rateLimitTokensConsumed = new Counter({
  name: 'rate_limit_tokens_consumed_total',
  help: 'Total number of rate limit tokens consumed',
  labelNames: ['tier'],
  registers: [register],
});

// ============================================================================
// ERROR METRICS
// ============================================================================

export const errorsTotal = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'code'], // http, database, cache, validation
  registers: [register],
});

export const uncaughtExceptions = new Counter({
  name: 'uncaught_exceptions_total',
  help: 'Total number of uncaught exceptions',
  registers: [register],
});

export const unhandledRejections = new Counter({
  name: 'unhandled_rejections_total',
  help: 'Total number of unhandled promise rejections',
  registers: [register],
});

// ============================================================================
// BUSINESS METRICS
// ============================================================================

export const usersOnline = new Gauge({
  name: 'users_online',
  help: 'Number of online users',
  registers: [register],
});

export const requestsByUser = new Counter({
  name: 'requests_by_user_total',
  help: 'Total requests by user type',
  labelNames: ['user_type'], // anonymous, authenticated, premium, admin
  registers: [register],
});

// ============================================================================
// SYSTEM METRICS
// ============================================================================

export const systemUptime = new Gauge({
  name: 'system_uptime_seconds',
  help: 'System uptime in seconds',
  registers: [register],
});

export const eventLoopLag = new Histogram({
  name: 'event_loop_lag_seconds',
  help: 'Event loop lag in seconds',
  buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1, 2],
  registers: [register],
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Update event loop lag metric
 */
let lastCheck = Date.now();
setInterval(() => {
  const now = Date.now();
  const lag = (now - lastCheck - 100) / 1000; // Expected 100ms interval
  eventLoopLag.observe(Math.max(0, lag));
  lastCheck = now;
}, 100);

/**
 * Update system uptime metric
 */
setInterval(() => {
  systemUptime.set(process.uptime());
}, 5000);

/**
 * Track uncaught exceptions
 */
process.on('uncaughtException', (err) => {
  uncaughtExceptions.inc();
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason) => {
  unhandledRejections.inc();
  console.error('Unhandled rejection:', reason);
});

/**
 * Calculate cache hit rate
 */
export function getCacheHitRate(layer = 'all') {
  const hits = cacheHits.get();
  const misses = cacheMisses.get();
  
  if (layer === 'all') {
    const totalHits = hits.values.reduce((sum, metric) => sum + metric.value, 0);
    const totalMisses = misses.values.reduce((sum, metric) => sum + metric.value, 0);
    const total = totalHits + totalMisses;
    
    return total > 0 ? (totalHits / total) * 100 : 0;
  }
  
  const layerHits = hits.values.find(m => m.labels.layer === layer)?.value || 0;
  const layerMisses = misses.values.find(m => m.labels.layer === layer)?.value || 0;
  const total = layerHits + layerMisses;
  
  return total > 0 ? (layerHits / total) * 100 : 0;
}

/**
 * Get average response time
 */
export function getAverageResponseTime() {
  const histogram = httpRequestDuration.get();
  if (!histogram.values.length) return 0;
  
  const total = histogram.values.reduce((sum, metric) => {
    return sum + (metric.metricValue?.sum || 0);
  }, 0);
  
  const count = histogram.values.reduce((sum, metric) => {
    return sum + (metric.metricValue?.count || 0);
  }, 0);
  
  return count > 0 ? total / count : 0;
}

/**
 * Get error rate (last 5 minutes)
 */
export function getErrorRate() {
  const errors = errorsTotal.get();
  const requests = httpRequestsTotal.get();
  
  const totalErrors = errors.values.reduce((sum, metric) => sum + metric.value, 0);
  const totalRequests = requests.values.reduce((sum, metric) => sum + metric.value, 0);
  
  return totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
}

/**
 * Get summary metrics
 */
export function getSummaryMetrics() {
  return {
    uptime: process.uptime(),
    cacheHitRate: getCacheHitRate(),
    cacheHitRateMemory: getCacheHitRate('memory'),
    cacheHitRateRedis: getCacheHitRate('redis'),
    averageResponseTime: getAverageResponseTime(),
    errorRate: getErrorRate(),
    memoryUsage: process.memoryUsage(),
    activeConnections: activeConnections.get().values[0]?.value || 0,
  };
}

export default register;
