
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFavorites = () => {
  const { data: favorites, isLoading, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          influencer:profiles!favorites_influencer_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url,
            bio,
            social_links(*)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: false,
  });

  return { favorites, isLoading, error };
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ influencerId, isFavorite }: { influencerId: string; isFavorite: boolean }) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('influencer_id', influencerId)
          .eq('merchant_id', user.id);
        
        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([{ 
            influencer_id: influencerId,
            merchant_id: user.id
          }]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};

export const useIsFavorite = (influencerId: string) => {
  const { data: isFavorite, isLoading } = useQuery({
    queryKey: ['is-favorite', influencerId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('influencer_id', influencerId)
        .eq('merchant_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    },
    enabled: !!influencerId,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  return { isFavorite: isFavorite || false, isLoading };
};
