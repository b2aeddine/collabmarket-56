import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useStripeConnectPayment } from './useStripeConnectPayment';
import { handleError } from '@/utils/errorHandler';

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

/**
 * Hook for processing direct payments using Stripe Connect
 * Handles payment creation and redirects to Stripe checkout
 */
export const useDirectPayment = () => {
  const { createPaymentAsync } = useStripeConnectPayment();

  return useMutation({
    mutationFn: async (params: DirectPaymentParams) => {
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
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error('Aucune URL de paiement reçue');
      }
    },
    onError: (error: unknown) => {
      const message = handleError('DirectPayment', error);
      toast.error(message);
    },
  });
};