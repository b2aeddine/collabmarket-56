import { Badge } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
  status: string;
}

const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
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
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
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
      default:
        return status;
    }
  };

  return (
    <Badge variant="outline" className={getStatusColor(status)}>
      {getStatusText(status)}
    </Badge>
  );
};

export default OrderStatusBadge;