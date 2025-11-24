import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useInfluencerRevenues = () => {
  const { data: balance, isLoading: isLoadingBalance, refetch: refetchBalance } = useQuery({
    queryKey: ['influencer-balance'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return 0;

      const { data, error } = await supabase.rpc('get_influencer_available_balance', {
        user_id: user.user.id
      });
      
      if (error) throw error;
      return Number(data) || 0;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });

  const { data: revenues, isLoading: isLoadingRevenues, refetch: refetchRevenues } = useQuery({
    queryKey: ['influencer-revenues'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('influencer_revenues')
        .select(`
          *,
          orders!inner (
            id,
            total_amount,
            created_at,
            merchant_id,
            payment_captured,
            stripe_payment_intent_id,
            profiles!orders_merchant_id_fkey (
              first_name,
              last_name,
              company_name
            )
          )
        `)
        .eq('influencer_id', user.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Filter out revenues for orders without captured payments
      const validRevenues = (data || []).filter(revenue => {
        const order = revenue.orders as any;
        return order?.payment_captured === true && order?.stripe_payment_intent_id;
      });
      
      console.log(`📊 Total revenues: ${data?.length}, Valid (captured): ${validRevenues.length}`);
      
      return validRevenues;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });

  const { data: withdrawalRequests, isLoading: isLoadingWithdrawals } = useQuery({
    queryKey: ['withdrawal-requests'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          bank_accounts (
            iban,
            account_holder,
            bank_name
          )
        `)
        .eq('influencer_id', user.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
  
  // REMOVED: Auto-generation of fake revenues
  // Revenues should only be created when payments are actually captured via Stripe
  
  return {
    balance,
    revenues,
    withdrawalRequests,
    isLoading: isLoadingBalance || isLoadingRevenues || isLoadingWithdrawals,
  };
};