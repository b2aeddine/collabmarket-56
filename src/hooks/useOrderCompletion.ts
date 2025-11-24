
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useStripeConnectPayment } from './useStripeConnectPayment';

export const useCompleteOrderPayment = () => {
  const queryClient = useQueryClient();
  const { capturePaymentAsync } = useStripeConnectPayment();
  
  return useMutation({
    mutationFn: async (orderId: string) => {
      return await capturePaymentAsync({ orderId });
    },
    onSuccess: (data, orderId) => {
      toast.success('Prestation confirmée ! Les fonds ont été distribués.');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['influencer-revenues'] });
      queryClient.invalidateQueries({ queryKey: ['influencer-balance'] });
      queryClient.invalidateQueries({ queryKey: ['stripe-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
    },
    onError: (error) => {
      toast.error('Erreur lors de la confirmation de la prestation');
    },
  });
};
