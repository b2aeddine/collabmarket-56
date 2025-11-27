
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useOrders = (userRole?: string) => {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', userRole],
    queryFn: async () => {
      // Get current user for filtering
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // console.warn('⚠️ useOrders: No authenticated user');
        return [];
      }

      // console.log('📦 useOrders: Fetching orders', { userId: user.id, userRole });

      let query = supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          net_amount,
          commission_rate,
          delivery_date,
          created_at,
          updated_at,
          requirements,
          influencer_id,
          merchant_id,
          offer_id,
          offer:offers(
            title,
            description,
            delivery_time
          ),
          influencer:profiles!orders_influencer_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url,
            bio
          ),
          merchant:profiles!orders_merchant_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url,
            bio
          )
        `)
        .not('status', 'in', '("annulée","cancelled")')
        .order('created_at', { ascending: false });

      // Filter by user role to only get relevant orders
      if (userRole === 'influenceur') {
        // console.log('🎯 Filtering orders for influencer:', user.id);
        query = query.eq('influencer_id', user.id);
      } else if (userRole === 'commercant') {
        // console.log('🎯 Filtering orders for merchant:', user.id);
        query = query.eq('merchant_id', user.id);
      } else {
        // For admin or unspecified role, get all user's orders
        // console.log('🎯 Filtering orders for user (both roles):', user.id);
        query = query.or(`influencer_id.eq.${user.id},merchant_id.eq.${user.id}`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ useOrders error:', error);
        throw error;
      }

      // console.log('✅ useOrders result:', { count: data?.length, userRole, userId: user.id });
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    refetchOnWindowFocus: false,
  });

  return { orders, isLoading, error };
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: {
      influencer_id: string;
      offer_id: string;
      total_amount: number;
      net_amount: number;
      delivery_date?: string;
      requirements?: string;
    }) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .insert([{
          ...orderData,
          merchant_id: user.id,
          status: 'pending',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useAcceptOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase.rpc('safe_update_order_status', {
        p_order_id: orderId,
        p_new_status: 'accepted'
      });

      if (error) throw error;
      return { id: orderId, status: 'accepted' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useRefuseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase.rpc('safe_update_order_status', {
        p_order_id: orderId,
        p_new_status: 'cancelled'
      });

      if (error) throw error;
      return { id: orderId, status: 'cancelled' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};


export const useMarkOrderAsDelivered = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase.rpc('safe_update_order_status', {
        p_order_id: orderId,
        p_new_status: 'delivered'
      });

      if (error) throw error;
      return { id: orderId, status: 'delivered' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useConfirmOrderCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase.rpc('safe_update_order_status', {
        p_order_id: orderId,
        p_new_status: 'completed'
      });

      if (error) throw error;
      return { id: orderId, status: 'completed' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useContestOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, preuveInfluenceur }: { orderId: string; preuveInfluenceur: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // 1. Create dispute record
      const { error: disputeError } = await supabase
        .from('disputes')
        .insert([{
          order_id: orderId,
          user_id: user.id,
          description: preuveInfluenceur,
          status: 'pending',
          date_opened: new Date().toISOString()
        }]);

      if (disputeError) throw disputeError;

      // 2. Update order status via RPC
      const { error } = await supabase.rpc('safe_update_order_status', {
        p_order_id: orderId,
        p_new_status: 'disputed'
      });

      if (error) throw error;
      return { id: orderId, status: 'disputed' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
