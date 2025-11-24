
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useCompleteOrderPayment } from "@/hooks/useOrderCompletion";
import ReviewModal from "./ReviewModal";

import { Order } from '@/types';

interface OrderCompletionButtonProps {
  orderId: string;
  order?: Order;
  disabled?: boolean;
  className?: string;
}

const OrderCompletionButton = ({ orderId, order, disabled, className }: OrderCompletionButtonProps) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const completePayment = useCompleteOrderPayment();

  const handleComplete = () => {
    completePayment.mutate(orderId, {
      onSuccess: () => {
        // Afficher le modal d'avis après confirmation réussie
        setShowReviewModal(true);
      }
    });
  };

  return (
    <>
      <Button
        onClick={handleComplete}
        disabled={disabled || completePayment.isPending}
        className={`bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 ${className}`}
      >
        {completePayment.isPending ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <CheckCircle className="w-4 h-4 mr-2" />
        )}
        {completePayment.isPending ? 'Confirmation...' : 'Confirmer la prestation'}
      </Button>

      {order && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          order={order}
        />
      )}
    </>
  );
};

export default OrderCompletionButton;
