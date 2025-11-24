import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Offer } from '@/types';

export const useOffers = (influencerId?: string) => {
  const { data: offers, isLoading, error } = useQuery({
    queryKey: ['offers', influencerId],
    queryFn: async () => {
      let query = supabase
        .from('offers')
        .select(`
          id,
          title,
          description,
          price,
          delivery_time,
          is_active,
          is_popular,
          created_at,
          updated_at,
          influencer_id,
          profiles!offers_influencer_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('is_active', true)
        .or('is_deleted.is.null,is_deleted.eq.false') // Exclude soft-deleted offers
        .order('created_at', { ascending: false })
        .limit(influencerId ? 50 : 20);

      if (influencerId) {
        // For specific influencer, get all their non-deleted offers (including inactive)
        query = supabase
          .from('offers')
          .select(`
            id,
            title,
            description,
            price,
            delivery_time,
            is_active,
            is_popular,
            created_at,
            updated_at,
            influencer_id,
            profiles!offers_influencer_id_fkey(
              id,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('influencer_id', influencerId)
          .or('is_deleted.is.null,is_deleted.eq.false') // Exclude soft-deleted offers
          .order('created_at', { ascending: false })
          .limit(50);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  return { offers, isLoading, error };
};

export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (offerData: Omit<Offer, 'id' | 'active'>) => {
      const { data, error } = await supabase
        .from('offers')
        .insert([offerData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
};

export const useUpdateOffer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ offerId, data }: { offerId: string; data: Partial<Offer> }) => {
      const { error } = await supabase
        .from('offers')
        .update(data)
        .eq('id', offerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
};

export const useDeleteOffer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (offerId: string) => {
      // Soft delete: mark as deleted instead of actually deleting
      const { error } = await supabase
        .from('offers')
        .update({ is_deleted: true })
        .eq('id', offerId);
      
      if (error) {
        console.error('Delete offer error:', error);
        throw new Error('Impossible de supprimer l\'offre. Veuillez réessayer.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
};
