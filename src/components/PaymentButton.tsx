import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { useStripePayment } from "@/hooks/useStripePayment";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentButtonProps {
  orderId: string;
  amount: number;
  influencerId: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

const PaymentButton = memo(({ orderId, amount, influencerId, description, disabled, className }: PaymentButtonProps) => {
  const stripePayment = useStripePayment();

  const handlePayment = useCallback(async () => {
    try {
      // Marquer la commande comme "pending_payment" avant de rediriger vers Stripe
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'pending_payment',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        toast.error("Erreur lors de la préparation du paiement");
        return;
      }

      // Lancer le processus de paiement Stripe
      stripePayment.mutate({
        orderId,
        amount,
        description: description || 'Paiement de campagne',
        successUrl: `${window.location.origin}/payment-success?order_id=${orderId}`,
        cancelUrl: `${window.location.origin}/payment-cancel?order_id=${orderId}`,
      });
    } catch (error) {
      toast.error("Erreur lors de l'initialisation du paiement");
    }
  }, [orderId, amount, description, stripePayment]);

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || stripePayment.isPending}
      className={`bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 ${className}`}
    >
      {stripePayment.isPending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <CreditCard className="w-4 h-4 mr-2" />
      )}
      {stripePayment.isPending ? 'Redirection...' : 'Payer avec Stripe'}
    </Button>
  );
});

PaymentButton.displayName = 'PaymentButton';

export default PaymentButton;