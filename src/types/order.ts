/**
 * Type definitions for order-related data structures
 */

export interface Offer {
  id: string;
  price: number;
  title: string;
  description: string;
  delivery_time: string;
  influencer_id: string;
  is_active?: boolean;
  is_popular?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InfluencerProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  custom_username?: string;
  email?: string;
  bio?: string;
  city?: string;
  is_verified?: boolean;
}

export interface OrderPricing {
  totalPrice: number;
  serviceFee: number;
  finalTotal: number;
  netAmount: number;
}

export interface OrderFormData {
  brandName: string;
  productName: string;
  brief: string;
  deadline?: string;
  specialInstructions?: string;
  paymentMethod: string;
  acceptTerms: boolean;
  files: File[];
}

export interface OrderData {
  influencerId: string;
  offerId: string;
  amount: number;
  brandName: string;
  productName: string;
  brief: string;
  deadline?: string;
  specialInstructions?: string;
}
