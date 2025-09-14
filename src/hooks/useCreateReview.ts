import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateReviewData {
  orderId: string;
  influencerId: string;
  merchantId: string;
  rating: number;
  comment: string;
}

export const useCreateReview = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewData) => {
      // Vérifier si un avis existe déjà pour cette commande
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('order_id', data.orderId)
        .eq('merchant_id', data.merchantId)
        .single();

      if (existingReview) {
        throw new Error('Vous avez déjà laissé un avis pour cette commande.');
      }

      const { data: review, error } = await supabase
        .from('reviews')
        .insert({
          order_id: data.orderId,
          influencer_id: data.influencerId,
          merchant_id: data.merchantId,
          rating: data.rating,
          comment: data.comment.trim(),
          is_public: true,
          is_verified: true
        })
        .select()
        .single();

      if (error) throw error;
      return review;
    },
    onSuccess: () => {
      toast({
        title: "Avis publié avec succès !",
        description: "Merci pour votre retour sur cette collaboration.",
      });
      // Invalider les caches pour mettre à jour les avis
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      console.error('Error creating review:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de publier l'avis. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });
};

export const useCheckExistingReview = (orderId: string, merchantId: string) => {
  return async () => {
    if (!orderId || !merchantId) return false;
    
    const { data } = await supabase
      .from('reviews')
      .select('id')
      .eq('order_id', orderId)
      .eq('merchant_id', merchantId)
      .single();

    return !!data;
  };
};