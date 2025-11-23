// CORS utility for Edge Functions
// SECURITY: Restrictive CORS policy by default, configurable via environment variable

export function getCorsHeaders(origin: string | null): HeadersInit {
  // Get allowed origins from environment variable
  const allowedOriginsEnv = Deno.env.get('ALLOWED_ORIGINS');
  
  // Detect environment - default to development for Lovable previews
  const isLovablePreview = origin?.includes('lovable.app') || origin?.includes('lovable.dev');
  const isLocalhost = origin?.includes('localhost') || origin?.includes('127.0.0.1');
  const isDevelopment = isLovablePreview || isLocalhost || Deno.env.get('ENVIRONMENT') === 'development';
  
  // For webhooks (no origin), be restrictive
  const isWebhook = !origin;
  
  let allowedOrigin: string | null = null;
  
  if (isWebhook) {
    // Webhooks don't have an origin - allow in dev, restrict in prod
    allowedOrigin = isDevelopment ? '*' : null;
  } else if (allowedOriginsEnv) {
    // Check if origin is in allowed list
    const origins = allowedOriginsEnv.split(',').map(o => o.trim()).filter(Boolean);
    
    if (origins.includes(origin)) {
      allowedOrigin = origin;
    } else if (isDevelopment) {
      // In development, be more permissive (Lovable previews, localhost, etc.)
      console.log(`⚠️  Origin ${origin} not in ALLOWED_ORIGINS, but allowing in development`);
      allowedOrigin = origin;
    } else {
      // In production, strict check
      console.error(`❌ Origin ${origin} not in ALLOWED_ORIGINS - rejecting request`);
      allowedOrigin = null;
    }
  } else {
    // No ALLOWED_ORIGINS configured
    if (isDevelopment) {
      // In development, allow all
      console.warn('⚠️  ALLOWED_ORIGINS not set - allowing all origins in development');
      allowedOrigin = origin || '*';
    } else {
      // In production, reject
      console.error('❌ ALLOWED_ORIGINS not set in production - CORS requests will be rejected');
      allowedOrigin = null;
    }
  }
  
  // If no origin is allowed, return minimal headers (will cause CORS error)
  if (!allowedOrigin) {
    console.error('CORS blocked - no allowed origin found');
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
    'Access-Control-Allow-Credentials': 'true',
  };
}

