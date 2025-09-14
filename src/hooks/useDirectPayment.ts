import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useStripeConnectPayment } from './useStripeConnectPayment';

interface DirectPaymentParams {
  influencerId: string;
  offerId: string;
  amount: number;
  brandName: string;
  productName: string;
  brief: string;
  deadline?: string;
  specialInstructions?: string;
}

export const useDirectPayment = () => {
  const { createPaymentAsync } = useStripeConnectPayment();

  return useMutation({
    mutationFn: async (params: DirectPaymentParams) => {
      console.log('Using Stripe Connect payment with params:', params);
      
      return await createPaymentAsync({
        influencerId: params.influencerId,
        offerId: params.offerId,
        amount: params.amount,
        brandName: params.brandName,
        productName: params.productName,
        brief: params.brief,
        deadline: params.deadline,
        specialInstructions: params.specialInstructions
      });
    },
    onSuccess: (data) => {
      console.log('Stripe Connect payment successful:', data);
      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error('No URL returned from Stripe Connect payment');
        toast.error('Aucune URL de paiement reçue');
      }
    },
    onError: (error) => {
      console.error('Error creating Stripe Connect payment:', error);
      toast.error(`Erreur lors de la création du paiement: ${error.message || 'Erreur inconnue'}`);
    },
  });
};