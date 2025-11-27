import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Offer } from '@/types';

export const useOffers = (influencerId?: string) => {
  const { data: offers, isLoading, error, refetch } = useQuery({
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
          category_id,
          categories(
            id,
            name,
            slug
          ),
          profiles!offers_influencer_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(influencerId ? 50 : 20);

      if (influencerId) {
        // For specific influencer, get all their offers (including inactive)
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
            category_id,
            categories(
              id,
              name,
              slug
            ),
            profiles!offers_influencer_id_fkey(
              id,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('influencer_id', influencerId)
          .order('created_at', { ascending: false })
          .limit(50);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 0, // No cache - always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
  });

  return { offers, isLoading, error, refetch };
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['offers'] });
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
};

export const useDeleteOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerId: string) => {
      console.log('[useDeleteOffer] Attempting to delete offer:', offerId);

      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', offerId);

      if (error) {
        console.error('[useDeleteOffer] Delete error:', error);
        throw new Error(error.message || 'Impossible de supprimer l\'offre');
      }

      console.log('[useDeleteOffer] Offer deleted successfully');
    },
    onSuccess: async () => {
      console.log('[useDeleteOffer] Invalidating queries');
      await queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
    onError: (error) => {
      console.error('[useDeleteOffer] Mutation error:', error);
    }
  });
};
