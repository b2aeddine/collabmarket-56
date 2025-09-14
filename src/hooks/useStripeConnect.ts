import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useStripeConnect = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Check account status
  const { data: accountStatus, refetch: refetchAccountStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['stripe-connect-status'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-stripe-account-status');
      if (error) throw error;
      return data;
    },
  });

  // Create onboarding session
  const createOnboardingSession = useMutation({
    mutationFn: async (country: string = 'FR') => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error('Vous devez être connecté pour configurer Stripe');
      const { data, error } = await supabase.functions.invoke('create-stripe-connect-onboarding', {
        body: { country, redirectOrigin: window.location.origin },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.onboardingUrl) {
        console.log('Redirecting to Stripe onboarding:', data.onboardingUrl);
        // Redirection immédiate vers Stripe (même page)
        window.location.href = data.onboardingUrl;
      } else {
        console.error('No onboarding URL received:', data);
        toast.error('Aucune URL de configuration reçue');
      }
    },
    onError: (error: any) => {
      console.error('Error creating onboarding session:', error);
      toast.error(`Erreur lors de la création de la session d'intégration: ${error?.message || 'Erreur inconnue'}`);
    },
  });

  // Update bank account details
  const updateBankAccount = useMutation({
    mutationFn: async (bankAccount: {
      iban: string;
      accountHolder: string;
      country?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('update-stripe-account-details', {
        body: { bankAccount }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Informations bancaires mises à jour avec succès !');
      refetchAccountStatus();
    },
    onError: (error: any) => {
      console.error('Error updating bank account:', error);
      toast.error('Erreur lors de la mise à jour des informations bancaires');
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

  const updateBankDetails = async (bankAccount: {
    iban: string;
    accountHolder: string;
    country?: string;
  }) => {
    await updateBankAccount.mutateAsync(bankAccount);
  };

  return {
    accountStatus,
    isLoadingStatus,
    isLoading: isLoading || createOnboardingSession.isPending || updateBankAccount.isPending,
    startOnboarding,
    updateBankDetails,
    refetchAccountStatus,
  };
};