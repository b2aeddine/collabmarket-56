// CORS utility for Edge Functions
// SECURITY: Restrictive CORS policy by default, configurable via environment variable

export function getCorsHeaders(origin: string | null): HeadersInit {
  // Get allowed origins from environment variable
  // Format: "https://example.com,https://app.example.com"
  // SECURITY: Never default to '*' in production
  const allowedOriginsEnv = Deno.env.get('ALLOWED_ORIGINS');
  const isDevelopment = Deno.env.get('ENVIRONMENT') === 'development';
  const isProduction = Deno.env.get('ENVIRONMENT') === 'production' || !isDevelopment;
  
  // For webhooks (no origin), be restrictive
  const isWebhook = !origin;
  
  let allowedOrigin: string | null = null;
  
  if (allowedOriginsEnv) {
    const origins = allowedOriginsEnv.split(',').map(o => o.trim()).filter(Boolean);
    
    if (origin && origins.includes(origin)) {
      // Origin is in the allowed list
      allowedOrigin = origin;
    } else if (isWebhook && isDevelopment) {
      // Allow webhooks in development only
      allowedOrigin = '*';
    } else if (isWebhook && isProduction) {
      // In production, webhooks should not have origin, but be restrictive
      // Use first allowed origin or reject
      allowedOrigin = origins[0] || null;
    } else {
      // Origin not in allowed list - reject
      allowedOrigin = null;
    }
  } else {
    // No ALLOWED_ORIGINS configured
    if (isDevelopment) {
      // In development, allow all if not configured
      console.warn('⚠️  ALLOWED_ORIGINS not set - allowing all origins in development');
      allowedOrigin = '*';
    } else {
      // In production, reject if not configured
      console.error('❌ ALLOWED_ORIGINS not set in production - CORS requests will be rejected');
      allowedOrigin = null;
    }
  }
  
  // If no origin is allowed, return minimal headers (will cause CORS error)
  if (!allowedOrigin) {
    return {
      'Access-Control-Allow-Origin': 'null',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };
  }
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true', // Only if needed for cookies/auth
  };
}

