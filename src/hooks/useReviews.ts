
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export const useReviews = (influencerId: string) => {
  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ['reviews', influencerId],
    queryFn: async () => {
      if (!influencerId) {
        throw new Error('Influencer ID is required');
      }
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          rating,
          is_public
        `)
        .eq('influencer_id', influencerId)
        .eq('is_public', true);
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
    enabled: !!influencerId,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
  });

  // Memoize stats calculation to avoid recalculation
  const reviewStats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = Number((sum / total).toFixed(1));

    return {
      totalReviews: total,
      averageRating: average,
      ratingDistribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      }
    };
  }, [reviews]);

  return { reviews, reviewStats, isLoading, error };
};
