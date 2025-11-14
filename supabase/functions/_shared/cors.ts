// CORS utility for Edge Functions
// Supports environment variable for allowed origins

export function getCorsHeaders(origin: string | null): HeadersInit {
  // Get allowed origins from environment variable
  // Format: "https://example.com,https://app.example.com" or "*" for all
  const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS') || '*';
  
  // For webhooks (no origin), allow all in development, restrict in production
  const isWebhook = !origin;
  const isDevelopment = Deno.env.get('ENVIRONMENT') === 'development';
  
  let allowedOrigin = '*';
  
  if (allowedOrigins !== '*') {
    const origins = allowedOrigins.split(',').map(o => o.trim());
    if (origin && origins.includes(origin)) {
      allowedOrigin = origin;
    } else if (!isWebhook || isDevelopment) {
      // Allow in development or for webhooks without origin
      allowedOrigin = '*';
    } else {
      // In production, reject unknown origins for webhooks
      allowedOrigin = origins[0] || '*';
    }
  }
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
}

