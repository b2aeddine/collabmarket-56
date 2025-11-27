

export interface SocialNetwork {
  id: string;
  platform: string;
  username: string;
  profile_url: string;
  followers: number;
  engagement_rate: number;
  is_connected?: boolean;
  is_active?: boolean;
  user_id: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  role: 'influenceur' | 'commercant' | 'admin';
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  phone: string | null;
  is_verified: boolean | null;
  profile_views: number | null;
  stripe_account_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Computed/Frontend-only fields
  firstName?: string | null;
  lastName?: string | null;
}

export interface Offer {
  id: string;
  influencer_id: string;
  category_id?: string | null;
  title: string;
  description: string | null;
  price: number;
  delivery_time: string | null;
  is_active: boolean | null;
  is_popular: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Order {
  id: string;
  merchant_id: string;
  influencer_id: string;
  offer_id: string | null;
  status: 'pending' | 'accepted' | 'in_progress' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  total_amount: number;
  net_amount: number;
  commission_rate: number | null;
  delivery_date: string | null;
  requirements: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Relations
  offer?: {
    title: string;
    description: string | null;
    delivery_time: string | null;
  };
  influencer?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  merchant?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  // Legacy fields (optional/removed but kept if needed for transition, though better to remove)
  offer_title?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean | null;
  created_at: string | null;
}

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message_at: string | null;
  created_at: string | null;
}

export interface Revenue {
  id: string;
  influencer_id: string;
  order_id: string;
  amount: number;
  commission: number;
  net_amount: number;
  status: 'pending' | 'available' | 'withdrawn';
  created_at: string | null;
}

export interface WithdrawalRequest {
  id: string;
  influencer_id: string;
  bank_account_id: string;
  amount: number;
  status: string;
  requested_at: string | null;
  processed_at: string | null;
  admin_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface BankAccount {
  id: string;
  user_id: string;
  iban: string;
  bic: string;
  account_holder: string;
  bank_name: string;
  is_default: boolean | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: string;
  is_read: boolean | null;
  related_id: string | null;
  created_at: string | null;
}

export interface Favorite {
  id: string;
  merchant_id: string;
  influencer_id: string;
  created_at: string | null;
}

export interface Review {
  id: string;
  order_id: string;
  merchant_id: string;
  influencer_id: string;
  rating: number;
  comment: string | null;
  is_public: boolean | null;
  is_verified: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

export interface Dispute {
  id: string;
  order_id: string;
  user_id: string;
  description: string;
  status: string;
  date_opened: string;
  resolution: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}
