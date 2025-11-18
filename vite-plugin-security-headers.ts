import type { Plugin } from 'vite';

/**
 * Vite plugin to add security headers to responses
 * These headers help protect against XSS, clickjacking, and other attacks
 */
export function securityHeaders(): Plugin {
  return {
    name: 'security-headers',
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        // Content Security Policy - adjust based on your needs
        res.setHeader(
          'Content-Security-Policy',
          [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for Vite dev
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data: https: blob:",
            "connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co",
            "frame-src 'self' https://js.stripe.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "upgrade-insecure-requests",
          ].join('; ')
        );
        
        // Prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // Prevent clickjacking
        res.setHeader('X-Frame-Options', 'DENY');
        
        // Referrer policy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // Permissions policy (formerly Feature-Policy)
        res.setHeader(
          'Permissions-Policy',
          'geolocation=(), microphone=(), camera=(), payment=()'
        );
        
        // Strict Transport Security (HSTS) - only in production
        if (process.env.NODE_ENV === 'production') {
          res.setHeader(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains; preload'
          );
        }
        
        next();
      });
    },
  };
}

