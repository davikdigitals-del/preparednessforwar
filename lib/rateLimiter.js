import { getRedisClient } from './redis.js';

/**
 * Distributed Rate Limiter using Redis
 * Uses Token Bucket algorithm with sliding window
 * Supports tiered rate limits based on user type
 */

const RATE_LIMIT_WINDOW = 60; // 60 seconds window

// Rate limit tiers (requests per minute)
export const RATE_LIMITS = {
  anonymous: parseInt(process.env.RATE_LIMIT_ANONYMOUS || '100', 10),
  authenticated: parseInt(process.env.RATE_LIMIT_AUTHENTICATED || '1000', 10),
  premium: parseInt(process.env.RATE_LIMIT_PREMIUM || '10000', 10),
  admin: parseInt(process.env.RATE_LIMIT_ADMIN || '100000', 10),
  api: parseInt(process.env.RATE_LIMIT_API || '30', 10),
};

/**
 * Get client identifier from request
 */
function getClientId(req) {
  // Use X-Forwarded-For for proxied requests
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress || 'unknown';
  
  // Add user ID if authenticated for per-user limits
  const userId = req.user?.id || req.session?.userId;
  
  return userId ? `user:${userId}` : `ip:${ip}`;
}

/**
 * Get rate limit tier for user
 */
function getRateLimitTier(req) {
  if (req.user?.role === 'admin') return RATE_LIMITS.admin;
  if (req.user?.subscription === 'premium') return RATE_LIMITS.premium;
  if (req.user?.id) return RATE_LIMITS.authenticated;
  return RATE_LIMITS.anonymous;
}

/**
 * Redis-based rate limiter middleware
 * Uses sliding window counter algorithm
 */
export function createRateLimiter(options = {}) {
  const {
    windowMs = RATE_LIMIT_WINDOW * 1000,
    max = null, // If null, use tier-based limits
    message = 'Too many requests, please try again later.',
    keyPrefix = 'rl',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  const redis = getRedisClient();

  return async (req, res, next) => {
    try {
      const clientId = getClientId(req);
      const limit = max || getRateLimitTier(req);
      const key = `${keyPrefix}:${clientId}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Use Redis pipeline for atomic operations
      const pipeline = redis.pipeline();
      
      // Increment counter
      pipeline.incr(key);
      // Set expiration if key is new
      pipeline.expire(key, Math.ceil(windowMs / 1000));
      
      const results = await pipeline.exec();
      const count = results[0][1];

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - count));
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));

      // Check if limit exceeded
      if (count > limit) {
        res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
        return res.status(429).json({
          error: message,
          retryAfter: Math.ceil(windowMs / 1000),
          limit,
          current: count,
        });
      }

      // Track response status for conditional rate limiting
      if (skipSuccessfulRequests || skipFailedRequests) {
        const originalSend = res.send;
        res.send = function (data) {
          const statusCode = res.statusCode;
          const shouldSkip =
            (skipSuccessfulRequests && statusCode < 400) ||
            (skipFailedRequests && statusCode >= 400);

          if (shouldSkip) {
            // Decrement counter if we're skipping this request
            redis.decr(key).catch(err => console.error('Rate limit decr error:', err));
          }

          return originalSend.call(this, data);
        };
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Fail open: allow request if rate limiter fails
      next();
    }
  };
}

/**
 * Advanced rate limiter with sliding window log algorithm
 * More accurate but higher memory usage
 */
export function createSlidingWindowRateLimiter(options = {}) {
  const {
    windowMs = RATE_LIMIT_WINDOW * 1000,
    max = null,
    message = 'Too many requests, please try again later.',
    keyPrefix = 'rl:sw',
  } = options;

  const redis = getRedisClient();

  return async (req, res, next) => {
    try {
      const clientId = getClientId(req);
      const limit = max || getRateLimitTier(req);
      const key = `${keyPrefix}:${clientId}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Use sorted set to store request timestamps
      const pipeline = redis.pipeline();
      
      // Remove old entries outside the window
      pipeline.zremrangebyscore(key, 0, windowStart);
      // Add current request timestamp
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      // Count requests in current window
      pipeline.zcard(key);
      // Set expiration
      pipeline.expire(key, Math.ceil(windowMs / 1000) + 1);

      const results = await pipeline.exec();
      const count = results[2][1]; // zcard result

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - count));
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));

      // Check if limit exceeded
      if (count > limit) {
        res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
        return res.status(429).json({
          error: message,
          retryAfter: Math.ceil(windowMs / 1000),
          limit,
          current: count,
        });
      }

      next();
    } catch (error) {
      console.error('Sliding window rate limiter error:', error);
      // Fail open
      next();
    }
  };
}

