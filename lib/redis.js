import Redis from 'ioredis';

/**
 * Redis Client Configuration
 * Supports standalone, cluster, and sentinel modes
 */

const REDIS_MODE = process.env.REDIS_MODE || 'standalone'; // standalone, cluster, sentinel
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
const REDIS_DB = parseInt(process.env.REDIS_DB || '0', 10);
const REDIS_TLS = process.env.REDIS_TLS === 'true';

let redisClient = null;

/**
 * Create Redis client based on environment configuration
 */
function createRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  const baseConfig = {
    password: REDIS_PASSWORD || undefined,
    db: REDIS_DB,
    retryStrategy: (times) => {
      // Exponential backoff with max 3 seconds
      const delay = Math.min(times * 50, 3000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: true,
    lazyConnect: false,
  };

  if (REDIS_TLS) {
    baseConfig.tls = {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    };
  }

  try {
    if (REDIS_MODE === 'cluster') {
      // Redis Cluster mode (for high availability)
      const clusterNodes = process.env.REDIS_CLUSTER_NODES
        ? process.env.REDIS_CLUSTER_NODES.split(',').map(node => {
            const [host, port] = node.split(':');
            return { host, port: parseInt(port, 10) };
          })
        : [{ host: REDIS_HOST, port: REDIS_PORT }];

      redisClient = new Redis.Cluster(clusterNodes, {
        redisOptions: baseConfig,
        clusterRetryStrategy: (times) => Math.min(times * 50, 3000),
        enableReadyCheck: true,
        maxRedirections: 16,
        scaleReads: 'slave', // Read from replicas
      });

      console.log('✓ Redis Cluster connected:', clusterNodes);
    } else if (REDIS_MODE === 'sentinel') {
      // Redis Sentinel mode (for automatic failover)
      const sentinels = process.env.REDIS_SENTINELS
        ? process.env.REDIS_SENTINELS.split(',').map(node => {
            const [host, port] = node.split(':');
            return { host, port: parseInt(port, 10) };
          })
        : [{ host: REDIS_HOST, port: 26379 }];

      redisClient = new Redis({
        ...baseConfig,
        sentinels,
        name: process.env.REDIS_SENTINEL_NAME || 'mymaster',
        sentinelRetryStrategy: (times) => Math.min(times * 50, 3000),
      });

      console.log('✓ Redis Sentinel connected:', sentinels);
    } else {
      // Standalone mode (default)
      redisClient = new Redis({
        ...baseConfig,
        host: REDIS_HOST,
        port: REDIS_PORT,
      });

      console.log(`✓ Redis connected: ${REDIS_HOST}:${REDIS_PORT}`);
    }

    // Error handling
    redisClient.on('error', (err) => {
      console.error('Redis error:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('Redis client connected');
    });

    redisClient.on('ready', () => {
      console.log('Redis client ready');
    });

    redisClient.on('close', () => {
      console.warn('Redis connection closed');
    });

    redisClient.on('reconnecting', () => {
      console.log('Redis client reconnecting...');
    });

    return redisClient;
  } catch (error) {
    console.error('Failed to create Redis client:', error.message);
    // Return mock client for development without Redis
    return createMockRedisClient();
  }
}

/**
 * Mock Redis client for development without Redis server
 */
function createMockRedisClient() {
  console.warn('⚠️  Using mock Redis client (in-memory fallback)');
  const store = new Map();

  return {
    get: async (key) => store.get(key) || null,
    set: async (key, value, ...args) => {
      store.set(key, value);
      // Handle EX (expiration in seconds)
      if (args[0] === 'EX' && args[1]) {
        setTimeout(() => store.delete(key), args[1] * 1000);
      }
      return 'OK';
    },
    setex: async (key, seconds, value) => {
      store.set(key, value);
      setTimeout(() => store.delete(key), seconds * 1000);
      return 'OK';
    },
    del: async (key) => {
      store.delete(key);
      return 1;
    },
    incr: async (key) => {
      const val = parseInt(store.get(key) || '0', 10) + 1;
      store.set(key, String(val));
      return val;
    },
    expire: async (key, seconds) => {
      if (store.has(key)) {
        setTimeout(() => store.delete(key), seconds * 1000);
        return 1;
      }
      return 0;
    },
    ttl: async (key) => {
      return store.has(key) ? -1 : -2; // -1 = no expiry, -2 = doesn't exist
    },
    exists: async (key) => (store.has(key) ? 1 : 0),
    ping: async () => 'PONG',
    quit: async () => 'OK',
    disconnect: () => {},
    on: () => {},
    pipeline: () => ({
      incr: () => {},
      expire: () => {},
      exec: async () => [[null, 1], [null, 1]],
    }),
  };
}

/**
 * Get or create Redis client singleton
 */
export function getRedisClient() {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

/**
 * Close Redis connection gracefully
 */
export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis connection closed');
  }
}

/**
 * Health check for Redis
 */
export async function checkRedisHealth() {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis health check failed:', error.message);
    return false;
  }
}

export default getRedisClient;
