import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Order } from '@/types';

interface OrderTimelineInfoProps {
  order: Order;
  userRole: 'influenceur' | 'commercant';
}

const OrderTimelineInfo = ({ order, userRole }: OrderTimelineInfoProps) => {
  const getTimeRemaining = (date: string, hoursLimit: number) => {
    const targetTime = new Date(date).getTime() + (hoursLimit * 60 * 60 * 1000);
    const now = new Date().getTime();
    const remainingMs = targetTime - now;
    
    if (remainingMs <= 0) return 'Expiré';
    
    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (remainingHours > 0) {
      return `${remainingHours}h ${remainingMinutes}m restantes`;
    }
    return `${remainingMinutes}m restantes`;
  };

  const renderTimelineStep = (status: string, isActive: boolean, isCompleted: boolean, title: string, description: string, timeInfo?: string) => (
    <div className="flex items-start gap-3 pb-4">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isCompleted ? 'bg-green-100 text-green-600' : 
        isActive ? 'bg-blue-100 text-blue-600' : 
        'bg-gray-100 text-gray-400'
      }`}>
        {isCompleted ? <CheckCircle className="w-4 h-4" /> : 
         isActive ? <Clock className="w-4 h-4" /> : 
         <div className="w-2 h-2 bg-current rounded-full" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
            {title}
          </h4>
          {isActive && timeInfo && (
            <Badge variant="outline" className="text-xs">
              {timeInfo}
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );

  const getOrderTimeline = () => {
    const status = order.status;
    const steps = [];

    // Étape 1: Commande créée
    steps.push({
      status: 'created',
      isCompleted: true,
      isActive: false,
      title: 'Commande créée',
      description: `Commande créée le ${new Date(order.created_at).toLocaleDateString()}`
    });

    // Étape 2: En attente de confirmation influenceur
    if (['en_attente_confirmation_influenceur', 'payment_authorized'].includes(status)) {
      const timeRemaining = getTimeRemaining(order.created_at, 48);
      steps.push({
        status: 'waiting_confirmation',
        isCompleted: false,
        isActive: true,
        title: userRole === 'influenceur' ? 'Votre confirmation requise' : 'En attente de confirmation',
        description: userRole === 'influenceur' ? 
          'Vous devez accepter ou refuser cette commande' : 
          'L\'influenceur doit confirmer la commande',
        timeInfo: timeRemaining
      });
    } else if (['en_cours', 'delivered', 'terminée', 'validée_par_plateforme'].includes(status)) {
      steps.push({
        status: 'waiting_confirmation',
        isCompleted: true,
        isActive: false,
        title: 'Confirmation reçue',
        description: status === 'refusée_par_influenceur' ? 
          'Commande refusée par l\'influenceur' : 
          'Commande acceptée par l\'influenceur'
      });
    } else if (status === 'refusée_par_influenceur') {
      steps.push({
        status: 'waiting_confirmation',
        isCompleted: true,
        isActive: false,
        title: 'Confirmation reçue',
        description: 'Commande refusée par l\'influenceur'
      });
    }

    // Étape 3: En cours de réalisation
    if (status === 'en_cours') {
      steps.push({
        status: 'in_progress',
        isCompleted: false,
        isActive: true,
        title: 'Prestation en cours',
        description: userRole === 'influenceur' ? 
          'Réalisez la prestation puis marquez-la comme livrée' : 
          'L\'influenceur réalise la prestation'
      });
    } else if (['delivered', 'terminée', 'en_contestation', 'validée_par_plateforme'].includes(status)) {
      steps.push({
        status: 'in_progress',
        isCompleted: true,
        isActive: false,
        title: 'Prestation réalisée',
        description: 'L\'influenceur a terminé la prestation'
      });
    }

    // Étape 4: Livraison et confirmation
    if (status === 'delivered') {
      const timeRemaining = getTimeRemaining(order.updated_at, 48);
      steps.push({
        status: 'delivered',
        isCompleted: false,
        isActive: true,
        title: userRole === 'commercant' ? 'Votre confirmation requise' : 'En attente de confirmation',
        description: userRole === 'commercant' ? 
          'Confirmez la réception de la prestation' : 
          'En attente de la confirmation du commerçant',
        timeInfo: timeRemaining
      });
    } else if (['terminée', 'validée_par_plateforme'].includes(status)) {
      steps.push({
        status: 'delivered',
        isCompleted: true,
        isActive: false,
        title: 'Prestation confirmée',
        description: status === 'validée_par_plateforme' ? 
          'Validée par la plateforme après contestation' : 
          'Confirmée par le commerçant'
      });
    }

    // Étape 5: Contestation si applicable
    if (status === 'en_contestation') {
      steps.push({
        status: 'contested',
        isCompleted: false,
        isActive: true,
        title: 'En contestation',
        description: 'Contestation en cours d\'examen par l\'administration'
      });
    }

    return steps;
  };

  const timeline = getOrderTimeline();

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Suivi de la commande
        </h3>
        
        <div className="space-y-4">
          {timeline.map((step, index) => (
            <div key={step.status} className="relative">
              {renderTimelineStep(
                step.status,
                step.isActive,
                step.isCompleted,
                step.title,
                step.description,
                step.timeInfo
              )}
              {index < timeline.length - 1 && (
                <div className="absolute left-4 top-8 w-px h-4 bg-gray-200" />
              )}
            </div>
          ))}
        </div>

        {/* Informations importantes */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-2">Délais importants :</p>
              <ul className="text-blue-700 space-y-1">
                <li>• L'influenceur a 48h pour accepter une nouvelle commande</li>
                <li>• Le commerçant a 48h pour confirmer la réception</li>
                <li>• L'influenceur peut contester après 48h sans confirmation</li>
                <li>• Les commandes sont automatiquement confirmées après 48h</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderTimelineInfo;