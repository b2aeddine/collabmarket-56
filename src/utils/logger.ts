/**
 * SECURITY: Production-safe logging utility
 * 
 * IMPORTANT: This logger prevents sensitive information from being logged in production
 * Never remove this file - it's critical for security and debugging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';

/**
 * Sanitizes data before logging to prevent sensitive information leakage
 */
function sanitizeData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle Error objects specially
  if (data instanceof Error) {
    return {
      name: data.name,
      message: data.message,
      stack: data.stack,
      ...(data.cause && { cause: sanitizeData(data.cause) }),
    };
  }

  if (typeof data === 'string') {
    // Remove potential secrets (API keys, tokens, etc.)
    return data
      .replace(/password["\s:=]+[^,\s}]+/gi, 'password: [REDACTED]')
      .replace(/token["\s:=]+[^,\s}]+/gi, 'token: [REDACTED]')
      .replace(/key["\s:=]+[^,\s}]+/gi, 'key: [REDACTED]')
      .replace(/secret["\s:=]+[^,\s}]+/gi, 'secret: [REDACTED]')
      .replace(/authorization["\s:=]+[^,\s}]+/gi, 'authorization: [REDACTED]');
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'authorization', 'apiKey', 'api_key'];
    
    for (const [key, value] of Object.entries(data)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeData(value);
      }
    }
    
    return sanitized;
  }

  return data;
}

class Logger {
  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    // In production, only log errors and warnings
    if (isProduction && (level === 'debug' || level === 'info')) {
      return;
    }

    const sanitizedArgs = args.map(sanitizeData);
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        if (isDevelopment) {
          console.debug(prefix, message, ...sanitizedArgs);
        }
        break;
      case 'info':
        if (isDevelopment) {
          console.info(prefix, message, ...sanitizedArgs);
        }
        break;
      case 'warn':
        console.warn(prefix, message, ...sanitizedArgs);
        break;
      case 'error':
        console.error(prefix, message, ...sanitizedArgs);
        // In production, you might want to send errors to a logging service
        // Example: sendToLoggingService({ level, message, args: sanitizedArgs, timestamp });
        break;
    }
  }

  debug(message: string, ...args: unknown[]): void {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.log('error', message, ...args);
  }
}

export const logger = new Logger();

// Export for convenience
export default logger;

