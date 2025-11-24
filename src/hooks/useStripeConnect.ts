import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export const useStripeConnect = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUser } = useAuth();

  // Check account status
  const { data: accountStatus, refetch: refetchAccountStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['stripe-connect-status'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-stripe-account-status');
      if (error) throw error;
      return data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Create onboarding session
  const createOnboardingSession = useMutation({
    mutationFn: async (country: string = 'FR') => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error('Vous devez être connecté pour configurer Stripe');
      const { data, error } = await supabase.functions.invoke('create-stripe-connect-onboarding', {
        body: { country, redirectOrigin: window.location.origin, refreshPath: '/onboarding/refresh', returnPath: '/influencer-dashboard' },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.onboardingUrl) {
      window.location.href = data.onboardingUrl;
      } else {
        toast.error('Aucune URL de configuration reçue');
      }
    },
    onError: (error: any) => {
      const message = error?.message || error?.name || 'Erreur inconnue';
      const serverErr = error?.error || error?.context?.error || error?.context?.response || null;
      const step = error?.context?.step || error?.step;
      let details = message;
      if (serverErr) {
        try { details += ` | ${typeof serverErr === 'string' ? serverErr : JSON.stringify(serverErr)}`; } catch {}
      }
      if (step) details += ` | étape: ${step}`;
      toast.error(`Erreur lors de la création de la session d'intégration: ${details}`);
    },
  });

  // Open Stripe Express Dashboard for bank account update
  const updateBankAccount = useMutation({
    mutationFn: async () => {
      console.log('🔗 Opening Stripe Express Dashboard for bank update...');
      
      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        
        if (!token) {
          throw new Error('Vous devez être connecté pour accéder à Stripe');
        }

        console.log('📡 Calling edge function...');
        
        const { data, error } = await supabase.functions.invoke('create-stripe-account-link', {
          body: { type: 'account_update' },
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('📩 Edge function response:', { data, error });

        if (error) {
          console.error('❌ Edge function error:', error);
          throw new Error(error.message || 'Erreur lors de la connexion à Stripe');
        }
        
        if (data?.error) {
          console.error('❌ Error in response data:', data);
          throw new Error(data.error);
        }

        if (!data?.url) {
          console.error('❌ No URL in response:', data);
          throw new Error('Aucune URL de redirection reçue de Stripe');
        }

        console.log('✅ Stripe link created successfully');
        return data;
        
      } catch (err: any) {
        console.error('❌ Exception in updateBankAccount:', err);
        throw err;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Redirecting to Stripe Express Dashboard:', data);
      if (data?.url) {
        toast.success('Redirection vers Stripe...', {
          description: 'Vous allez être redirigé vers le tableau de bord Stripe',
          duration: 2000
        });
        setTimeout(() => {
          window.location.href = data.url;
        }, 500);
      } else {
        console.error('❌ No URL in success data');
        toast.error('Aucune URL de redirection reçue');
      }
    },
    onError: (error: any) => {
      console.error('❌ Bank account link error:', error);
      
      let errorMessage = error.message || 'Erreur lors de la création du lien Stripe';
      let errorTitle = 'Erreur de configuration';
      
      // Gérer les erreurs spécifiques
      if (error.message?.includes('MISSING_STRIPE_KEY')) {
        errorMessage = 'Configuration Stripe manquante. Contactez le support technique.';
        errorTitle = 'Erreur de configuration serveur';
      } else if (error.message?.includes('NO_STRIPE_ACCOUNT')) {
        errorMessage = 'Aucun compte Stripe Connect trouvé. Veuillez d\'abord configurer votre compte.';
        errorTitle = 'Compte Stripe manquant';
      } else if (error.message?.includes('non-2xx') || error.message?.includes('FunctionsHttpError')) {
        errorMessage = 'Impossible de se connecter à Stripe. Vérifiez votre connexion et réessayez.';
        errorTitle = 'Erreur de connexion';
      } else if (error.message?.includes('account_onboarding')) {
        errorMessage = 'Configuration supplémentaire requise sur Stripe.';
        errorTitle = 'Configuration incomplète';
      } else if (error.message?.includes('Non authentifié')) {
        errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
        errorTitle = 'Session expirée';
      }
      
      toast.error(errorTitle, {
        description: errorMessage,
        duration: 8000
      });
    },
  });

  const startOnboarding = async (country: string = 'FR') => {
    setIsLoading(true);
    try {
      await createOnboardingSession.mutateAsync(country);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBankDetails = async () => {
    await updateBankAccount.mutateAsync();
  };

  const handleRefreshConnectStatus = async () => {
    try {
      toast.info('Actualisation du statut Stripe Connect...');
      const result = await refetchAccountStatus();
      const data = result.data as any;
      
      // Forcer le rafraîchissement du profil utilisateur après la mise à jour du statut
      setTimeout(async () => {
        await refreshUser();
      }, 1000);
      
      if (data?.onboardingCompleted && data?.chargesEnabled) {
        toast.success('Compte Stripe configuré et activé ✅');
      } else if (data?.needsOnboarding || !data?.onboardingCompleted) {
        toast.warning('Configuration incomplète — poursuivez l\'onboarding Stripe');
      } else {
        toast.success('Statut mis à jour');
      }
    } catch (error: any) {
      console.error('Refresh status error:', error);
      toast.error(error.message || 'Erreur lors de l\'actualisation du statut');
    }
  };

  return {
    accountStatus,
    isLoadingStatus,
    isLoading: isLoading || createOnboardingSession.isPending || updateBankAccount.isPending,
    startOnboarding,
    updateBankDetails,
    refetchAccountStatus: handleRefreshConnectStatus,
  };
};