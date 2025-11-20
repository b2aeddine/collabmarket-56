export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          role: string
          user_id: string | null
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          user_id?: string | null
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_holder: string
          bank_name: string
          bic: string
          created_at: string | null
          iban: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_holder: string
          bank_name: string
          bic: string
          created_at?: string | null
          iban: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_holder?: string
          bank_name?: string
          bic?: string
          created_at?: string | null
          iban?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          responded_at: string | null
          responded_by: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          responded_at?: string | null
          responded_by?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          responded_at?: string | null
          responded_by?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contestations: {
        Row: {
          admin_decision: string | null
          admin_decision_by: string | null
          admin_decision_date: string | null
          created_at: string
          date_contestation: string
          id: string
          influencer_id: string
          merchant_id: string
          order_id: string
          preuve_influenceur: string | null
          raison_contestation: string
          statut: string
          updated_at: string
        }
        Insert: {
          admin_decision?: string | null
          admin_decision_by?: string | null
          admin_decision_date?: string | null
          created_at?: string
          date_contestation?: string
          id?: string
          influencer_id: string
          merchant_id: string
          order_id: string
          preuve_influenceur?: string | null
          raison_contestation: string
          statut?: string
          updated_at?: string
        }
        Update: {
          admin_decision?: string | null
          admin_decision_by?: string | null
          admin_decision_date?: string | null
          created_at?: string
          date_contestation?: string
          id?: string
          influencer_id?: string
          merchant_id?: string
          order_id?: string
          preuve_influenceur?: string | null
          raison_contestation?: string
          statut?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contestations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          influencer_id: string
          last_message_at: string | null
          merchant_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          influencer_id: string
          last_message_at?: string | null
          merchant_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          influencer_id?: string
          last_message_at?: string | null
          merchant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string | null
          date_opened: string
          description: string
          id: string
          order_id: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_opened?: string
          description: string
          id?: string
          order_id: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_opened?: string
          description?: string
          id?: string
          order_id?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          influencer_id: string
          merchant_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          influencer_id: string
          merchant_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          influencer_id?: string
          merchant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_documents: {
        Row: {
          created_at: string | null
          document_back_url: string | null
          document_front_url: string
          document_type: string
          id: string
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
          uploaded_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_back_url?: string | null
          document_front_url: string
          document_type: string
          id?: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_back_url?: string | null
          document_front_url?: string
          document_type?: string
          id?: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "identity_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_revenues: {
        Row: {
          amount: number
          commission: number
          created_at: string | null
          id: string
          influencer_id: string
          net_amount: number
          order_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          commission?: number
          created_at?: string | null
          id?: string
          influencer_id: string
          net_amount: number
          order_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          commission?: number
          created_at?: string | null
          id?: string
          influencer_id?: string
          net_amount?: number
          order_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "influencer_revenues_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          created_at: string | null
          delivery_time: string | null
          description: string | null
          id: string
          influencer_id: string
          is_active: boolean | null
          is_popular: boolean | null
          price: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_time?: string | null
          description?: string | null
          id?: string
          influencer_id: string
          is_active?: boolean | null
          is_popular?: boolean | null
          price: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_time?: string | null
          description?: string | null
          id?: string
          influencer_id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          price?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_decision: string | null
          admin_decision_by: string | null
          admin_decision_date: string | null
          commission_rate: number | null
          created_at: string | null
          date_accepted: string | null
          date_completed: string | null
          date_contestation: string | null
          date_creation_commande: string | null
          date_disputed: string | null
          delivery_date: string | null
          dispute_reason: string | null
          id: string
          influencer_id: string
          merchant_id: string
          net_amount: number
          offer_id: string
          payment_captured: boolean | null
          payment_captured_at: string | null
          preuve_influenceur: string | null
          requirements: string | null
          special_instructions: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          total_amount: number
          transfer_completed: boolean | null
          transfer_completed_at: string | null
          updated_at: string | null
          webhook_received_at: string | null
        }
        Insert: {
          admin_decision?: string | null
          admin_decision_by?: string | null
          admin_decision_date?: string | null
          commission_rate?: number | null
          created_at?: string | null
          date_accepted?: string | null
          date_completed?: string | null
          date_contestation?: string | null
          date_creation_commande?: string | null
          date_disputed?: string | null
          delivery_date?: string | null
          dispute_reason?: string | null
          id?: string
          influencer_id: string
          merchant_id: string
          net_amount: number
          offer_id: string
          payment_captured?: boolean | null
          payment_captured_at?: string | null
          preuve_influenceur?: string | null
          requirements?: string | null
          special_instructions?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount: number
          transfer_completed?: boolean | null
          transfer_completed_at?: string | null
          updated_at?: string | null
          webhook_received_at?: string | null
        }
        Update: {
          admin_decision?: string | null
          admin_decision_by?: string | null
          admin_decision_date?: string | null
          commission_rate?: number | null
          created_at?: string | null
          date_accepted?: string | null
          date_completed?: string | null
          date_contestation?: string | null
          date_creation_commande?: string | null
          date_disputed?: string | null
          delivery_date?: string | null
          dispute_reason?: string | null
          id?: string
          influencer_id?: string
          merchant_id?: string
          net_amount?: number
          offer_id?: string
          payment_captured?: boolean | null
          payment_captured_at?: string | null
          preuve_influenceur?: string | null
          requirements?: string | null
          special_instructions?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount?: number
          transfer_completed?: boolean | null
          transfer_completed_at?: string | null
          updated_at?: string | null
          webhook_received_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_logs: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          order_id: string | null
          processed: boolean | null
          stripe_session_id: string
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          order_id?: string | null
          processed?: boolean | null
          stripe_session_id: string
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          order_id?: string | null
          processed?: boolean | null
          stripe_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_categories: {
        Row: {
          category_id: string
          created_at: string | null
          id: string
          profile_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          profile_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_categories_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin_notes: string | null
          avatar_url: string | null
          banned_at: string | null
          banned_reason: string | null
          bio: string | null
          city: string | null
          company_name: string | null
          created_at: string | null
          custom_username: string | null
          date_of_birth: string | null
          email: string
          first_name: string | null
          id: string
          identity_status: string | null
          is_admin: boolean | null
          is_banned: boolean | null
          is_profile_public: boolean | null
          is_stripe_connect_active: boolean | null
          is_verified: boolean | null
          last_name: string | null
          phone: string | null
          profile_share_count: number | null
          profile_views: number | null
          role: string
          stripe_connect_account_id: string | null
          stripe_connect_status: string | null
          stripe_identity_session_id: string | null
          stripe_identity_status: string | null
          stripe_identity_url: string | null
          updated_at: string | null
          verified_by_admin: boolean | null
        }
        Insert: {
          admin_notes?: string | null
          avatar_url?: string | null
          banned_at?: string | null
          banned_reason?: string | null
          bio?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          custom_username?: string | null
          date_of_birth?: string | null
          email: string
          first_name?: string | null
          id: string
          identity_status?: string | null
          is_admin?: boolean | null
          is_banned?: boolean | null
          is_profile_public?: boolean | null
          is_stripe_connect_active?: boolean | null
          is_verified?: boolean | null
          last_name?: string | null
          phone?: string | null
          profile_share_count?: number | null
          profile_views?: number | null
          role: string
          stripe_connect_account_id?: string | null
          stripe_connect_status?: string | null
          stripe_identity_session_id?: string | null
          stripe_identity_status?: string | null
          stripe_identity_url?: string | null
          updated_at?: string | null
          verified_by_admin?: boolean | null
        }
        Update: {
          admin_notes?: string | null
          avatar_url?: string | null
          banned_at?: string | null
          banned_reason?: string | null
          bio?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          custom_username?: string | null
          date_of_birth?: string | null
          email?: string
          first_name?: string | null
          id?: string
          identity_status?: string | null
          is_admin?: boolean | null
          is_banned?: boolean | null
          is_profile_public?: boolean | null
          is_stripe_connect_active?: boolean | null
          is_verified?: boolean | null
          last_name?: string | null
          phone?: string | null
          profile_share_count?: number | null
          profile_views?: number | null
          role?: string
          stripe_connect_account_id?: string | null
          stripe_connect_status?: string | null
          stripe_identity_session_id?: string | null
          stripe_identity_status?: string | null
          stripe_identity_url?: string | null
          updated_at?: string | null
          verified_by_admin?: boolean | null
        }
        Relationships: []
      }
      revenues: {
        Row: {
          amount: number
          commission: number
          created_at: string | null
          id: string
          influencer_id: string
          net_amount: number
          order_id: string
          status: string
        }
        Insert: {
          amount: number
          commission: number
          created_at?: string | null
          id?: string
          influencer_id: string
          net_amount: number
          order_id: string
          status?: string
        }
        Update: {
          amount?: number
          commission?: number
          created_at?: string | null
          id?: string
          influencer_id?: string
          net_amount?: number
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenues_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenues_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          influencer_id: string
          is_public: boolean | null
          is_verified: boolean | null
          merchant_id: string
          order_id: string
          rating: number
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          influencer_id: string
          is_public?: boolean | null
          is_verified?: boolean | null
          merchant_id: string
          order_id: string
          rating: number
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          influencer_id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          merchant_id?: string
          order_id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          access_token: string | null
          created_at: string | null
          engagement_rate: number | null
          expires_at: string | null
          followers: number | null
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          platform: string
          refresh_token: string | null
          total_views: number | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          engagement_rate?: number | null
          expires_at?: string | null
          followers?: number | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          platform: string
          refresh_token?: string | null
          total_views?: number | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          engagement_rate?: number | null
          expires_at?: string | null
          followers?: number | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          platform?: string
          refresh_token?: string | null
          total_views?: number | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string | null
          engagement_rate: number | null
          followers: number | null
          id: string
          is_active: boolean | null
          is_connected: boolean | null
          platform: string
          profile_url: string
          social_account_id: string | null
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string | null
          engagement_rate?: number | null
          followers?: number | null
          id?: string
          is_active?: boolean | null
          is_connected?: boolean | null
          platform: string
          profile_url: string
          social_account_id?: string | null
          user_id: string
          username: string
        }
        Update: {
          created_at?: string | null
          engagement_rate?: number | null
          followers?: number | null
          id?: string
          is_active?: boolean | null
          is_connected?: boolean | null
          platform?: string
          profile_url?: string
          social_account_id?: string | null
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_links_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_accounts: {
        Row: {
          account_status: string | null
          capabilities_card_payments: boolean | null
          capabilities_transfers: boolean | null
          charges_enabled: boolean | null
          country: string | null
          created_at: string | null
          currency: string | null
          details_submitted: boolean | null
          external_account_bank_name: string | null
          external_account_last4: string | null
          id: string
          onboarding_completed: boolean | null
          payouts_enabled: boolean | null
          stripe_account_id: string
          tos_acceptance_date: string | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
        }
        Insert: {
          account_status?: string | null
          capabilities_card_payments?: boolean | null
          capabilities_transfers?: boolean | null
          charges_enabled?: boolean | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          details_submitted?: boolean | null
          external_account_bank_name?: string | null
          external_account_last4?: string | null
          id?: string
          onboarding_completed?: boolean | null
          payouts_enabled?: boolean | null
          stripe_account_id: string
          tos_acceptance_date?: string | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
        }
        Update: {
          account_status?: string | null
          capabilities_card_payments?: boolean | null
          capabilities_transfers?: boolean | null
          charges_enabled?: boolean | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          details_submitted?: boolean | null
          external_account_bank_name?: string | null
          external_account_last4?: string | null
          id?: string
          onboarding_completed?: boolean | null
          payouts_enabled?: boolean | null
          stripe_account_id?: string
          tos_acceptance_date?: string | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      stripe_transfers: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          failure_reason: string | null
          id: string
          influencer_amount: number
          influencer_id: string | null
          merchant_id: string | null
          order_id: string | null
          platform_fee: number
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
          transferred_at: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          influencer_amount: number
          influencer_id?: string | null
          merchant_id?: string | null
          order_id?: string | null
          platform_fee: number
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          transferred_at?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          influencer_amount?: number
          influencer_id?: string | null
          merchant_id?: string | null
          order_id?: string | null
          platform_fee?: number
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          transferred_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_transfers_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_transfers_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_transfers_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          bank_account_id: string
          created_at: string | null
          id: string
          influencer_id: string
          processed_at: string | null
          processed_by: string | null
          requested_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          bank_account_id: string
          created_at?: string | null
          id?: string
          influencer_id: string
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          bank_account_id?: string
          created_at?: string | null
          id?: string
          influencer_id?: string
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          amount: number
          bank_account_id: string | null
          created_at: string | null
          failure_reason: string | null
          id: string
          influencer_id: string
          payment_details: Json | null
          payment_method: string | null
          processed_at: string | null
          status: string
          stripe_payout_id: string | null
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          influencer_id: string
          payment_details?: Json | null
          payment_method?: string | null
          processed_at?: string | null
          status?: string
          stripe_payout_id?: string | null
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          influencer_id?: string
          payment_details?: Json | null
          payment_method?: string | null
          processed_at?: string | null
          status?: string
          stripe_payout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawals_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_cancel_expired_orders: { Args: never; Returns: undefined }
      auto_cancel_payment_authorized_orders: { Args: never; Returns: undefined }
      auto_cancel_pending_orders: { Args: never; Returns: undefined }
      auto_confirm_completed_orders: { Args: never; Returns: undefined }
      auto_handle_expired_orders: { Args: never; Returns: undefined }
      can_contest_order: { Args: { order_id: string }; Returns: boolean }
      create_admin_account: { Args: never; Returns: undefined }
      create_initial_admin: { Args: never; Returns: undefined }
      enable_contestation_for_delivered_orders: {
        Args: never
        Returns: undefined
      }
      get_available_balance: { Args: { user_id: string }; Returns: number }
      get_current_user_role: { Args: never; Returns: string }
      get_influencer_available_balance: {
        Args: { user_id: string }
        Returns: number
      }
      get_influencer_total_earned: {
        Args: { user_id: string }
        Returns: number
      }
      get_influencer_total_withdrawn: {
        Args: { user_id: string }
        Returns: number
      }
      get_public_influencers: {
        Args: { limit_count?: number }
        Returns: {
          avatar_url: string
          bio: string
          city: string
          created_at: string
          custom_username: string
          first_name: string
          id: string
          is_verified: boolean
          last_name: string
          profile_share_count: number
          profile_views: number
          role: string
        }[]
      }
      get_public_profile_data: {
        Args: { profile_id: string }
        Returns: {
          avatar_url: string
          bio: string
          city: string
          created_at: string
          custom_username: string
          first_name: string
          id: string
          is_verified: boolean
          last_name: string
          profile_share_count: number
          profile_views: number
          role: string
        }[]
      }
      get_user_role: { Args: { user_id?: string }; Returns: string }
      is_admin: { Args: { user_id?: string }; Returns: boolean }
      is_current_user_admin: { Args: never; Returns: boolean }
      sync_social_analytics: {
        Args: { account_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "influenceur" | "commercant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "influenceur", "commercant"],
    },
  },
} as const
