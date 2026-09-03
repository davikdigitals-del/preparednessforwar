import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client with Connection Pooling Configuration
 * Optimized for high-concurrency production environments
 * 
 * Architecture:
 * - Client connects through PgBouncer/Supavisor (Supabase's connection pooler)
 * - Supports transaction pooling mode for maximum throughput
 * - Configurable for read replicas
 */

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Connection pooler configuration
const POOL_MODE = process.env.SUPABASE_POOL_MODE || 'transaction'; // session, transaction
const USE_POOLER = process.env.SUPABASE_USE_POOLER !== 'false';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Get pooled connection URL
 * Supabase provides pooler endpoints at port 6543
 */
function getPooledUrl(baseUrl) {
  if (!USE_POOLER) return baseUrl;

  try {
    const url = new URL(baseUrl);
    // Supabase pooler runs on port 6543 by default
    // Format: https://[project-ref].supabase.co → https://[project-ref].pooler.supabase.com
    const hostname = url.hostname;

    if (hostname.includes('supabase.co')) {
      // Use Supavisor pooler (Supabase's connection pooler)
      url.hostname = hostname.replace('.supabase.co', '.pooler.supabase.com');
      return url.toString();
    }

    return baseUrl;
  } catch (error) {
    console.warn('Failed to parse Supabase URL for pooling:', error.message);
    return baseUrl;
  }
}

/**
 * Database configuration for optimal performance
 */
const dbConfig = {
  db: {
    // Connection pooling settings
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10),
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Server-side, no URL detection needed
    storageKey: 'prw-auth-token',
  },
  global: {
    headers: {
      'x-application-name': 'preparedness-for-war',
    },
  },
  // Retry configuration for transient failures
  realtime: {
    timeout: 20000,
  },
};

/**
 * Main Supabase client (uses anon key + RLS)
 * Suitable for most application queries
 */
export const supabase = createClient(
  USE_POOLER ? getPooledUrl(supabaseUrl) : supabaseUrl,
  supabaseAnonKey,
  dbConfig
);

/**
 * Admin Supabase client (uses service role key)
 * Bypasses RLS - use with extreme caution
 * Only for server-side operations that require elevated privileges
 */
export const supabaseAdmin = supabaseServiceKey
  ? createClient(
    USE_POOLER ? getPooledUrl(supabaseUrl) : supabaseUrl,
    supabaseServiceKey,
    {
      ...dbConfig,
      auth: {
        ...dbConfig.auth,
        persistSession: false, // Don't persist admin sessions
        autoRefreshToken: false,
      },
    }
  )
  : null;

/**
 * Read replica client (if configured)
 * Routes read queries to separate database replicas
 */
export const supabaseReadReplica = process.env.SUPABASE_READ_REPLICA_URL
  ? createClient(
    process.env.SUPABASE_READ_REPLICA_URL,
    supabaseAnonKey,
    {
      ...dbConfig,
      db: {
        ...dbConfig.db,
        // Read replicas can have larger pool size
        pool: {
          min: 5,
          max: 50,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        },
      },
    }
  )
  : supabase; // Fallback to main client

/**
 * Helper function to execute queries with automatic retry
 */
export async function executeWithRetry(queryFn, maxRetries = 3, delay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await queryFn();

      if (result.error) {
        // Check if error is retryable
        const retryableCodes = ['PGRST301', '57P03', '08006', '08003', '08000'];
        const isRetryable = retryableCodes.some(code =>
          result.error.message?.includes(code)
        );

        if (!isRetryable || attempt === maxRetries) {
          return result;
        }

        lastError = result.error;
      } else {
        return result;
      }
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }
    }

    // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, delay * attempt));
  }

  throw lastError;
}

/**
 * Query router - automatically routes to read replica for SELECT queries
 */
export function getSupabaseClient(operation = 'read') {
  if (operation === 'read' && supabaseReadReplica !== supabase) {
    return supabaseReadReplica;
  }
  return supabase;
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine for health check
      console.error('Database health check failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database health check error:', error);
    return false;
  }
}

/**
 * Get database connection pool stats (if available)
 */
export async function getPoolStats() {
  try {
    // This requires a custom function in Supabase
    const { data, error } = await supabaseAdmin
      ?.rpc('get_connection_pool_stats')
      .single();

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

/**
 * Configuration info
 */
export const connectionConfig = {
  poolMode: POOL_MODE,
  usePooler: USE_POOLER,
  pooledUrl: USE_POOLER ? getPooledUrl(supabaseUrl) : null,
  hasReadReplica: supabaseReadReplica !== supabase,
  hasAdminClient: !!supabaseAdmin,
  poolSettings: dbConfig.db.pool,
};

// Log configuration on startup
console.log('Supabase Connection Configuration:', {
  poolMode: POOL_MODE,
  usePooler: USE_POOLER,
  hasReadReplica: connectionConfig.hasReadReplica,
  poolMin: dbConfig.db.pool.min,
  poolMax: dbConfig.db.pool.max,
});

export default supabase;
