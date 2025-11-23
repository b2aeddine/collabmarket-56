
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useOrders = (userRole?: string) => {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', userRole],
    queryFn: async () => {
      // Get current user for filtering
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('⚠️ useOrders: No authenticated user');
        return [];
      }

      console.log('📦 useOrders: Fetching orders', { userId: user.id, userRole });

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
          date_accepted,
          date_completed,
          special_instructions,
          requirements,
          influencer_id,
          merchant_id,
          offer_id,
          payment_captured,
          stripe_payment_intent_id,
          stripe_session_id,
          offers!left(
            id,
            title,
            description,
            price,
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
            company_name
          )
        `)
      .order('created_at', { ascending: false });

      // Filter by user role to only get relevant orders
      if (userRole === 'influenceur') {
        console.log('🎯 Filtering orders for influencer:', user.id);
        query = query.eq('influencer_id', user.id);
      } else if (userRole === 'commercant') {
        console.log('🎯 Filtering orders for merchant:', user.id);
        query = query.eq('merchant_id', user.id);
      } else {
        // For admin or unspecified role, get all user's orders
        console.log('🎯 Filtering orders for user (both roles):', user.id);
        query = query.or(`influencer_id.eq.${user.id},merchant_id.eq.${user.id}`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ useOrders error:', error);
        throw error;
      }
      
      console.log('✅ useOrders result:', { count: data?.length, userRole, userId: user.id });
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
      special_instructions?: string;
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
          status: 'en_attente_confirmation_influenceur',
          date_creation_commande: new Date().toISOString(),
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

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      orderId, 
      updates 
    }: { 
      orderId: string; 
      updates: Partial<{
        status: string;
        delivery_date: string;
        date_accepted: string;
        date_completed: string;
        date_disputed: string;
        dispute_reason: string;
      }>
    }) => {
      // SECURITY: Verify that the authenticated user can only update their own orders
      // This prevents unauthorized order modifications (IDOR - Insecure Direct Object Reference)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // First, verify the order belongs to the user
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('influencer_id, merchant_id')
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;
      if (!order) {
        throw new Error('Order not found');
      }

      // Check if user is the influencer or merchant of this order
      if (order.influencer_id !== user.id && order.merchant_id !== user.id) {
        throw new Error('Unauthorized: You can only update your own orders');
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
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

export const useAcceptOrderAndPay = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderId: string) => {
      // D'abord, accepter la commande
      const { data: order, error: acceptError } = await supabase
        .from('orders')
        .update({ 
          status: 'accepted',
          date_accepted: new Date().toISOString()
        })
        .eq('id', orderId)
        .select(`
          *,
          offers(title),
          influencer:profiles!orders_influencer_id_fkey(first_name, last_name)
        `)
        .single();
      
      if (acceptError) throw acceptError;

      // Ensuite, créer la session de paiement Stripe
      const { data: stripeData, error: stripeError } = await supabase.functions.invoke('create-stripe-session', {
        body: {
          orderId: order.id,
          amount: order.total_amount,
          description: `${order.offers?.title || 'Prestation'} - ${order.influencer?.first_name || ''} ${order.influencer?.last_name || ''}`,
          successUrl: `${window.location.origin}/payment-success?order_id=${order.id}`,
          cancelUrl: `${window.location.origin}/payment-cancel?order_id=${order.id}`,
        }
      });

      if (stripeError) throw stripeError;
      
      // Rediriger vers Stripe
      if (stripeData.url) {
        window.location.href = stripeData.url;
      }

      return order;
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
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'en_cours',
          date_accepted: new Date().toISOString()
        })
        .eq('id', orderId)
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

export const useRefuseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: 'refusée_par_influenceur' })
        .eq('id', orderId)
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

export const useMarkOrderAsDelivered = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', orderId)
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

export const useConfirmOrderCompletion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase.functions.invoke('complete-order-payment', {
        body: { orderId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['influencer-revenues'] });
      queryClient.invalidateQueries({ queryKey: ['influencer-balance'] });
    },
    onError: (error) => {
      console.error('Error completing order payment:', error);
    }
  });
};

// Hook pour contester une commande
export const useContestOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, preuveInfluenceur }: { orderId: string; preuveInfluenceur: string }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'en_contestation',
          date_contestation: new Date().toISOString(),
          preuve_influenceur: preuveInfluenceur
        })
        .eq('id', orderId)
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
