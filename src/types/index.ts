
export interface SocialNetwork {
  id: string;
  platform: string; // Changed from union type to string to match database
  username: string;
  profile_url: string;
  followers: number;
  engagement_rate: number;
  is_connected?: boolean;
  is_active?: boolean;
  access_token?: string;
  last_updated?: string;
  user_id: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  role: 'influenceur' | 'commercant';
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  city?: string;
  phone?: string;
  date_of_birth?: string;
  is_verified?: boolean;
  profile_views?: number;
  custom_username?: string;
  is_profile_public?: boolean;
  profile_share_count?: number;
  company_name?: string;
  created_at: string;
  updated_at: string;
  // Add aliases for compatibility with EditProfileModal
  firstName?: string;
  lastName?: string;
  gender?: string;
}

export interface Offer {
  id: string;
  influencer_id: string;
  platform?: SocialNetwork['platform'];
  title: string;
  description: string;
  price: number;
  delivery_time: string;
  is_active: boolean;
  is_popular?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  merchant_id: string;
  influencer_id: string;
  offer_id: string;
  status: 'pending' | 'accepted' | 'refused' | 'delivered' | 'completed' | 'disputed' | 'cancelled';
  total_amount: number;
  net_amount?: number;
  delivery_date?: string;
  special_instructions?: string;
  requirements?: string;
  created_at: string;
  updated_at: string;
  date_accepted?: string;
  date_completed?: string;
  date_disputed?: string;
  dispute_reason?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  merchant_id: string;
  influencer_id: string;
  last_message_at: string;
  created_at: string;
}

export interface Revenue {
  id: string;
  influencer_id: string;
  order_id: string;
  amount: number;
  commission_rate: number;
  net_amount: number;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  influencer_id: string;
  bank_account_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requested_at: string;
  processed_at?: string;
  notes?: string;
}

export interface BankAccount {
  id: string;
  user_id: string;
  iban: string;
  bic: string;
  account_holder: string;
  bank_name: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'new_order' | 'message' | 'payment' | 'verification' | 'order_status_update' | 'revenue_earned' | 'order_accepted' | 'order_refused' | 'order_delivered' | 'order_disputed';
  title: string;
  content: string;
  is_read: boolean;
  related_id?: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  merchant_id: string;
  influencer_id: string;
  created_at: string;
}

export interface Review {
  id: string;
  order_id: string;
  merchant_id: string;
  influencer_id: string;
  rating: number;
  comment?: string;
  is_public: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface ProfileView {
  id: string;
  profile_id: string;
  viewer_id?: string;
  viewer_ip?: string;
  user_agent?: string;
  referrer?: string;
  viewed_at: string;
}

export interface Dispute {
  id: string;
  order_id: string;
  user_id: string;
  description: string;
  status: 'pending' | 'resolved' | 'rejected';
  date_opened: string;
  resolution?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}
