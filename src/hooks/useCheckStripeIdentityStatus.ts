import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCheckStripeIdentityStatus = () => {
  return useMutation({
    mutationFn: async () => {
      console.log('Checking Stripe Identity status...');
      
      const { data, error } = await supabase.functions.invoke('check-stripe-identity-status', {
        method: 'POST',
      });

      if (error) {
        console.error('Error checking status:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('Status check result:', data);
      
      if (data.is_verified) {
        toast.success('🎉 Votre identité a été vérifiée avec succès !', {
          description: 'Vous pouvez maintenant apparaître dans le catalogue des influenceurs.'
        });
      } else if (data.status === 'processing') {
        toast.info('⏳ Vérification en cours...', {
          description: 'Votre vérification d\'identité est en cours de traitement.'
        });
      } else if (data.status === 'requires_input') {
        toast.warning('⚠️ Action requise', {
          description: 'Veuillez compléter votre vérification d\'identité.'
        });
      } else {
        toast.info(`Statut: ${data.status}`);
      }
    },
    onError: (error: any) => {
      console.error('Status check error:', error);
      toast.error('Erreur lors de la vérification du statut', {
        description: error.message || 'Une erreur est survenue'
      });
    },
  });
};