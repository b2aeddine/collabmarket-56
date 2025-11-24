
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import OrderDetailsModal from "@/components/OrderDetailsModal";
import OrderActionModal from "@/components/OrderActionModal";
import MessagingModal from "@/components/MessagingModal";
import ReviewModal from "@/components/ReviewModal";
import { ShoppingBag, Calendar, MessageCircle, Settings, AlertTriangle, CheckCircle, Clock, XCircle, Star } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@/types";
import { PaymentStatusAlert } from "@/components/PaymentStatusAlert";

const OrdersManagement = () => {
  const { user } = useAuth();
  const { orders, isLoading } = useOrders(user?.role);
  
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [selectedOrderForAction, setSelectedOrderForAction] = useState(null);
  const [selectedOrderForMessage, setSelectedOrderForMessage] = useState(null);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  // Hook pour vérifier les avis existants
  const { data: existingReviews = [] } = useQuery({
    queryKey: ['existing-reviews', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('reviews')
        .select('order_id')
        .eq('merchant_id', user.id);
      
      if (error) throw error;
      return data?.map(r => r.order_id) || [];
    },
    enabled: !!user?.id && user?.role === 'commercant',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'payment_authorized':
        return 'bg-orange-100 text-orange-800';
      case 'en_attente_confirmation_influenceur':
        return 'bg-yellow-100 text-yellow-800';
      case 'refusée_par_influenceur':
        return 'bg-red-100 text-red-800';
      case 'en_cours':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      case 'terminée':
        return 'bg-green-100 text-green-800';
      case 'en_contestation':
        return 'bg-amber-100 text-amber-800';
      case 'validée_par_plateforme':
        return 'bg-emerald-100 text-emerald-800';
      case 'annulée':
        return 'bg-gray-100 text-gray-800';
      case "completed": 
        return "bg-green-100 text-green-800";
      case "accepted": 
        return "bg-blue-100 text-blue-800";
      case "pending": 
        return "bg-yellow-100 text-yellow-800";
      case "disputed": 
        return "bg-red-100 text-red-800";
      case "refused": 
        return "bg-gray-100 text-gray-800";
      case "cancelled": 
        return "bg-red-100 text-red-800";
      default: 
        return "bg-gray-100 text-gray-800";
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
      case "completed": 
        return "Terminée";
      case "accepted": 
        return "Acceptée";
      case "pending": 
        return "En attente";
      case "disputed": 
        return "En litige";
      case "refused": 
        return "Refusée";
      case "cancelled": 
        return "Annulée";
      default: 
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "accepted": return <CheckCircle className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      case "disputed": return <AlertTriangle className="w-4 h-4" />;
      case "refused": return <XCircle className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getActionMessage = (order: Order, userRole: 'influenceur' | 'commercant') => {
    if (userRole === 'influenceur') {
      switch (order.status) {
        case 'payment_authorized':
          return "Nouveau - Paiement autorisé par le commerçant";
        case 'en_attente_confirmation_influenceur':
          return "Nouvelle commande à valider";
        case 'pending':
          return "Nouvelle commande à valider";
        case 'en_cours':
          return "Commande en cours - Marquez comme livrée quand terminé";
        case 'accepted':
          return "Commande en cours - Marquez comme livrée quand terminé";
        case 'delivered':
          return "En attente de confirmation du commerçant";
        case 'en_contestation':
          return "Commande en litige";
        case 'disputed':
          return "Commande en litige";
        default:
          return "";
      }
    } else if (userRole === 'commercant') {
      switch (order.status) {
        case 'payment_authorized':
          return "Paiement effectué - En attente de validation par l'influenceur";
        case 'en_attente_confirmation_influenceur':
          return "En attente de validation par l'influenceur";
        case 'pending':
          return "En attente de validation par l'influenceur";
        case 'en_cours':
          return "Commande acceptée - En cours de réalisation";
        case 'accepted':
          return "Commande acceptée - En cours de réalisation";
        case 'delivered':
          return "Prestation livrée - Confirmez la réception";
        case 'en_contestation':
          return "Commande en litige";
        case 'disputed':
          return "Commande en litige";
        default:
          return "";
      }
    }
    return "";
  };

  const handleContactUser = (order) => {
    const otherUser = user?.role === 'commercant' 
      ? {
          id: order.influencer_id,
          username: `@${order.influencer?.first_name || 'influencer'}`,
          fullName: `${order.influencer?.first_name || ''} ${order.influencer?.last_name || ''}`.trim(),
          avatar: order.influencer?.avatar_url || "/placeholder.svg"
        }
      : {
          id: order.merchant_id,
          username: `@${order.merchant?.first_name || 'merchant'}`,
          fullName: `${order.merchant?.first_name || ''} ${order.merchant?.last_name || ''}`.trim(),
          avatar: order.merchant?.avatar_url || "/placeholder.svg"
        };
    
    setSelectedOrderForMessage(otherUser);
  };

  const handleViewDetails = (order) => {
    setSelectedOrderForDetails(order);
  };

  const handleOrderAction = (order) => {
    setSelectedOrderForAction(order);
  };

  const hasActionAvailable = (order: Order, userRole: 'influenceur' | 'commercant') => {
    if (userRole === 'influenceur') {
      return ['pending', 'payment_authorized', 'en_attente_confirmation_influenceur', 'en_cours', 'accepted', 'delivered'].includes(order.status);
    } else if (userRole === 'commercant') {
      return order.status === 'delivered';
    }
    return false;
  };

  const hasReviewAvailable = (order: Order) => {
    return user?.role === 'commercant' && 
           order.status === 'completed' && 
           !existingReviews.includes(order.id);
  };

  const handleLeaveReview = (order) => {
    setSelectedOrderForReview(order);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  const userOrders = orders?.filter(order => 
    user?.role === 'commercant' ? order.merchant_id === user.id : order.influencer_id === user.id
  ) || [];

  const orderStats = {
    total: userOrders.length,
    completed: userOrders.filter(o => ["completed", "terminée", "validée_par_plateforme"].includes(o.status)).length,
    pending: userOrders.filter(o => ["pending", "en_attente_confirmation_influenceur", "payment_authorized"].includes(o.status)).length,
    inProgress: userOrders.filter(o => ["en_cours", "delivered", "accepted"].includes(o.status)).length,
    disputed: userOrders.filter(o => ["disputed", "en_contestation"].includes(o.status)).length,
    refused: userOrders.filter(o => ["refused", "refusée_par_influenceur"].includes(o.status)).length
  };

  const getFilteredOrders = (tab: string) => {
    switch (tab) {
      case "pending":
        return userOrders.filter(o => ["pending", "en_attente_confirmation_influenceur", "payment_authorized"].includes(o.status));
      case "inProgress":
        return userOrders.filter(o => ["en_cours", "delivered", "accepted"].includes(o.status));
      case "completed":
        return userOrders.filter(o => ["completed", "terminée", "validée_par_plateforme"].includes(o.status));
      case "disputed":
        return userOrders.filter(o => ["disputed", "en_contestation"].includes(o.status));
      case "refused":
        return userOrders.filter(o => ["refused", "refusée_par_influenceur"].includes(o.status));
      default:
        return userOrders;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-gradient">
            Mes commandes
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Gérez toutes vos collaborations
          </p>
        </div>

        <PaymentStatusAlert />

        {/* Order Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{orderStats.total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
                <p className="text-sm text-gray-600">En attente</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{orderStats.inProgress}</p>
                <p className="text-sm text-gray-600">En cours</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{orderStats.completed}</p>
                <p className="text-sm text-gray-600">Terminées</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{orderStats.disputed}</p>
                <p className="text-sm text-gray-600">En litige</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">{orderStats.refused}</p>
                <p className="text-sm text-gray-600">Refusées</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List with Tabs */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Historique des commandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Affichage mobile avec défilement horizontal */}
              <div className="sm:hidden">
                <TabsList className="h-auto p-1 grid grid-cols-3 gap-1">
                  <TabsTrigger value="all" className="text-xs whitespace-nowrap">
                    Toutes ({orderStats.total})
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs whitespace-nowrap">
                    Attente ({orderStats.pending})
                  </TabsTrigger>
                  <TabsTrigger value="inProgress" className="text-xs whitespace-nowrap">
                    En cours ({orderStats.inProgress})
                  </TabsTrigger>
                </TabsList>
                <TabsList className="h-auto p-1 grid grid-cols-3 gap-1 mt-2">
                  <TabsTrigger value="completed" className="text-xs whitespace-nowrap">
                    Terminées ({orderStats.completed})
                  </TabsTrigger>
                  <TabsTrigger value="disputed" className="text-xs whitespace-nowrap">
                    Litige ({orderStats.disputed})
                  </TabsTrigger>
                  <TabsTrigger value="refused" className="text-xs whitespace-nowrap">
                    Refusées ({orderStats.refused})
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Affichage desktop */}
              <div className="hidden sm:block">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="all" className="text-sm">
                    Toutes ({orderStats.total})
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="text-sm">
                    En attente ({orderStats.pending})
                  </TabsTrigger>
                  <TabsTrigger value="inProgress" className="text-sm">
                    En cours ({orderStats.inProgress})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="text-sm">
                    Terminées ({orderStats.completed})
                  </TabsTrigger>
                  <TabsTrigger value="disputed" className="text-sm">
                    En litige ({orderStats.disputed})
                  </TabsTrigger>
                  <TabsTrigger value="refused" className="text-sm">
                    Refusées ({orderStats.refused})
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {["all", "pending", "inProgress", "completed", "disputed", "refused"].map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-6">
                  <div className="space-y-6">
                    {getFilteredOrders(tab).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        {tab === "all" ? "Aucune commande trouvée" : `Aucune commande ${
                          tab === "pending" ? "en attente" :
                          tab === "inProgress" ? "en cours" :
                          tab === "completed" ? "terminée" :
                          tab === "disputed" ? "en litige" :
                          "refusée"
                        }`}
                      </div>
                    ) : (
                      getFilteredOrders(tab).map((order) => (
                        <div key={order.id} className="p-4 sm:p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            {/* User Info */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={
                                  user?.role === 'commercant' 
                                    ? order.influencer?.avatar_url 
                                    : order.merchant?.avatar_url
                                } />
                                <AvatarFallback>
                                  {user?.role === 'commercant' 
                                    ? `${order.influencer?.first_name?.[0] || ''}${order.influencer?.last_name?.[0] || ''}`
                                    : `${order.merchant?.first_name?.[0] || ''}${order.merchant?.last_name?.[0] || ''}`
                                  }
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold text-gray-800">
                                  {user?.role === 'commercant' 
                                    ? `${order.influencer?.first_name || ''} ${order.influencer?.last_name || ''}`.trim() || 'Influenceur'
                                    : `${order.merchant?.first_name || ''} ${order.merchant?.last_name || ''}`.trim() || 'Commerçant'
                                  }
                                </h4>
                                <p className="text-sm text-gray-500">#{order.id.slice(0, 8)}</p>
                              </div>
                            </div>

                            {/* Order Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                                <h3 className="text-lg font-semibold text-gray-800">{order.offer_title || 'Service'}</h3>
                                <div className="flex items-center gap-2">
                                  <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                                    {getStatusIcon(order.status)}
                                    {getStatusText(order.status)}
                                  </Badge>
                                  <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                                    {order.total_amount}€
                                  </span>
                                </div>
                              </div>
                              
                              {/* Message d'action */}
                              {user?.role && getActionMessage(order, user.role as 'influenceur' | 'commercant') && (
                                <div className={`text-sm p-2 rounded-lg mb-3 ${
                                  order.status === 'pending' && user?.role === 'influenceur' ? 'bg-yellow-50 text-yellow-800' :
                                  order.status === 'delivered' && user?.role === 'commercant' ? 'bg-blue-50 text-blue-800' :
                                  order.status === 'disputed' ? 'bg-red-50 text-red-800' :
                                  'bg-gray-50 text-gray-800'
                                }`}>
                                  {getActionMessage(order, user.role as 'influenceur' | 'commercant')}
                                </div>
                              )}
                              
                              <p className="text-gray-600 mb-3 text-sm">{order.requirements || order.special_instructions || 'Aucune instruction spéciale'}</p>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Commandé le {new Date(order.created_at).toLocaleDateString()}
                                </div>
                                {order.delivery_date && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Livraison prévue le {new Date(order.delivery_date).toLocaleDateString()}
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-wrap gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="flex items-center gap-1"
                                  onClick={() => handleContactUser(order)}
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  Contacter
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewDetails(order)}
                                >
                                  Voir détails
                                </Button>
                                {user?.role && hasActionAvailable(order, user.role as 'influenceur' | 'commercant') && (
                                  <Button 
                                    size="sm" 
                                    className="bg-gradient-to-r from-pink-500 to-orange-500 flex items-center gap-1"
                                    onClick={() => handleOrderAction(order)}
                                  >
                                    <Settings className="w-4 h-4" />
                                    Actions
                                  </Button>
                                )}
                                {hasReviewAvailable(order) && (
                                  <Button 
                                    size="sm" 
                                    className="bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center gap-1"
                                    onClick={() => handleLeaveReview(order)}
                                  >
                                    <Star className="w-4 h-4" />
                                    Laisser un avis
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {selectedOrderForDetails && (
        <OrderDetailsModal
          isOpen={!!selectedOrderForDetails}
          onClose={() => setSelectedOrderForDetails(null)}
          order={selectedOrderForDetails}
        />
      )}

      {selectedOrderForAction && (
        <OrderActionModal
          isOpen={!!selectedOrderForAction}
          onClose={() => setSelectedOrderForAction(null)}
          order={selectedOrderForAction}
          userRole={user?.role as 'influenceur' | 'commercant'}
        />
      )}

      {selectedOrderForMessage && (
        <MessagingModal
          isOpen={!!selectedOrderForMessage}
          onClose={() => setSelectedOrderForMessage(null)}
          influencer={selectedOrderForMessage}
        />
      )}

      {selectedOrderForReview && (
        <ReviewModal
          isOpen={!!selectedOrderForReview}
          onClose={() => setSelectedOrderForReview(null)}
          order={selectedOrderForReview}
        />
      )}
    </div>
  );
};

export default OrdersManagement;