/**
 * Cost-based rate limiter (different endpoints have different costs)
 */
export function createCostBasedRateLimiter(options = {}) {
  const {
    windowMs = RATE_LIMIT_WINDOW * 1000,
    max = null,
    getCost = (req) => 1, // Function to determine request cost
    message = 'Rate limit exceeded',
    keyPrefix = 'rl:cost',
  } = options;

  const redis = getRedisClient();

  return async (req, res, next) => {
    try {
      const clientId = getClientId(req);
      const limit = max || getRateLimitTier(req);
      const cost = getCost(req);
      const key = `${keyPrefix}:${clientId}`;

      // Get current cost
      const currentCost = parseInt((await redis.get(key)) || '0', 10);

      // Check if adding this cost would exceed limit
      if (currentCost + cost > limit) {
        const ttl = await redis.ttl(key);
        res.setHeader('Retry-After', ttl > 0 ? ttl : Math.ceil(windowMs / 1000));
        return res.status(429).json({
          error: message,
          limit,
          current: currentCost,
          cost,
        });
      }

      // Increment cost
      const pipeline = redis.pipeline();
      pipeline.incrby(key, cost);
      pipeline.expire(key, Math.ceil(windowMs / 1000));
      await pipeline.exec();

      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - (currentCost + cost)));

      next();
    } catch (error) {
      console.error('Cost-based rate limiter error:', error);
      next();
    }
  };
}

/**
 * Burst rate limiter - allows short bursts but enforces average rate
 */
export function createBurstRateLimiter(options = {}) {
  const {
    burstLimit = 100,  // Max burst
    sustainedRate = 10, // Requests per second sustained
    keyPrefix = 'rl:burst',
  } = options;

  const redis = getRedisClient();

  return async (req, res, next) => {
    try {
      const clientId = getClientId(req);
      const key = `${keyPrefix}:${clientId}`;
      const now = Date.now();

      // Token bucket algorithm with Redis
      const script = `
        local key = KEYS[1]
        local burst = tonumber(ARGV[1])
        local rate = tonumber(ARGV[2])
        local now = tonumber(ARGV[3])
        
        local bucket = redis.call('HMGET', key, 'tokens', 'last_update')
        local tokens = tonumber(bucket[1]) or burst
        local last = tonumber(bucket[2]) or now
        
        local elapsed = now - last
        local new_tokens = math.min(burst, tokens + (elapsed / 1000) * rate)
        
        if new_tokens >= 1 then
          redis.call('HMSET', key, 'tokens', new_tokens - 1, 'last_update', now)
          redis.call('EXPIRE', key, 60)
          return {1, math.floor(new_tokens - 1)}
        else
          return {0, 0}
        end
      `;

      const result = await redis.eval(script, 1, key, burstLimit, sustainedRate, now);
      const [allowed, remainingTokens] = result;

      res.setHeader('X-RateLimit-Limit', burstLimit);
      res.setHeader('X-RateLimit-Remaining', remainingTokens);

      if (!allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded - please slow down',
          burstLimit,
          sustainedRate,
        });
      }

      next();
    } catch (error) {
      console.error('Burst rate limiter error:', error);
      next();
    }
  };
}

export default createRateLimiter;
