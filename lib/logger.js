import winston from 'winston';

/**
 * Structured Logging with Winston
 * Provides consistent, structured logging for debugging and monitoring
 */

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    return log;
  })
);

// Define transports
const transports = [
  // Console output
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.printf((info) => {
        const { timestamp, level, message, ...meta } = info;
        let log = `${timestamp} ${level}: ${message}`;
        
        if (Object.keys(meta).length > 0) {
          log += `\n${JSON.stringify(meta, null, 2)}`;
        }
        
        return log;
      })
    ),
  }),
];

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  // Error log
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      tailable: true,
    })
  );

  // Combined log
  transports.push(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      tailable: true,
    })
  );

  // HTTP log
  transports.push(
    new winston.transports.File({
      filename: 'logs/http.log',
      level: 'http',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true,
    })
  );
}

// Create logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels,
  format,
  transports,
  exitOnError: false,
});

/**
 * HTTP request logger middleware
 */
export function httpLogger(req, res, next) {
  const start = Date.now();

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    if (res.statusCode >= 500) {
      logger.error('HTTP Request', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.http('HTTP Request', logData);
    }
  });

  next();
}

/**
 * Error logger middleware
 */
export function errorLogger(err, req, res, next) {
  logger.error('Request Error', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    body: req.body,
    query: req.query,
  });

  next(err);
}

/**
 * Structured log helpers
 */
export const log = {
  info: (message, meta = {}) => logger.info(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  error: (message, meta = {}) => logger.error(message, meta),
  debug: (message, meta = {}) => logger.debug(message, meta),
  http: (message, meta = {}) => logger.http(message, meta),

  // Domain-specific loggers
  cache: (action, meta = {}) => logger.debug(`Cache ${action}`, { type: 'cache', ...meta }),
  db: (action, meta = {}) => logger.debug(`Database ${action}`, { type: 'database', ...meta }),
  redis: (action, meta = {}) => logger.debug(`Redis ${action}`, { type: 'redis', ...meta }),
  auth: (action, meta = {}) => logger.info(`Auth ${action}`, { type: 'auth', ...meta }),
  
  // Performance logging
  perf: (label, duration, meta = {}) => {
    const level = duration > 1000 ? 'warn' : 'debug';
    logger[level](`Performance: ${label}`, { duration: `${duration}ms`, ...meta });
  },

  // Security logging
  security: (event, meta = {}) => logger.warn(`Security: ${event}`, { type: 'security', ...meta }),
};

export default logger;
