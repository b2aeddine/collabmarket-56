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
      console.log('Opening Stripe Express Dashboard for bank update...');
      
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error('Non authentifié');

      const { data, error } = await supabase.functions.invoke('create-stripe-account-link', {
        body: { type: 'account_update' },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (error) {
        console.error('Error from edge function:', error);
        throw error;
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      return data;
    },
    onSuccess: (data) => {
      console.log('Redirecting to Stripe Express Dashboard:', data);
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error('Aucune URL de redirection reçue');
      }
    },
    onError: (error: any) => {
      console.error('Bank account link error:', error);
      
      const errorMessage = error.message || 'Erreur lors de la création du lien Stripe';
      
      toast.error('❌ Erreur', {
        description: errorMessage,
        duration: 6000
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