import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAcceptOrder, useRefuseOrder, useMarkOrderAsDelivered, useConfirmOrderCompletion, useContestOrder } from "@/hooks/useOrders";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ContestationModal from "./ContestationModal";
import ReviewModal from "./ReviewModal";

interface OrderActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  userRole: 'commercant' | 'influenceur';
}

const OrderActionModal = ({ order, isOpen, onClose, userRole }: OrderActionModalProps) => {
  const queryClient = useQueryClient();
  const acceptOrder = useAcceptOrder();
  const refuseOrder = useRefuseOrder();
  const markAsDelivered = useMarkOrderAsDelivered();
  const confirmCompletion = useConfirmOrderCompletion();
  const contestOrder = useContestOrder();
  const [showContestationModal, setShowContestationModal] = useState(false);
  const [showMerchantContestModal, setShowMerchantContestModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [preuveInfluenceur, setPreuveInfluenceur] = useState('');
  const [preuveMerchant, setPreuveMerchant] = useState('');

  // Hook for capturing payment when influencer accepts
  const capturePayment = useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase.functions.invoke('capture-payment', {
        body: { orderId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Commande acceptée et paiement capturé !');
      onClose();
    },
    onError: (error) => {
      toast.error('Erreur lors de la capture du paiement');
    },
  });

  // Hook for canceling payment when influencer refuses
  const cancelPayment = useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase.functions.invoke('cancel-payment', {
        body: { orderId, reason: 'refused' }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Commande refusée et paiement annulé');
      onClose();
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'annulation du paiement');
    },
  });

  const handleAccept = async () => {
    try {
      if (order.status === 'payment_authorized') {
        // For direct payment: capture the payment
        await capturePayment.mutateAsync(order.id);
      } else {
        // For old flow: just accept the order
        await acceptOrder.mutateAsync(order.id);
        toast.success('Commande acceptée avec succès');
        onClose();
      }
    } catch (error) {
      toast.error('Erreur lors de l\'acceptation de la commande');
    }
  };

  const handleRefuse = async () => {
    try {
      if (order.status === 'payment_authorized') {
        // For direct payment: cancel the payment
        await cancelPayment.mutateAsync(order.id);
      } else {
        // For old flow: just refuse the order
        await refuseOrder.mutateAsync(order.id);
        toast.success('Commande refusée');
        onClose();
      }
    } catch (error) {
      toast.error('Erreur lors du refus de la commande');
    }
  };

  const handleMarkDelivered = async () => {
    try {
      await markAsDelivered.mutateAsync(order.id);
      toast.success('Prestation marquée comme livrée');
      onClose();
    } catch (error) {
      toast.error('Erreur lors du marquage de la prestation');
    }
  };

  const handleConfirmCompletion = async () => {
    try {
      await confirmCompletion.mutateAsync(order.id);
      toast.success('Commande confirmée avec succès');
      // Afficher le modal d'avis après confirmation réussie
      setShowReviewModal(true);
      // Ne pas fermer le modal principal ici, attendre que l'avis soit publié
    } catch (error) {
      toast.error('Erreur lors de la confirmation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'payment_authorized':
        return 'bg-orange-100 text-orange-800';
      case 'en_attente_confirmation_influenceur':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_cours':
        return 'bg-blue-100 text-blue-800';
      case 'terminée':
        return 'bg-green-100 text-green-800';
      case 'refusée_par_influenceur':
        return 'bg-red-100 text-red-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'en_contestation':
        return 'bg-red-100 text-red-800';
      case 'validée_par_plateforme':
        return 'bg-green-100 text-green-800';
      case 'annulée':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'payment_authorized':
        return 'Paiement autorisé - En attente de confirmation';
      case 'en_attente_confirmation_influenceur':
        return 'En attente de confirmation';
      case 'en_cours':
        return 'En cours';
      case 'terminée':
        return 'Terminée';
      case 'refusée_par_influenceur':
        return 'Refusée par l\'influenceur';
      case 'delivered':
        return 'Livrée';
      case 'completed':
        return 'Confirmée par le client';
      case 'en_contestation':
        return 'En contestation';
      case 'validée_par_plateforme':
        return 'Validée par la plateforme';
      case 'annulée':
        return 'Annulée';
      default:
        return status;
    }
  };

  const canContestOrder = (order: any) => {
    if (order.status !== 'delivered') return false;
    if (!order.updated_at) return false;
    const deliveredAt = new Date(order.updated_at);
    const now = new Date();
    const hoursSinceDelivery = (now.getTime() - deliveredAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceDelivery >= 48;
  };

  const handleContest = async () => {
    if (!preuveInfluenceur.trim()) {
      toast.error('Veuillez fournir une preuve ou explication');
      return;
    }
    
    try {
      await contestOrder.mutateAsync({ orderId: order.id, preuveInfluenceur });
      toast.success('Contestation envoyée à l\'administration');
      setShowContestationModal(false);
      setPreuveInfluenceur('');
      onClose();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la contestation');
    }
  };

  const handleMerchantContest = async () => {
    if (!preuveMerchant.trim()) {
      toast.error('Veuillez fournir une preuve ou explication');
      return;
    }
    
    try {
      await contestOrder.mutateAsync({ orderId: order.id, preuveInfluenceur: preuveMerchant });
      toast.success('Contestation envoyée à l\'administration');
      setShowMerchantContestModal(false);
      setPreuveMerchant('');
      onClose();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la contestation');
    }
  };

  const canAccept = userRole === 'influenceur' && (order.status === 'en_attente_confirmation_influenceur' || order.status === 'payment_authorized');
  const canRefuse = userRole === 'influenceur' && (order.status === 'en_attente_confirmation_influenceur' || order.status === 'payment_authorized');
  const canMarkDelivered = userRole === 'influenceur' && order.status === 'en_cours';
  const canConfirmCompletion = userRole === 'commercant' && order.status === 'delivered';
  const canContest = userRole === 'influenceur' && order.status === 'delivered' && canContestOrder(order);
  const canMerchantContest = userRole === 'commercant' && order.status === 'delivered';

  // Debug logs removed for performance

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Actions sur la commande
            <Badge className={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            <p><strong>Service:</strong> {order.offers?.title}</p>
            <p><strong>Montant:</strong> {order.total_amount}€</p>
            <p><strong>Commande:</strong> #{order.id.slice(0, 8)}</p>
          </div>

          <div className="space-y-3">
            {canAccept && (
              <Button
                onClick={handleAccept}
                disabled={acceptOrder.isPending || capturePayment.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {(acceptOrder.isPending || capturePayment.isPending) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {order.status === 'payment_authorized' ? 'Capture en cours...' : 'Acceptation...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accepter
                  </>
                )}
              </Button>
            )}

            {canRefuse && (
              <Button
                onClick={handleRefuse}
                disabled={refuseOrder.isPending || cancelPayment.isPending}
                variant="destructive"
              >
                {(refuseOrder.isPending || cancelPayment.isPending) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {order.status === 'payment_authorized' ? 'Annulation...' : 'Refus...'}
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Refuser
                  </>
                )}
              </Button>
            )}

            {canMarkDelivered && (
              <Button
                onClick={handleMarkDelivered}
                disabled={markAsDelivered.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {markAsDelivered.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Marquer comme livrée
              </Button>
            )}

            {canConfirmCompletion && order.status === 'delivered' && (
              <Button
                onClick={handleConfirmCompletion}
                disabled={confirmCompletion.isPending || order.status === 'completed'}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {confirmCompletion.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Confirmer la réception
              </Button>
            )}

            {canMerchantContest && (
              <Button
                onClick={() => setShowMerchantContestModal(true)}
                variant="outline"
                className="w-full border-amber-300 text-amber-600 hover:bg-amber-50"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Contester la prestation
              </Button>
            )}

            {canContest && (
              <Button
                onClick={() => setShowContestationModal(true)}
                variant="outline"
                className="w-full border-amber-300 text-amber-600 hover:bg-amber-50"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Contester le blocage
              </Button>
            )}

            {order.status === 'delivered' && userRole === 'influenceur' && !canContest && (
              <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                <Clock className="w-4 h-4" />
                Vous pourrez contester après 48h si le commerçant ne confirme pas
              </div>
            )}
          </div>

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Fermer
          </Button>
        </CardContent>
      </Card>

      {/* Modal de contestation simple */}
      {showContestationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Contester la commande</h3>
            <p className="text-sm text-gray-600 mb-4">
              Expliquez pourquoi vous contestez cette commande et fournissez des preuves si possible.
            </p>
            <textarea
              value={preuveInfluenceur}
              onChange={(e) => setPreuveInfluenceur(e.target.value)}
              placeholder="Décrivez votre situation et fournissez des preuves..."
              className="w-full p-3 border rounded-lg h-32 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleContest}
                disabled={contestOrder.isPending}
                className="flex-1"
              >
                {contestOrder.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Envoyer la contestation
              </Button>
              <Button
                onClick={() => {
                  setShowContestationModal(false);
                  setPreuveInfluenceur('');
                }}
                variant="outline"
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de contestation commerçant */}
      {showMerchantContestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Contester la prestation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Expliquez pourquoi vous contestez cette prestation et fournissez des preuves si possible.
            </p>
            <textarea
              value={preuveMerchant}
              onChange={(e) => setPreuveMerchant(e.target.value)}
              placeholder="Décrivez votre situation et fournissez des preuves..."
              className="w-full p-3 border rounded-lg h-32 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleMerchantContest}
                disabled={contestOrder.isPending}
                className="flex-1"
              >
                {contestOrder.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Envoyer la contestation
              </Button>
              <Button
                onClick={() => {
                  setShowMerchantContestModal(false);
                  setPreuveMerchant('');
                }}
                variant="outline"
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'avis */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          onClose(); // Fermer le modal principal après avoir fermé le modal d'avis
        }}
        order={order}
      />
    </div>
  );
};

export default OrderActionModal;