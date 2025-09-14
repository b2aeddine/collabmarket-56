
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreatePaymentSessionParams {
  orderId: string;
  amount: number;
  description?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export const useStripePayment = () => {
  return useMutation({
    mutationFn: async (params: CreatePaymentSessionParams) => {
      const { data, error } = await supabase.functions.invoke('create-stripe-session', {
        body: params
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      console.error('Error creating payment session:', error);
      toast.error('Erreur lors de la création de la session de paiement');
    },
  });
};
