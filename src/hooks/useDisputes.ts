
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dispute } from '@/types';

export const useDisputes = () => {
  const { data: disputes, isLoading, error } = useQuery({
    queryKey: ['disputes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disputes')
        .select(`
          *,
          order:orders(
            id,
            status,
            total_amount,
            offers(title),
            merchant:profiles!orders_merchant_id_fkey(first_name, last_name),
            influencer:profiles!orders_influencer_id_fkey(first_name, last_name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (Dispute & { order: any })[];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  return { disputes, isLoading, error };
};

export const useCreateDispute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (disputeData: {
      order_id: string;
      description: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('disputes')
        .insert([{
          order_id: disputeData.order_id,
          user_id: user.id,
          description: disputeData.description,
          status: 'pending'
        }])
        .select()
        .single();
      
      if (error) throw error;

      // Mettre à jour le statut de la commande
      await supabase
        .from('orders')
        .update({ 
          status: 'disputed',
          date_disputed: new Date().toISOString()
        })
        .eq('id', disputeData.order_id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useResolveDispute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      disputeId, 
      resolution, 
      orderStatus 
    }: { 
      disputeId: string; 
      resolution: string;
      orderStatus: 'completed' | 'cancelled';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Résoudre le litige
      const { error: disputeError } = await supabase
        .from('disputes')
        .update({ 
          status: 'resolved',
          resolution,
          resolved_by: user.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', disputeId);
      
      if (disputeError) throw disputeError;

      // Mettre à jour le statut de la commande
      const { data: dispute } = await supabase
        .from('disputes')
        .select('order_id')
        .eq('id', disputeId)
        .single();

      if (dispute) {
        const updateData: any = { status: orderStatus };
        if (orderStatus === 'completed') {
          updateData.date_completed = new Date().toISOString();
        }

        await supabase
          .from('orders')
          .update(updateData)
          .eq('id', dispute.order_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
