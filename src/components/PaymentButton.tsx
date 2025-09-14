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

const PaymentButton = ({ orderId, amount, influencerId, description, disabled, className }: PaymentButtonProps) => {
  const stripePayment = useStripePayment();

  const handlePayment = async () => {
    console.log('Initiating payment for order:', orderId, 'amount:', amount);
    
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
        console.error('Error updating order status:', updateError);
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
      console.error('Payment initiation error:', error);
      toast.error("Erreur lors de l'initialisation du paiement");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
        <span className="font-medium">⚠️ MODE TEST</span>
        <span>Paiement fictif - Utilisez 4242 4242 4242 4242</span>
      </div>
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
        {stripePayment.isPending ? 'Redirection...' : 'Payer avec Stripe (Test)'}
      </Button>
    </div>
  );
};

export default PaymentButton;