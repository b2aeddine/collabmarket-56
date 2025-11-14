// Validation schemas for Edge Functions using Zod
// Note: Zod needs to be imported from esm.sh for Deno

import { z } from "https://esm.sh/zod@3.22.4";

// Payment creation schema
export const createPaymentSchema = z.object({
  influencerId: z.string().uuid("Invalid influencer ID format"),
  offerId: z.string().uuid("Invalid offer ID format"),
  amount: z.number().positive("Amount must be positive").max(100000, "Amount too large"),
  brandName: z.string().min(1, "Brand name required").max(200),
  productName: z.string().min(1, "Product name required").max(200),
  brief: z.string().max(2000).optional(),
  deadline: z.string().datetime().optional().or(z.string().length(0)),
  specialInstructions: z.string().max(2000).optional(),
});

// Stripe session creation schema
export const createStripeSessionSchema = z.object({
  orderId: z.string().uuid("Invalid order ID format"),
  amount: z.number().positive("Amount must be positive").max(100000, "Amount too large"),
  description: z.string().max(500).optional(),
  successUrl: z.string().url("Invalid success URL").optional(),
  cancelUrl: z.string().url("Invalid cancel URL").optional(),
});

// Withdrawal processing schema
export const processWithdrawalSchema = z.object({
  amount: z.number().positive("Amount must be positive").max(100000, "Amount too large"),
});

// Helper function to validate and parse request body
export async function validateRequest<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    throw error;
  }
}

