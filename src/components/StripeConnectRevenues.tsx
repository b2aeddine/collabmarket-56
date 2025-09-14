import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Euro, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Transfer {
  id: string;
  order_id: string;
  amount: number;
  platform_fee: number;
  influencer_amount: number;
  status: string;
  created_at: string;
  transferred_at: string | null;
  orders: {
    profiles: {
      first_name: string;
      last_name: string;
    };
  };
}

const StripeConnectRevenues = () => {
  const { user } = useAuth();

  // Fetch transfers data
  const { data: transfers, isLoading } = useQuery({
    queryKey: ['stripe-transfers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('stripe_transfers')
        .select(`
          *,
          orders!inner(
            profiles!orders_merchant_id_fkey(
              first_name,
              last_name
            )
          )
        `)
        .eq('influencer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Transfer[];
    },
    enabled: !!user?.id,
  });

  // Fetch pending orders (waiting for payment capture)
  const { data: pendingOrders } = useQuery({
    queryKey: ['pending-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_merchant_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq('influencer_id', user.id)
        .eq('payment_captured', false)
        .neq('status', 'annulée')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Reçu
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Calculate totals
  const totalReceived = transfers?.reduce((sum, transfer) => 
    transfer.status === 'completed' ? sum + (transfer.influencer_amount / 100) : sum, 0) || 0;
  
  const totalPending = pendingOrders?.reduce((sum, order) => 
    sum + (order.net_amount || 0), 0) || 0;

  if (isLoading) {
    return (
      <Card className="shadow-xl border-0">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2">Chargement des revenus...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total reçu</p>
                <p className="text-3xl font-bold text-green-600">
                  {totalReceived.toFixed(2)}€
                </p>
              </div>
              <Euro className="w-8 h-8 text-green-600/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {totalPending.toFixed(2)}€
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      {pendingOrders && pendingOrders.length > 0 && (
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              Paiements en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{order.net_amount}€</p>
                    <p className="text-sm text-gray-600">
                      Commande #{order.id.slice(0, 8)}...
                    </p>
                    <p className="text-sm text-gray-600">
                      Client: {order.profiles?.first_name} {order.profiles?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(order.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Clock className="w-3 h-3 mr-1" />
                      Confirmation requise
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      En attente de la confirmation du commerçant
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transfer History */}
      <Card className="shadow-xl border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Historique des paiements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!transfers || transfers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucun paiement reçu</p>
            ) : (
              transfers.map((transfer) => (
                <div key={transfer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{(transfer.influencer_amount / 100).toFixed(2)}€</p>
                    <p className="text-sm text-gray-600">
                      Commande #{transfer.order_id.slice(0, 8)}...
                    </p>
                    <p className="text-sm text-gray-600">
                      Client: {transfer.orders?.profiles?.first_name} {transfer.orders?.profiles?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(transfer.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(transfer.status)}
                    <p className="text-sm text-gray-600 mt-1">
                      Total: {(transfer.amount / 100).toFixed(2)}€
                    </p>
                    <p className="text-xs text-gray-500">
                      Commission: {(transfer.platform_fee / 100).toFixed(2)}€
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StripeConnectRevenues;