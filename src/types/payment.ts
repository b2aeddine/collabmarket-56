/**
 * Type definitions for payment-related operations
 */

export interface PaymentIntentData {
  url?: string;
  sessionId?: string;
  paymentIntentId?: string;
  clientSecret?: string;
  status?: string;
}

export interface StripeConnectPaymentParams {
  influencerId: string;
  offerId: string;
  amount: number;
  brandName: string;
  productName: string;
  brief: string;
  deadline?: string;
  requirements?: string;
}

export interface PaymentCaptureParams {
  orderId: string;
}

export interface PaymentResponse {
  url?: string;
  sessionId?: string;
  paymentIntentId?: string;
  [key: string]: unknown;
}
