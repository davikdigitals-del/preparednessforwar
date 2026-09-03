import { 
  httpRequestsTotal, 
  httpRequestDuration, 
  httpRequestSize,
  httpResponseSize,
  activeConnections,
  cacheHits,
  cacheMisses,
  cacheOperationDuration,
  dbQueriesTotal,
  dbQueryDuration,
  redisCommandsTotal,
  redisCommandDuration,
  rateLimitExceeded,
  errorsTotal,
  requestsByUser,
  register,
  getSummaryMetrics,
} from './metrics.js';
import { log } from './logger.js';

/**
 * Monitoring Middleware and Utilities
 * Integrates metrics collection into application flow
 */

// Track active connections
let activeConnectionsCount = 0;

/**
 * HTTP metrics middleware
 */
export function metricsMiddleware(req, res, next) {
  const start = Date.now();
  activeConnectionsCount++;
  activeConnections.set(activeConnectionsCount);

  // Get request size
  const requestSize = parseInt(req.headers['content-length'] || '0', 10);
  if (requestSize > 0) {
    httpRequestSize.observe(
      { method: req.method, route: req.route?.path || req.path },
      requestSize
    );
  }

  // Track user type
  const userType = req.user?.role || (req.user ? 'authenticated' : 'anonymous');
  requestsByUser.inc({ user_type: userType });

  // Override res.send to capture response size
  const originalSend = res.send;
  res.send = function (data) {
    const responseSize = Buffer.byteLength(data || '');
    httpResponseSize.observe(
      { method: req.method, route: req.route?.path || req.path },
      responseSize
    );
    return originalSend.call(this, data);
  };

  // On response finished
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path || 'unknown';
    const labels = {
      method: req.method,
      route: route,
      status_code: res.statusCode,
    };

    // Record metrics
    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, duration);

    // Track errors
    if (res.statusCode >= 400) {
      errorsTotal.inc({
        type: 'http',
        code: res.statusCode.toString(),
      });
    }

    // Decrease active connections
    activeConnectionsCount--;
    activeConnections.set(Math.max(0, activeConnectionsCount));
  });

  next();
}

/**
 * Cache monitoring wrapper
 */
export function monitorCache(layer) {
  return {
    recordHit: () => {
      cacheHits.inc({ layer });
    },

    recordMiss: () => {
      cacheMisses.inc({ layer });
    },

    recordOperation: (operation, duration) => {
      cacheOperationDuration.observe(
        { operation, layer },
        duration / 1000
      );
    },

    async measure(operation, fn) {
      const start = Date.now();
      try {
        const result = await fn();
        const duration = Date.now() - start;
        this.recordOperation(operation, duration);
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        this.recordOperation(operation, duration);
        errorsTotal.inc({ type: 'cache', code: 'error' });
        throw error;
      }
    },
  };
}

/**
 * Database monitoring wrapper
 */
export function monitorDatabase(pool = 'primary') {
  return {
    recordQuery: (operation, table, status, duration) => {
      dbQueriesTotal.inc({ operation, table, status });
      dbQueryDuration.observe({ operation, table }, duration / 1000);
    },

    async measure(operation, table, fn) {
      const start = Date.now();
      try {
        const result = await fn();
        const duration = Date.now() - start;
        this.recordQuery(operation, table, 'success', duration);
        
        if (duration > 1000) {
          log.warn('Slow database query', {
            operation,
            table,
            duration: `${duration}ms`,
            pool,
          });
        }
        
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        this.recordQuery(operation, table, 'error', duration);
        errorsTotal.inc({ type: 'database', code: error.code || 'unknown' });
        throw error;
      }
    },
  };
}

/**
 * Redis monitoring wrapper
 */
export function monitorRedis() {
  return {
    recordCommand: (command, status, duration) => {
      redisCommandsTotal.inc({ command, status });
      redisCommandDuration.observe({ command }, duration / 1000);
    },

    async measure(command, fn) {
      const start = Date.now();
      try {
        const result = await fn();
        const duration = Date.now() - start;
        this.recordCommand(command, 'success', duration);
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        this.recordCommand(command, 'error', duration);
        errorsTotal.inc({ type: 'redis', code: error.code || 'unknown' });
        throw error;
      }
    },
  };
}

/**
 * Rate limit monitoring
 */
export function recordRateLimitExceeded(tier, endpoint) {
  rateLimitExceeded.inc({ tier, endpoint });
  log.security('Rate limit exceeded', { tier, endpoint });
}

/**
 * Health check aggregator
 */
export async function getHealthStatus() {
  const metrics = getSummaryMetrics();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: metrics.uptime,
    checks: {
      memory: checkMemory(),
      cache: checkCache(metrics),
      performance: checkPerformance(metrics),
      errors: checkErrors(metrics),
    },
    metrics: {
      cacheHitRate: Math.round(metrics.cacheHitRate * 100) / 100,
      averageResponseTime: Math.round(metrics.averageResponseTime * 1000),
      errorRate: Math.round(metrics.errorRate * 100) / 100,
      activeConnections: metrics.activeConnections,
    },
  };

  // Determine overall status
  const checks = Object.values(health.checks);
  if (checks.some(c => c.status === 'critical')) {
    health.status = 'critical';
  } else if (checks.some(c => c.status === 'degraded')) {
    health.status = 'degraded';
  }

  return health;
}

/**
 * Check memory health
 */
