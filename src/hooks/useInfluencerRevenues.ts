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
      
      if (error) {
        console.error('Error getting balance:', error);
        throw error;
      }
      return Number(data) || 0;
    },
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
          orders (
            id,
            total_amount,
            created_at,
            merchant_id,
            profiles!orders_merchant_id_fkey (
              first_name,
              last_name,
              company_name
            )
          )
        `)
        .eq('influencer_id', user.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error getting revenues:', error);
        throw error;
      }
      return data || [];
    },
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
      
      if (error) {
        console.error('Error getting withdrawals:', error);
        throw error;
      }
      return data || [];
    },
  });
  
  // Auto-generate missing revenues if empty once
  const generationAttempted = useRef(false);
  useEffect(() => {
    const run = async () => {
      try {
        generationAttempted.current = true;
        await supabase.functions.invoke('generate-missing-revenues', { body: {} });
        await refetchBalance();
        await refetchRevenues();
      } catch (e) {
        console.error('Auto generation failed', e);
      }
    };
  
    if (!isLoadingBalance && !isLoadingRevenues && !generationAttempted.current) {
      const bal = Number(balance || 0);
      if (bal === 0 && (!revenues || revenues.length === 0)) {
        run();
      }
    }
  }, [isLoadingBalance, isLoadingRevenues, balance, revenues, refetchBalance, refetchRevenues]);
  
  return {
    balance,
    revenues,
    withdrawalRequests,
    isLoading: isLoadingBalance || isLoadingRevenues || isLoadingWithdrawals,
  };
};