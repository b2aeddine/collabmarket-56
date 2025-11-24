import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { handleError, RateLimitError, ValidationError } from "../_shared/errorHandler.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email").max(255, "Email too long"),
  subject: z.string().trim().max(200, "Subject too long").optional(),
  message: z.string().trim().min(10, "Message too short").max(2000, "Message too long")
});

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 3600000; // 1 hour in milliseconds
const MAX_SUBMISSIONS_PER_HOUR = 3;

async function checkRateLimit(supabase: ReturnType<typeof createClient>, ipAddress: string): Promise<void> {
  const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW);
  
  // Count recent submissions from this IP
  const { data, error } = await supabase
    .from('contact_form_rate_limit')
    .select('id', { count: 'exact' })
    .eq('ip_address', ipAddress)
    .gte('created_at', oneHourAgo.toISOString());

  if (error) {
    console.error('Rate limit check error:', error);
    // Fail closed - if we can't check rate limit, deny the request
    throw new RateLimitError('Unable to verify rate limit');
  }

  const submissionCount = data?.length || 0;
  
  if (submissionCount >= MAX_SUBMISSIONS_PER_HOUR) {
    throw new RateLimitError(`Too many submissions from this IP: ${submissionCount} in the last hour`);
  }
}

async function recordSubmission(supabase: ReturnType<typeof createClient>, ipAddress: string): Promise<void> {
  const { error } = await supabase
    .from('contact_form_rate_limit')
    .insert({ ip_address: ipAddress });

  if (error) {
    console.error('Failed to record submission:', error);
    // Don't fail the request if we can't record it
  }
}

function getClientIp(req: Request): string {
  // Try multiple headers for IP detection
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnecting = req.headers.get('cf-connecting-ip');
  if (cfConnecting) {
    return cfConnecting;
  }

  // Fallback to 'unknown' if no IP can be determined
  return 'unknown';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(req);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit before processing
    await checkRateLimit(supabase, clientIp);

    const body = await req.json();

    // Validate input with Zod
    const validationResult = contactFormSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError(`Validation failed: ${validationResult.error.errors.map(e => e.message).join(', ')}`);
    }

    const { name, email, subject, message } = validationResult.data;

    // Insert contact message into database
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        subject: subject || "Nouveau message de contact",
        message,
        is_read: false
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw new Error("Failed to save message");
    }

    // Record this submission for rate limiting
    await recordSubmission(supabase, clientIp);

    console.log("Contact message saved:", data.id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Message envoyé avec succès",
      id: data.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    const errorResponse = handleError(error, 'handle-contact-form');
    return new Response(errorResponse.body, {
      status: errorResponse.status,
      headers: { ...errorResponse.headers, ...corsHeaders }
    });
  }
};

serve(handler);