function checkMemory() {
  const usage = process.memoryUsage();
  const heapUsedPercent = (usage.heapUsed / usage.heapTotal) * 100;

  if (heapUsedPercent > 90) {
    return {
      status: 'critical',
      message: 'Memory usage critical',
      value: `${Math.round(heapUsedPercent)}%`,
    };
  } else if (heapUsedPercent > 75) {
    return {
      status: 'degraded',
      message: 'Memory usage high',
      value: `${Math.round(heapUsedPercent)}%`,
    };
  }

  return {
    status: 'healthy',
    message: 'Memory usage normal',
    value: `${Math.round(heapUsedPercent)}%`,
  };
}

/**
 * Check cache health
 */
function checkCache(metrics) {
  const hitRate = metrics.cacheHitRate;

  if (hitRate < 50) {
    return {
      status: 'degraded',
      message: 'Cache hit rate low',
      value: `${Math.round(hitRate)}%`,
    };
  } else if (hitRate < 70) {
    return {
      status: 'degraded',
      message: 'Cache hit rate below target',
      value: `${Math.round(hitRate)}%`,
    };
  }

  return {
    status: 'healthy',
    message: 'Cache hit rate good',
    value: `${Math.round(hitRate)}%`,
  };
}

/**
 * Check performance health
 */
function checkPerformance(metrics) {
  const avgResponseTime = metrics.averageResponseTime * 1000; // Convert to ms

  if (avgResponseTime > 500) {
    return {
      status: 'critical',
      message: 'Response time very slow',
      value: `${Math.round(avgResponseTime)}ms`,
    };
  } else if (avgResponseTime > 200) {
    return {
      status: 'degraded',
      message: 'Response time slow',
      value: `${Math.round(avgResponseTime)}ms`,
    };
  }

  return {
    status: 'healthy',
    message: 'Response time good',
    value: `${Math.round(avgResponseTime)}ms`,
  };
}

/**
 * Check error rate
 */
function checkErrors(metrics) {
  const errorRate = metrics.errorRate;

  if (errorRate > 5) {
    return {
      status: 'critical',
      message: 'Error rate very high',
      value: `${Math.round(errorRate * 10) / 10}%`,
    };
  } else if (errorRate > 1) {
    return {
      status: 'degraded',
      message: 'Error rate elevated',
      value: `${Math.round(errorRate * 10) / 10}%`,
    };
  }

  return {
    status: 'healthy',
    message: 'Error rate normal',
    value: `${Math.round(errorRate * 10) / 10}%`,
  };
}

/**
 * Alert thresholds
 */
export const ALERT_THRESHOLDS = {
  errorRate: 1.0, // 1%
  responseTime: 200, // 200ms
  cacheHitRate: 70, // 70%
  memoryUsage: 75, // 75%
  activeConnections: 10000,
};

/**
 * Check if alerts should be triggered
 */
export function checkAlerts() {
  const metrics = getSummaryMetrics();
  const alerts = [];

  // Error rate alert
  if (metrics.errorRate > ALERT_THRESHOLDS.errorRate) {
    alerts.push({
      level: 'warning',
      type: 'error_rate',
      message: `Error rate ${metrics.errorRate.toFixed(2)}% exceeds threshold ${ALERT_THRESHOLDS.errorRate}%`,
      value: metrics.errorRate,
      threshold: ALERT_THRESHOLDS.errorRate,
    });
  }

  // Response time alert
  const avgResponseMs = metrics.averageResponseTime * 1000;
  if (avgResponseMs > ALERT_THRESHOLDS.responseTime) {
    alerts.push({
      level: 'warning',
      type: 'slow_response',
      message: `Average response time ${avgResponseMs.toFixed(0)}ms exceeds threshold ${ALERT_THRESHOLDS.responseTime}ms`,
      value: avgResponseMs,
      threshold: ALERT_THRESHOLDS.responseTime,
    });
  }

  // Cache hit rate alert
  if (metrics.cacheHitRate < ALERT_THRESHOLDS.cacheHitRate) {
    alerts.push({
      level: 'warning',
      type: 'low_cache_hit_rate',
      message: `Cache hit rate ${metrics.cacheHitRate.toFixed(1)}% below threshold ${ALERT_THRESHOLDS.cacheHitRate}%`,
      value: metrics.cacheHitRate,
      threshold: ALERT_THRESHOLDS.cacheHitRate,
    });
  }

  // Memory usage alert
  const memUsage = process.memoryUsage();
  const heapPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  if (heapPercent > ALERT_THRESHOLDS.memoryUsage) {
    alerts.push({
      level: 'critical',
      type: 'high_memory',
      message: `Memory usage ${heapPercent.toFixed(1)}% exceeds threshold ${ALERT_THRESHOLDS.memoryUsage}%`,
      value: heapPercent,
      threshold: ALERT_THRESHOLDS.memoryUsage,
    });
  }

  return alerts;
}

/**
 * Metrics export for Prometheus
 */
export async function exportMetrics() {
  return register.metrics();
}

/**
 * Reset all metrics (for testing)
 */
export function resetMetrics() {
  register.resetMetrics();
}

export default {
  metricsMiddleware,
  monitorCache,
  monitorDatabase,
  monitorRedis,
  recordRateLimitExceeded,
  getHealthStatus,
  checkAlerts,
  exportMetrics,
  resetMetrics,
};
