
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useReviews = (influencerId: string) => {
  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ['reviews', influencerId],
    queryFn: async () => {
      console.log('Fetching reviews for influencer:', influencerId);

      if (!influencerId) {
        throw new Error('Influencer ID is required');
      }

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          merchant:profiles!reviews_merchant_id_fkey(
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('influencer_id', influencerId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }

      console.log('Fetched reviews:', data);
      return data || [];
    },
    enabled: !!influencerId,
  });

  // Calculer les statistiques des avis réelles
  const reviewStats = reviews ? {
    totalReviews: reviews.length,
    averageRating: reviews.length > 0
      ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
      : 0,
    ratingDistribution: {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    }
  } : null;

  return { reviews, reviewStats, isLoading, error };
};
