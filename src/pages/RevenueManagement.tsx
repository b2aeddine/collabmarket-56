
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import WithdrawalModal from "@/components/WithdrawalModal";
import BankAccountModal from "@/components/BankAccountModal";
import { useAuth } from "@/hooks/useAuth";
import { useInfluencerRevenues } from "@/hooks/useInfluencerRevenues";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import StripeConnectRevenues from "@/components/StripeConnectRevenues";
import StripeConnectOnboarding from "@/components/StripeConnectOnboarding";
import { Euro, TrendingUp, Clock, CheckCircle, AlertCircle, CreditCard, Download, Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const RevenueManagement = () => {
  const { user } = useAuth();
  const { balance, revenues, withdrawalRequests, isLoading } = useInfluencerRevenues();
  const { bankAccounts, addBankAccount } = useBankAccounts();
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);

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
  const totalWithdrawn = withdrawalRequests?.filter(w => w.status === 'paid').reduce((sum, w) => sum + Number(w.amount), 0) || 0;

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Configuration Stripe Connect */}
            <StripeConnectOnboarding />

            {/* Revenus Stripe Connect */}
            <div className="lg:col-span-1">
              <StripeConnectRevenues />
            </div>
          </div>

          {/* Historique des revenus */}
          <Card className="border-0 shadow-lg mt-6 sm:mt-8">
            <CardHeader>
              <CardTitle>Historique des revenus</CardTitle>
            </CardHeader>
            <CardContent>
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
    </div>
  );
};

export default RevenueManagement;
