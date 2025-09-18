import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCheckStripeConnectStatus = () => {
  return useMutation({
    mutationFn: async () => {
      console.log('Checking Stripe Connect status...');
      
      const { data, error } = await supabase.functions.invoke('check-stripe-account-status', {
        method: 'POST',
      });

      if (error) {
        console.error('Error checking Stripe Connect status:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('Stripe Connect status check result:', data);
      
      if (data.onboardingCompleted && data.chargesEnabled) {
        toast.success('🎉 Votre compte Stripe Connect est activé !', {
          description: 'Vous pouvez maintenant recevoir des paiements.'
        });
      } else if (data.needsOnboarding) {
        toast.warning('⚠️ Configuration incomplète', {
          description: 'Veuillez finaliser la configuration de votre compte Stripe.'
        });
      } else {
        toast.info(`Statut Stripe Connect: ${data.accountStatus || 'en cours'}`);
      }
    },
    onError: (error: any) => {
      console.error('Stripe Connect status check error:', error);
      toast.error('Erreur lors de la vérification du statut Stripe Connect', {
        description: error.message || 'Une erreur est survenue'
      });
    },
  });
};