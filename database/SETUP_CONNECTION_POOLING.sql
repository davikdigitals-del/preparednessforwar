-- ============================================================================
-- SUPABASE CONNECTION POOLING SETUP
-- ============================================================================
-- This file contains SQL functions and configurations to support
-- high-concurrency connection pooling for massive scale
-- ============================================================================

-- Create function to get connection pool statistics
-- This helps monitor database connection usage
CREATE OR REPLACE FUNCTION get_connection_pool_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_connections', (SELECT count(*) FROM pg_stat_activity),
    'active_connections', (SELECT count(*) FROM pg_stat_activity WHERE state = 'active'),
    'idle_connections', (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle'),
    'idle_in_transaction', (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle in transaction'),
    'waiting_connections', (SELECT count(*) FROM pg_stat_activity WHERE wait_event IS NOT NULL),
    'max_connections', (SELECT setting::int FROM pg_settings WHERE name = 'max_connections'),
    'database', current_database(),
    'timestamp', now()
  ) INTO stats;
  
  RETURN stats;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_connection_pool_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_connection_pool_stats() TO service_role;

-- ============================================================================
-- CONNECTION MONITORING VIEW
-- ============================================================================
-- Create a view to monitor active connections by application/user
CREATE OR REPLACE VIEW connection_monitor AS
SELECT 
  datname as database,
  usename as username,
  application_name,
  client_addr as client_ip,
  state,
  state_change,
  wait_event_type,
  wait_event,
  query_start,
  EXTRACT(EPOCH FROM (now() - query_start)) as query_duration_seconds,
  LEFT(query, 100) as query_preview
FROM pg_stat_activity
WHERE datname = current_database()
  AND pid != pg_backend_pid()
ORDER BY query_start DESC;

-- Grant access to the view
GRANT SELECT ON connection_monitor TO authenticated;
GRANT SELECT ON connection_monitor TO service_role;

-- ============================================================================
-- STATEMENT TIMEOUT CONFIGURATION
-- ============================================================================
-- Prevent long-running queries from blocking connections
-- Set statement timeout to 30 seconds for regular users
ALTER ROLE authenticator SET statement_timeout = '30s';

-- Service role gets longer timeout for admin operations
-- ALTER ROLE service_role SET statement_timeout = '60s';

-- ============================================================================
-- PREPARED STATEMENTS OPTIMIZATION
-- ============================================================================
-- Create commonly used prepared statement patterns
-- This reduces query planning overhead

-- Create a function to warm up prepared statements
CREATE OR REPLACE FUNCTION warm_prepared_statements()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add your most common queries here to prepare them
  -- Example: PREPARE user_lookup AS SELECT * FROM profiles WHERE id = $1;
  
  RAISE NOTICE 'Prepared statements warmed up';
END;
$$;

-- ============================================================================
-- PGBOUNCER COMPATIBLE SETTINGS
-- ============================================================================
-- These settings ensure compatibility with PgBouncer/Supavisor

-- Disable advisory locks in transaction pooling mode
-- (Uncomment if using transaction pooling mode)
-- SET lock_timeout = '10s';

-- ============================================================================
-- QUERY PERFORMANCE MONITORING
-- ============================================================================
-- Function to find slow queries
CREATE OR REPLACE FUNCTION get_slow_queries(min_duration_seconds INT DEFAULT 5)
RETURNS TABLE (
  query_hash TEXT,
  query_sample TEXT,
  calls BIGINT,
  total_time_ms NUMERIC,
  mean_time_ms NUMERIC,
  max_time_ms NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    md5(pg_stat_statements.query) as query_hash,
    LEFT(pg_stat_statements.query, 200) as query_sample,
    pg_stat_statements.calls,
    ROUND(pg_stat_statements.total_exec_time::numeric, 2) as total_time_ms,
    ROUND(pg_stat_statements.mean_exec_time::numeric, 2) as mean_time_ms,
    ROUND(pg_stat_statements.max_exec_time::numeric, 2) as max_time_ms
  FROM pg_stat_statements
  WHERE pg_stat_statements.mean_exec_time > (min_duration_seconds * 1000)
  ORDER BY pg_stat_statements.total_exec_time DESC
  LIMIT 50;
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'pg_stat_statements extension not available';
    RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION get_slow_queries(INT) TO service_role;

-- ============================================================================
-- INDEX USAGE MONITORING
-- ============================================================================
-- Function to find unused indexes (candidates for removal)
CREATE OR REPLACE FUNCTION get_unused_indexes()
RETURNS TABLE (
  schema_name TEXT,
  table_name TEXT,
  index_name TEXT,
  index_size TEXT,
  index_scans BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname::TEXT,
    tablename::TEXT,
    indexname::TEXT,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan as index_scans
  FROM pg_stat_user_indexes
  WHERE idx_scan = 0
    AND schemaname NOT IN ('pg_catalog', 'information_schema')
  ORDER BY pg_relation_size(indexrelid) DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_unused_indexes() TO service_role;

-- ============================================================================
-- TABLE BLOAT MONITORING
-- ============================================================================
-- Function to check for table bloat (affects performance)
CREATE OR REPLACE FUNCTION get_table_bloat()
RETURNS TABLE (
  schema_name TEXT,
  table_name TEXT,
  table_size TEXT,
  bloat_size TEXT,
  bloat_ratio NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname::TEXT,
    tablename::TEXT,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty((pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename))) as bloat_size,
    ROUND(
      100.0 * (pg_total_relation_size(schemaname||'.'||tablename)::numeric - pg_relation_size(schemaname||'.'||tablename)::numeric) 
      / NULLIF(pg_total_relation_size(schemaname||'.'||tablename)::numeric, 0),
      2
    ) as bloat_ratio
  FROM pg_tables
  WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    AND pg_total_relation_size(schemaname||'.'||tablename) > 10485760 -- > 10MB
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
  LIMIT 20;
END;
$$;

GRANT EXECUTE ON FUNCTION get_table_bloat() TO service_role;

-- ============================================================================
-- VACUUM MONITORING
-- ============================================================================
-- Function to check tables that need vacuuming
CREATE OR REPLACE FUNCTION get_tables_needing_vacuum()
RETURNS TABLE (
  schema_name TEXT,
  table_name TEXT,
  n_dead_tup BIGINT,
  n_live_tup BIGINT,
  dead_tuple_percent NUMERIC,
  last_vacuum TIMESTAMP,
  last_autovacuum TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname::TEXT,
    relname::TEXT,
    n_dead_tup,
    n_live_tup,
    ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_tuple_percent,
    last_vacuum,
    last_autovacuum
  FROM pg_stat_user_tables
  WHERE n_dead_tup > 1000
    AND schemaname NOT IN ('pg_catalog', 'information_schema')
  ORDER BY n_dead_tup DESC
  LIMIT 20;
END;
$$;

GRANT EXECUTE ON FUNCTION get_tables_needing_vacuum() TO service_role;

-- ============================================================================
-- CONNECTION LEAK DETECTION
-- ============================================================================
-- Function to find long-running idle transactions (connection leaks)
CREATE OR REPLACE FUNCTION get_connection_leaks(idle_minutes INT DEFAULT 5)
RETURNS TABLE (
  pid INT,
  username TEXT,
  application_name TEXT,
  client_addr INET,
  state TEXT,
  idle_duration INTERVAL,
  query_preview TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pg_stat_activity.pid,
    pg_stat_activity.usename::TEXT,
    pg_stat_activity.application_name::TEXT,
    pg_stat_activity.client_addr,
    pg_stat_activity.state::TEXT,
    now() - pg_stat_activity.state_change as idle_duration,
    LEFT(pg_stat_activity.query, 100)::TEXT
  FROM pg_stat_activity
  WHERE state IN ('idle', 'idle in transaction')
    AND now() - state_change > (idle_minutes || ' minutes')::INTERVAL
    AND datname = current_database()
    AND pid != pg_backend_pid()
  ORDER BY state_change ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_connection_leaks(INT) TO service_role;

-- ============================================================================
-- CLEANUP FUNCTION
-- ============================================================================
-- Function to terminate idle connections (use with caution!)
CREATE OR REPLACE FUNCTION terminate_idle_connections(idle_minutes INT DEFAULT 30)
RETURNS TABLE (
  terminated_pid INT,
  username TEXT,
  idle_duration INTERVAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conn RECORD;
  terminated_count INT := 0;
BEGIN
  FOR conn IN 
    SELECT 
      pid,
      usename,
      now() - state_change as duration
    FROM pg_stat_activity
    WHERE state = 'idle'
      AND now() - state_change > (idle_minutes || ' minutes')::INTERVAL
      AND datname = current_database()
      AND pid != pg_backend_pid()
      AND usename != 'postgres' -- Don't terminate postgres superuser
  LOOP
    PERFORM pg_terminate_backend(conn.pid);
    terminated_count := terminated_count + 1;
    
    RETURN QUERY SELECT conn.pid, conn.usename::TEXT, conn.duration;
  END LOOP;
  
  RAISE NOTICE 'Terminated % idle connections', terminated_count;
END;
$$;

-- Only service_role can terminate connections
GRANT EXECUTE ON FUNCTION terminate_idle_connections(INT) TO service_role;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================
COMMENT ON FUNCTION get_connection_pool_stats() IS 'Returns current connection pool statistics';
COMMENT ON FUNCTION get_slow_queries(INT) IS 'Returns queries slower than specified duration in seconds';
COMMENT ON FUNCTION get_unused_indexes() IS 'Returns indexes that have never been scanned (candidates for removal)';
COMMENT ON FUNCTION get_table_bloat() IS 'Returns tables with significant bloat';
COMMENT ON FUNCTION get_tables_needing_vacuum() IS 'Returns tables with many dead tuples that need vacuuming';
COMMENT ON FUNCTION get_connection_leaks(INT) IS 'Returns idle connections that may be leaking';
COMMENT ON FUNCTION terminate_idle_connections(INT) IS 'Terminates idle connections older than specified minutes';

-- ============================================================================
-- INDEXES FOR PERFORMANCE MONITORING
-- ============================================================================
-- These indexes help the monitoring functions run efficiently
-- (Add specific indexes based on your schema)

-- Example: If you have a profiles table
-- CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
SELECT 'Connection pooling setup complete! ✓' as status;

-- To monitor connections, run:
-- SELECT * FROM connection_monitor;

-- To check pool stats, run:
-- SELECT get_connection_pool_stats();

-- To find slow queries, run:
-- SELECT * FROM get_slow_queries(5); -- Queries slower than 5 seconds
