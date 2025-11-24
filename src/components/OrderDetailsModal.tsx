import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Clock, Euro, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import OrderTimelineInfo from "./OrderTimelineInfo";
import { useAcceptOrder, useRefuseOrder, useMarkOrderAsDelivered, useConfirmOrderCompletion } from "@/hooks/useOrders";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ReviewModal from "./ReviewModal";
import ContestationModal from "./ContestationModal";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'influenceur' | 'commercant';
  order: {
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
    updated_at?: string;
    delivery_date?: string;
    requirements?: string;
    merchant_id?: string;
    influencer_id?: string;
    offer_title?: string;
    offer_description?: string;
    offer_delivery_time?: string;
    merchant?: {
      first_name?: string;
      last_name?: string;
      avatar_url?: string;
    };
    influencer?: {
      first_name?: string;
      last_name?: string;
      avatar_url?: string;
    };
  };
}

const OrderActions = ({ order, userRole, onClose }: { order: any, userRole: string, onClose: () => void }) => {
  const queryClient = useQueryClient();
  const [showContestationModal, setShowContestationModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  const acceptOrder = useAcceptOrder();
  const refuseOrder = useRefuseOrder();
  const markAsDelivered = useMarkOrderAsDelivered();
  const confirmCompletion = useConfirmOrderCompletion();

  // Hook for capturing payment when influencer accepts
  const capturePayment = useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase.functions.invoke('capture-payment-and-transfer', {
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
      console.error('Error capturing payment:', error);
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
      console.error('Error canceling payment:', error);
      toast.error('Erreur lors de l\'annulation du paiement');
    },
  });

  const handleAccept = async () => {
    try {
      if (order.status === 'payment_authorized') {
        await capturePayment.mutateAsync(order.id);
      } else {
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
        await cancelPayment.mutateAsync(order.id);
      } else {
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
    } catch (error) {
      toast.error('Erreur lors de la confirmation');
    }
  };

  const canContestOrder = (order: any) => {
    if (order.status !== 'delivered' && order.status !== 'terminée') return false;
    if (!order.updated_at) return false;
    const deliveredAt = new Date(order.updated_at);
    const now = new Date();
    const hoursSinceDelivery = (now.getTime() - deliveredAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceDelivery >= 48;
  };

  // Déterminer quelles actions sont possibles
  const canAccept = userRole === 'influenceur' && (
    order.status === 'en_attente_confirmation_influenceur' || 
    order.status === 'payment_authorized' || 
    order.status === 'pending'
  );
  
  const canRefuse = userRole === 'influenceur' && (
    order.status === 'en_attente_confirmation_influenceur' || 
    order.status === 'payment_authorized' || 
    order.status === 'pending'
  );
  
  const canMarkDelivered = userRole === 'influenceur' && order.status === 'en_cours';
  const canConfirmCompletion = userRole === 'commercant' && (order.status === 'delivered' || order.status === 'terminée');
  const canContest = (userRole === 'influenceur' || userRole === 'commercant') && (order.status === 'delivered' || order.status === 'terminée') && canContestOrder(order);

  // Debug: Toujours afficher le composant pour voir ce qui se passe
  console.log('OrderActions - Status:', order.status, 'UserRole:', userRole);
  console.log('OrderActions - canAccept:', canAccept, 'canRefuse:', canRefuse);

  return (
    <div className="space-y-3 pt-4 border-t">
      <h4 className="font-semibold text-gray-800">Actions</h4>
      
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
              Accepter la commande
            </>
          )}
        </Button>
      )}

      {canRefuse && (
        <Button
          onClick={handleRefuse}
          disabled={refuseOrder.isPending || cancelPayment.isPending}
          variant="destructive"
          className="w-full"
        >
          {(refuseOrder.isPending || cancelPayment.isPending) ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {order.status === 'payment_authorized' ? 'Annulation...' : 'Refus...'}
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 mr-2" />
              Refuser la commande
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

      {canConfirmCompletion && (
        <Button
          onClick={handleConfirmCompletion}
          disabled={confirmCompletion.isPending}
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

      {canContest && (
        <Button
          onClick={() => setShowContestationModal(true)}
          variant="outline"
          className="w-full border-amber-300 text-amber-600 hover:bg-amber-50"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Contester la prestation
        </Button>
      )}

      {(order.status === 'delivered' || order.status === 'terminée') && (userRole === 'influenceur' || userRole === 'commercant') && !canContest && (
        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
          <Clock className="w-4 h-4" />
          Vous pourrez contester après 48h si le {userRole === 'commercant' ? 'problème persiste' : 'commerçant ne confirme pas'}
        </div>
      )}

      {/* Modal de contestation */}
      <ContestationModal
        isOpen={showContestationModal}
        onClose={() => setShowContestationModal(false)}
        order={order}
      />

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

const OrderDetailsModal = ({ isOpen, onClose, order, userRole = 'commercant' }: OrderDetailsModalProps) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [effectiveUserRole, setEffectiveUserRole] = useState<string>(userRole);
  
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        
        // Récupérer les détails de la commande pour déterminer le rôle effectif
        const { data: orderDetails } = await supabase
          .from('orders')
          .select('influencer_id, merchant_id')
          .eq('id', order.id)
          .single();
          
        if (orderDetails) {
          if (user.id === orderDetails.influencer_id) {
            setEffectiveUserRole('influenceur');
          } else if (user.id === orderDetails.merchant_id) {
            setEffectiveUserRole('commercant');
          }
        }
      }
    };
    
    if (isOpen) {
      getCurrentUser();
    }
  }, [isOpen, order.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'payment_authorized':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'en_attente_confirmation_influenceur':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'refusée_par_influenceur':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'en_cours':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'terminée':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'en_contestation':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'validée_par_plateforme':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'annulée':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "pending": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'payment_authorized':
        return 'Paiement autorisé';
      case 'en_attente_confirmation_influenceur':
        return 'En attente de confirmation';
      case 'refusée_par_influenceur':
        return 'Refusée par l\'influenceur';
      case 'en_cours':
        return 'En cours';
      case 'delivered':
        return 'Livrée - En attente de confirmation';
      case 'terminée':
        return 'Terminée';
      case 'en_contestation':
        return 'En contestation';
      case 'validée_par_plateforme':
        return 'Validée par la plateforme';
      case 'annulée':
        return 'Annulée';
      case "completed": return "Réalisée";
      case "in_progress": return "En cours";
      case "pending": return "Nouveau";
      case "cancelled": return "Annulée";
      default: return status;
    }
  };

  const otherParty = order.merchant || order.influencer;
  const otherPartyName = `${otherParty?.first_name || ''} ${otherParty?.last_name || ''}`.trim() || 'Utilisateur';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails de la commande #{order.id.slice(0, 8)}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pb-4">
          {/* User Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Avatar className="w-16 h-16">
              <AvatarImage src={otherParty?.avatar_url} />
              <AvatarFallback>
                {otherPartyName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{otherPartyName}</h3>
              <p className="text-gray-600">{order.merchant ? 'Commerçant' : 'Influenceur'}</p>
            </div>
          </div>

          {/* Service Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Service demandé</h4>
              <p className="text-lg">{order.offer_title || 'Service'}</p>
            </div>

            {order.offer_description && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Description du service</h4>
                <p className="text-gray-600">{order.offer_description}</p>
              </div>
            )}

            {order.requirements && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Instructions spéciales</h4>
                <p className="text-gray-600">{order.requirements}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Date de commande</p>
                  <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {order.delivery_date && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Livraison prévue</p>
                    <p className="font-medium">{new Date(order.delivery_date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Euro className="w-5 h-5 text-pink-600" />
                <span className="text-lg font-semibold">Montant total</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                {order.total_amount}€
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Statut:</span>
              <Badge className={getStatusColor(order.status)}>
                {getStatusText(order.status)}
              </Badge>
            </div>
          </div>

          {/* Timeline de la commande */}
          <OrderTimelineInfo order={order} userRole={effectiveUserRole as 'influenceur' | 'commercant'} />

          {/* Boutons d'action */}
          <OrderActions order={order} userRole={effectiveUserRole} onClose={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;