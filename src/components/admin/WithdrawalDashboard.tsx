import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Euro, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCcw,
  Eye
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { LoadingSpinner } from "@/components/common";

const WithdrawalDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("overview");

  // Fetch all withdrawals with user details
  const { data: withdrawals, isLoading, refetch } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('withdrawals')
        .select(`
          *,
          profiles:influencer_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Calculate stats
  const stats = withdrawals ? {
    totalWithdrawals: withdrawals.length,
    pendingAmount: withdrawals
      .filter(w => w.status === 'processing')
      .reduce((sum, w) => sum + Number(w.amount), 0),
    completedAmount: withdrawals
      .filter(w => w.status === 'completed')
      .reduce((sum, w) => sum + Number(w.amount), 0),
    failedCount: withdrawals.filter(w => w.status === 'failed').length,
  } : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'processing': return 'En cours';
      case 'failed': return 'Échoué';
      default: return 'Inconnu';
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Gestion des retraits</h2>
          <p className="text-gray-600 mt-1">
            Suivi des retraits automatiques via Stripe Connect
          </p>
        </div>
        <Button 
          onClick={() => refetch()}
          variant="outline"
          size="sm"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="withdrawals">Retraits</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total retraits</p>
                    <p className="text-2xl font-bold">{stats?.totalWithdrawals || 0}</p>
                  </div>
                  <Euro className="h-8 w-8 text-gray-400 ml-auto" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600">En cours</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats?.pendingAmount.toFixed(2) || 0}€
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-400 ml-auto" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Terminés</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats?.completedAmount.toFixed(2) || 0}€
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400 ml-auto" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Échecs</p>
                    <p className="text-2xl font-bold text-red-600">{stats?.failedCount || 0}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-400 ml-auto" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Withdrawals */}
          <Card>
            <CardHeader>
              <CardTitle>Retraits récents</CardTitle>
              <CardDescription>
                Les 10 derniers retraits effectués
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Influenceur</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals?.slice(0, 10).map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {withdrawal.profiles?.first_name} {withdrawal.profiles?.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{withdrawal.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {Number(withdrawal.amount).toFixed(2)}€
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(withdrawal.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(withdrawal.status)}
                          {getStatusLabel(withdrawal.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {format(new Date(withdrawal.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tous les retraits</CardTitle>
              <CardDescription>
                Liste complète des retraits avec statut Stripe en temps réel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Influenceur</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Compte bancaire</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date demande</TableHead>
                    <TableHead>Date traitement</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals?.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {withdrawal.profiles?.first_name} {withdrawal.profiles?.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{withdrawal.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {Number(withdrawal.amount).toFixed(2)}€
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">Stripe Connect</p>
                          <p className="text-xs text-gray-600">Compte configuré</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(withdrawal.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(withdrawal.status)}
                          {getStatusLabel(withdrawal.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {format(new Date(withdrawal.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {withdrawal.processed_at 
                          ? format(new Date(withdrawal.processed_at), 'dd MMM yyyy HH:mm', { locale: fr })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytiques des retraits</CardTitle>
              <CardDescription>
                Données et tendances des retraits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <TrendingDown className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Analytiques en cours de développement</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WithdrawalDashboard;