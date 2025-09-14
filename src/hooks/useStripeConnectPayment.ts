import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateConnectPaymentParams {
  influencerId: string;
  offerId: string;
  amount: number;
  brandName: string;
  productName: string;
  brief: string;
  deadline?: string;
  specialInstructions?: string;
}

interface CapturePaymentParams {
  orderId: string;
}

export const useStripeConnectPayment = () => {
  const createPayment = useMutation({
    mutationFn: async (params: CreateConnectPaymentParams) => {
      console.log('Creating Stripe Connect payment with params:', params);
      
      const { data, error } = await supabase.functions.invoke('create-payment-with-connect', {
        body: params
      });

      console.log('Response from create-payment-with-connect:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      console.log('Payment creation successful:', data);
      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error('No URL returned from payment creation');
        toast.error('Aucune URL de paiement reçue');
      }
    },
    onError: (error: any) => {
      console.error('Error creating Connect payment:', error);
      toast.error(`Erreur lors de la création du paiement: ${error.message || 'Erreur inconnue'}`);
    },
  });

  const capturePayment = useMutation({
    mutationFn: async (params: CapturePaymentParams) => {
      console.log('Capturing payment for order:', params.orderId);
      
      const { data, error } = await supabase.functions.invoke('capture-payment-and-transfer', {
        body: params
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      console.log('Payment capture successful:', data);
      toast.success('Paiement confirmé et fonds transférés !');
    },
    onError: (error: any) => {
      console.error('Error capturing payment:', error);
      toast.error(`Erreur lors de la capture du paiement: ${error.message || 'Erreur inconnue'}`);
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