import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useInfluencerRevenues = () => {
  const { data: balance, isLoading: isLoadingBalance } = useQuery({
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

  const { data: revenues, isLoading: isLoadingRevenues } = useQuery({
    queryKey: ['influencer-revenues'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('revenues')
        .select(`
          *,
          orders!inner (
            id,
            total_amount,
            created_at,
            status,
            merchant_id,
            profiles!orders_merchant_id_fkey (
              first_name,
              last_name
            )
          )
        `)
        .eq('influencer_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter revenues for completed orders only
      const validRevenues = (data || []).filter(revenue => {
        const order = revenue.orders as any;
        return order?.status === 'completed';
      });

      console.log(`📊 Total revenues: ${data?.length}, Valid (completed): ${validRevenues.length}`);

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
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });

  return {
    balance,
    revenues,
    withdrawalRequests,
    isLoading: isLoadingBalance || isLoadingRevenues || isLoadingWithdrawals,
  };
};