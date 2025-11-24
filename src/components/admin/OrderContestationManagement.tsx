import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

const OrderContestationManagement = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [adminDecision, setAdminDecision] = useState('');

  // Récupérer les commandes en contestation
  const { data: contestedOrders, isLoading } = useQuery({
    queryKey: ['contested-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          offer_title,
          offer_description,
          influencer:profiles!orders_influencer_id_fkey(first_name, last_name, email),
          merchant:profiles!orders_merchant_id_fkey(first_name, last_name, email, company_name)
        `)
        .eq('status', 'en_contestation')
        .order('date_contestation', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000,
  });

  // Valider une contestation
  const validateContestation = useMutation({
    mutationFn: async ({ orderId, decision }: { orderId: string; decision: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'validée_par_plateforme',
          admin_decision: decision,
          admin_decision_date: new Date().toISOString(),
          admin_decision_by: user.id,
        })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contested-orders'] });
      toast.success('Contestation validée - Commande approuvée');
      setSelectedOrder(null);
      setAdminDecision('');
    },
    onError: (error) => {
      console.error('Error validating contestation:', error);
      toast.error('Erreur lors de la validation');
    },
  });

  // Refuser une contestation
  const refuseContestation = useMutation({
    mutationFn: async ({ orderId, decision }: { orderId: string; decision: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'delivered', // Retour au statut précédent
          admin_decision: decision,
          admin_decision_date: new Date().toISOString(),
          admin_decision_by: user.id,
        })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contested-orders'] });
      toast.success('Contestation refusée');
      setSelectedOrder(null);
      setAdminDecision('');
    },
    onError: (error) => {
      console.error('Error refusing contestation:', error);
      toast.error('Erreur lors du refus');
    },
  });

  const handleValidate = () => {
    if (!adminDecision.trim()) {
      toast.error('Veuillez saisir une décision');
      return;
    }
    validateContestation.mutate({ orderId: selectedOrder.id, decision: adminDecision });
  };

  const handleRefuse = () => {
    if (!adminDecision.trim()) {
      toast.error('Veuillez saisir une décision');
      return;
    }
    refuseContestation.mutate({ orderId: selectedOrder.id, decision: adminDecision });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Chargement des contestations...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Contestations en attente ({contestedOrders?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!contestedOrders || contestedOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucune contestation en attente
            </p>
          ) : (
            <div className="space-y-4">
              {contestedOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">#{order.id.slice(0, 8)}</h4>
                      <p className="text-sm text-gray-600">{order.offer_title}</p>
                      <p className="text-sm text-gray-500">
                        {order.date_contestation ? new Date(order.date_contestation).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800">
                      En contestation
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <strong>Influenceur:</strong> {order.influencer?.first_name} {order.influencer?.last_name}
                      <br />
                      <span className="text-gray-500">{order.influencer?.email}</span>
                    </div>
                    <div>
                      <strong>Commerçant:</strong> {order.merchant?.company_name || `${order.merchant?.first_name} ${order.merchant?.last_name}`}
                      <br />
                      <span className="text-gray-500">{order.merchant?.email}</span>
                    </div>
                  </div>

                  {order.preuve_influenceur && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                      <strong className="text-sm">Preuve/Explication de l'influenceur:</strong>
                      <p className="text-sm mt-1">{order.preuve_influenceur}</p>
                    </div>
                  )}

                  <Button
                    onClick={() => setSelectedOrder(order)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Traiter cette contestation
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de traitement */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Traiter la contestation #{selectedOrder.id.slice(0, 8)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Service:</strong> {selectedOrder.offer_title}
                  <br />
                  <strong>Montant:</strong> {selectedOrder.total_amount}€
                  <br />
                  <strong>Contestée le:</strong> {new Date(selectedOrder.date_contestation).toLocaleDateString()}
                </div>
                <div>
                  <strong>Influenceur:</strong> {selectedOrder.influencer?.first_name} {selectedOrder.influencer?.last_name}
                  <br />
                  <strong>Commerçant:</strong> {selectedOrder.merchant?.company_name || `${selectedOrder.merchant?.first_name} ${selectedOrder.merchant?.last_name}`}
                </div>
              </div>

              {selectedOrder.preuve_influenceur && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <strong>Preuve/Explication de l'influenceur:</strong>
                  <p className="mt-2">{selectedOrder.preuve_influenceur}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Votre décision administrative:
                </label>
                <Textarea
                  value={adminDecision}
                  onChange={(e) => setAdminDecision(e.target.value)}
                  placeholder="Expliquez votre décision..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleValidate}
                  disabled={validateContestation.isPending || !adminDecision.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {validateContestation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Valider la contestation
                </Button>
                <Button
                  onClick={handleRefuse}
                  disabled={refuseContestation.isPending || !adminDecision.trim()}
                  variant="destructive"
                  className="flex-1"
                >
                  {refuseContestation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Refuser la contestation
                </Button>
              </div>

              <Button
                onClick={() => {
                  setSelectedOrder(null);
                  setAdminDecision('');
                }}
                variant="outline"
                className="w-full"
              >
                Fermer
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrderContestationManagement;