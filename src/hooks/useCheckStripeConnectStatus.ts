import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCheckStripeConnectStatus = () => {
  return useMutation({
    mutationFn: async () => {
      console.log('Checking Stripe Connect status...');
      
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('check-stripe-account-status', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (error) {
        console.error('Error checking Stripe Connect status:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('Stripe Connect status check result:', data);
      
      // Forcer le rechargement de la page pour actualiser le profil
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      if (data.stripe_status === 'complete') {
        toast.success('✅ Configuration terminée', {
          description: 'Votre compte Stripe Connect est maintenant activé.'
        });
      } else {
        toast.warning('⚠️ Configuration incomplète', {
          description: 'Veuillez finaliser la configuration de votre compte Stripe.'
        });
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