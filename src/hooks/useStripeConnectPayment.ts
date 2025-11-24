import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { handleError } from '@/utils/errorHandler';
import type { 
  StripeConnectPaymentParams, 
  PaymentCaptureParams, 
  PaymentResponse 
} from '@/types/payment';

/**
 * Hook for managing Stripe Connect payments
 * Handles both payment creation and capture operations
 */
export const useStripeConnectPayment = () => {
  const createPayment = useMutation({
    mutationFn: async (params: StripeConnectPaymentParams): Promise<PaymentResponse> => {
      const { data, error } = await supabase.functions.invoke('create-payment-with-connect', {
        body: params
      });

      if (error) {
        throw error;
      }
      return data as PaymentResponse;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error('Aucune URL de paiement reçue');
      }
    },
    onError: (error: unknown) => {
      const message = handleError('StripeConnectPayment.create', error);
      toast.error(message);
    },
  });

  const capturePayment = useMutation({
    mutationFn: async (params: PaymentCaptureParams) => {
      const { data, error } = await supabase.functions.invoke('capture-payment-and-transfer', {
        body: params
      });

      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      toast.success('Paiement confirmé et fonds transférés !');
    },
    onError: (error: unknown) => {
      const message = handleError('StripeConnectPayment.capture', error);
      toast.error(message);
    },
  });

  return {
    createPayment: createPayment.mutate,
    createPaymentAsync: createPayment.mutateAsync,
    isCreatingPayment: createPayment.isPending,
    capturePayment: capturePayment.mutate,
    capturePaymentAsync: capturePayment.mutateAsync,
    isCapturingPayment: capturePayment.isPending,
  };
};