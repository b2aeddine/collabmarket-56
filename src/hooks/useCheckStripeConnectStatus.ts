import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export const useCheckStripeConnectStatus = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  
  return useMutation({
    mutationFn: async () => {
      console.log('🔍 Checking Stripe Connect status...');
      
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
        console.error('❌ Error checking Stripe Connect status:', error);
        throw error;
      }

      console.log('✅ Stripe status check result:', data);
      return data;
    },
    onSuccess: async (data) => {
      console.log('📊 Status data received:', data);
      
      // Invalider et rafraîchir le cache de stripe-connect-status
      await queryClient.invalidateQueries({ queryKey: ['stripe-connect-status'] });
      
      // Rafraîchir le profil utilisateur
      await refreshUser();
      
      if (data.stripe_status === 'complete') {
        toast.success('✅ Configuration terminée', {
          description: 'Votre compte Stripe Connect est maintenant activé.'
        });
      } else if (data.needsOnboarding) {
        toast.warning('⚠️ Configuration incomplète', {
          description: 'Veuillez finaliser la configuration de votre compte Stripe.'
        });
      } else {
        toast.info('Statut mis à jour', {
          description: 'Les informations de votre compte ont été actualisées.'
        });
      }
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      console.error('❌ Stripe Connect status check error:', error);
      toast.error('Erreur lors de la vérification du statut Stripe Connect', {
        description: errorMessage
      });
    },
  });
};
