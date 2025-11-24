
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import WithdrawalModal from "@/components/WithdrawalModal";
import BankAccountModal from "@/components/BankAccountModal";
import EditStripeAccountModal from "@/components/EditStripeAccountModal";
import { RevenueSystemAlert } from "@/components/RevenueSystemAlert";
import { useAuth } from "@/hooks/useAuth";
import { useInfluencerRevenues } from "@/hooks/useInfluencerRevenues";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { Revenue, WithdrawalRequest } from "@/types";
import StripeConnectRevenues from "@/components/StripeConnectRevenues";
import StripeConnectOnboarding from "@/components/StripeConnectOnboarding";
import { Euro, TrendingUp, Clock, CheckCircle, AlertCircle, CreditCard, Download, Edit, Wallet, History } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const RevenueManagement = () => {
  const { user } = useAuth();
  const { balance, revenues, withdrawalRequests, isLoading } = useInfluencerRevenues();
  const { bankAccounts } = useBankAccounts();
  const { accountStatus } = useStripeConnect();
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [isEditBankModalOpen, setIsEditBankModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Disponible</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'paid':
        return <Badge className="bg-blue-100 text-blue-800">Payé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getWithdrawalStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800"><TrendingUp className="w-3 h-3 mr-1" />En cours</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Terminé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Rejeté</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalEarned = revenues?.reduce((sum, revenue) => sum + Number(revenue.net_amount), 0) || 0;
  const totalWithdrawn = withdrawalRequests?.filter(w => w.status === 'completed').reduce((sum, w) => sum + Number(w.amount), 0) || 0;
  
  // Statistiques pour les onglets
  const revenueStats = {
    available: revenues?.filter(r => r.status === 'available').length || 0,
    pending: revenues?.filter(r => r.status === 'pending').length || 0,
    withdrawn: revenues?.filter(r => r.status === 'withdrawn').length || 0,
  };
  
  const withdrawalStats = {
    pending: withdrawalRequests?.filter(w => w.status === 'pending').length || 0,
    processing: withdrawalRequests?.filter(w => w.status === 'processing').length || 0,
    completed: withdrawalRequests?.filter(w => w.status === 'completed').length || 0,
    rejected: withdrawalRequests?.filter(w => w.status === 'rejected').length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
      <Header />
      
      <div className="py-4 sm:py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* En-tête */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
              Gestion des revenus
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Gérez vos revenus et effectuez vos retraits
            </p>
          </div>

          {/* Alerte système de revenus */}
          <div className="mb-6">
            <RevenueSystemAlert />
          </div>

          {/* Statistiques principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Solde disponible</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">
                      {isLoading ? "..." : `${balance?.toFixed(2) || 0}€`}
                    </p>
                  </div>
                  <Euro className="w-8 h-8 text-green-600/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total gagné</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                      {isLoading ? "..." : `${totalEarned.toFixed(2)}€`}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total retiré</p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                      {isLoading ? "..." : `${totalWithdrawn.toFixed(2)}€`}
                    </p>
                  </div>
                  <Download className="w-8 h-8 text-purple-600/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Comptes bancaires</p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                      {bankAccounts?.length || 0}
                    </p>
                  </div>
                  <CreditCard className="w-8 h-8 text-orange-600/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal avec onglets */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Onglets mobile */}
                <div className="sm:hidden border-b">
                  <TabsList className="h-auto p-2 grid grid-cols-2 gap-2 w-full">
                    <TabsTrigger value="overview" className="text-xs">
                      Vue d'ensemble
                    </TabsTrigger>
                    <TabsTrigger value="withdrawals" className="text-xs">
                      Retraits
                    </TabsTrigger>
                  </TabsList>
                  <TabsList className="h-auto p-2 grid grid-cols-2 gap-2 w-full">
                    <TabsTrigger value="revenues" className="text-xs">
                      Revenus
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-xs">
                      Historique
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                {/* Onglets desktop */}
                <div className="hidden sm:block border-b">
                  <TabsList className="grid w-full grid-cols-4 p-1">
                    <TabsTrigger value="overview" className="text-sm">
                      Vue d'ensemble
                    </TabsTrigger>
                    <TabsTrigger value="withdrawals" className="text-sm">
                      Retraits
                    </TabsTrigger>
                    <TabsTrigger value="revenues" className="text-sm">
                      Revenus ({revenueStats.available + revenueStats.pending + revenueStats.withdrawn})
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-sm">
                      Historique
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Contenu des onglets */}
                <TabsContent value="overview" className="p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gestion des retraits et comptes bancaires */}
                    <Card className="border shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Wallet className="w-5 h-5" />
                          Gestion des retraits
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {user?.stripe_connect_status === 'complete' && accountStatus?.hasExternalAccount ? (
                          <>
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                              <div>
                                <p className="font-medium text-green-800">Compte bancaire configuré</p>
                                <p className="text-sm text-green-600">
                                  **** **** {accountStatus.externalAccountLast4} ({accountStatus.externalAccountBankName})
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditBankModalOpen(true)}
                                className="text-green-700 border-green-300 hover:bg-green-100"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Modifier
                              </Button>
                            </div>
                            
                            <Button
                              onClick={() => setIsWithdrawalModalOpen(true)}
                              disabled={!balance || balance <= 0}
                              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Demander un retrait ({balance?.toFixed(2) || 0}€)
                            </Button>
                          </>
                        ) : (
                          <StripeConnectOnboarding />
                        )}
                      </CardContent>
                    </Card>

                    {/* Revenus Stripe Connect */}
                    <StripeConnectRevenues />
                  </div>
                </TabsContent>

                <TabsContent value="withdrawals" className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Demandes de retrait</h3>
                        <p className="text-sm text-gray-600">Gérez vos demandes de retrait</p>
                      </div>
                      <Button
                        onClick={() => setIsWithdrawalModalOpen(true)}
                        disabled={!balance || balance <= 0 || user?.stripe_connect_status !== 'complete'}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Nouveau retrait
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <Card className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">{withdrawalStats.pending}</p>
                            <p className="text-sm text-gray-600">En attente</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{withdrawalStats.processing}</p>
                            <p className="text-sm text-gray-600">En cours</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{withdrawalStats.completed}</p>
                            <p className="text-sm text-gray-600">Terminés</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">{withdrawalStats.rejected}</p>
                            <p className="text-sm text-gray-600">Rejetés</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      {isLoading ? (
                        <p className="text-center text-gray-500 py-8">Chargement...</p>
                      ) : !withdrawalRequests || withdrawalRequests.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Aucune demande de retrait</p>
                      ) : (
                        withdrawalRequests.map((withdrawal) => (
                          <div key={withdrawal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-semibold text-lg">{withdrawal.amount}€</p>
                              <p className="text-sm text-gray-600">
                                {format(new Date(withdrawal.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                              </p>
                            </div>
                            {getWithdrawalStatusBadge(withdrawal.status)}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="revenues" className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">Historique des revenus</h3>
                      <p className="text-sm text-gray-600">Tous vos revenus détaillés</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <Card className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{revenueStats.available}</p>
                            <p className="text-sm text-gray-600">Disponibles</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">{revenueStats.pending}</p>
                            <p className="text-sm text-gray-600">En attente</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">{revenueStats.withdrawn}</p>
                            <p className="text-sm text-gray-600">Retirés</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      {isLoading ? (
                        <p className="text-center text-gray-500 py-8">Chargement...</p>
                      ) : !revenues || revenues.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Aucun revenu enregistré</p>
                      ) : (
                        revenues.map((revenue) => (
                          <div key={revenue.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <p className="font-semibold text-lg">{revenue.net_amount}€</p>
                                {getStatusBadge(revenue.status)}
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                Commande #{revenue.order_id?.slice(0, 8)}...
                              </p>
                              <p className="text-sm text-gray-600">
                                {format(new Date(revenue.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                              </p>
                              {revenue.orders && revenue.orders.profiles && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Client: {revenue.orders.profiles.first_name} {revenue.orders.profiles.last_name}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Montant brut: {revenue.amount}€</p>
                              <p className="text-sm text-gray-600">Commission: {revenue.commission}€</p>
                              <p className="text-sm font-semibold text-green-600">Net: {revenue.net_amount}€</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <History className="w-5 h-5" />
                        Historique complet
                      </h3>
                      <p className="text-sm text-gray-600">Vue chronologique de tous vos revenus et retraits</p>
                    </div>

                    <div className="space-y-4">
                      {/* Fusion des revenus et retraits triés par date */}
                      {(() => {
                        type Transaction = (Revenue & { type: 'revenue' }) | (WithdrawalRequest & { type: 'withdrawal' });
                        const allTransactions: Transaction[] = [
                          ...(revenues || []).map(r => ({ ...r, type: 'revenue' as const })),
                          ...(withdrawalRequests || []).map(w => ({ ...w, type: 'withdrawal' as const }))
                        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                        return allTransactions.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">Aucune transaction</p>
                        ) : (
                          allTransactions.map((transaction, index) => (
                            <div key={`${transaction.type}-${transaction.id}-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <p className="font-semibold text-lg">
                                    {transaction.type === 'revenue' ? '+' : '-'}
                                    {transaction.type === 'revenue' 
                                      ? transaction.net_amount 
                                      : transaction.amount
                                    }€
                                  </p>
                                  {transaction.type === 'revenue' ? (
                                    getStatusBadge(transaction.status)
                                  ) : (
                                    getWithdrawalStatusBadge(transaction.status)
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {transaction.type === 'revenue' ? 'Revenu' : 'Retrait'} - {format(new Date(transaction.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                                </p>
                                {transaction.type === 'revenue' && transaction.order_id && (
                                  <p className="text-xs text-gray-500">
                                    Commande #{transaction.order_id.slice(0, 8)}...
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        );
                      })()}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <WithdrawalModal 
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        availableBalance={balance || 0}
        bankAccounts={bankAccounts?.map(account => ({
          id: account.id,
          iban: account.iban,
          bic: account.bic,
          account_holder: account.account_holder,
          bank_name: account.bank_name,
          is_default: account.is_default,
          is_active: account.is_active,
          user_id: "",
          created_at: "",
          updated_at: ""
        })) || []}
      />
      
      <BankAccountModal 
        isOpen={isAddBankModalOpen}
        onClose={() => setIsAddBankModalOpen(false)}
      />
      
      <EditStripeAccountModal 
        isOpen={isEditBankModalOpen}
        onClose={() => setIsEditBankModalOpen(false)}
        currentAccount={accountStatus?.hasExternalAccount ? {
          iban: `FR76 **** **** **** ${accountStatus.externalAccountLast4}`,
          account_holder: "Compte Stripe",
          bank_name: accountStatus.externalAccountBankName || "",
        } : undefined}
      />
    </div>
  );
};

export default RevenueManagement;
