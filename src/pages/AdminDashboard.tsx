import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Users, MessageSquare, AlertTriangle, UserCheck, CreditCard } from "lucide-react";
import Header from "@/components/Header";
import { ContactMessagesSection } from "@/components/admin/ContactMessagesSection";
import { InfluencerManagementSection } from "@/components/admin/InfluencerManagementSection";
import WithdrawalManagementSection from "@/components/admin/WithdrawalManagementSection";
import ContestationsManagement from "@/components/admin/ContestationsManagement";
import OrderContestationManagement from "@/components/admin/OrderContestationManagement";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("stats");

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [usersResult, ordersResult, revenuesResult, contestationsResult] = await Promise.all([
        supabase.from('profiles').select('role', { count: 'exact' }),
        supabase.from('orders').select('total_amount', { count: 'exact' }),
        supabase.from('influencer_revenues').select('amount'),
        supabase.from('contestations').select('id', { count: 'exact' }).eq('statut', 'en_attente')
      ]);

      const influencers = usersResult.data?.filter(u => u.role === 'influenceur')?.length || 0;
      const merchants = usersResult.data?.filter(u => u.role === 'commercant')?.length || 0;
      const totalRevenue = revenuesResult.data?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

      return {
        totalUsers: usersResult.count || 0,
        totalInfluencers: influencers,
        totalMerchants: merchants,
        totalOrders: ordersResult.count || 0,
        totalRevenue,
        activeDisputes: contestationsResult.count || 0
      };
    },
  });

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
      <Header />
      
      <div className="container mx-auto py-6 sm:py-8 px-4">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Tableau de bord Administrateur</h1>
          <p className="text-sm sm:text-base text-gray-600">Gérez votre plateforme Collabmarket</p>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Utilisateurs totaux</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Influenceurs</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.totalInfluencers}</p>
                  </div>
                  <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Revenus générés</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.totalRevenue.toFixed(2)}€</p>
                  </div>
                  <BarChart className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Litiges actifs</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.activeDisputes}</p>
                  </div>
                  <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="stats" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <BarChart className="w-4 h-4" />
                <span className="hidden sm:inline">Stats</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="withdrawals" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Retraits</span>
                <span className="sm:hidden">Retraits</span>
              </TabsTrigger>
              <TabsTrigger value="disputes" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">Litiges</span>
                <span className="sm:hidden">Litiges</span>
              </TabsTrigger>
              <TabsTrigger value="order-disputes" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">Commandes</span>
                <span className="sm:hidden">Cmd</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Messages</span>
                <span className="sm:hidden">Msg</span>
              </TabsTrigger>
              <TabsTrigger value="influencers" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <UserCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Influenceurs</span>
                <span className="sm:hidden">Inf</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition des utilisateurs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Influenceurs</span>
                        <span className="font-semibold">{stats?.totalInfluencers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Commerçants</span>
                        <span className="font-semibold">{stats?.totalMerchants}</span>
                      </div>
                      <div className="flex justify-between items-center font-semibold">
                        <span>Total</span>
                        <span>{stats?.totalUsers}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Activité de la plateforme</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Commandes totales</span>
                        <span className="font-semibold">{stats?.totalOrders}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Revenus générés</span>
                        <span className="font-semibold">{stats?.totalRevenue.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Litiges actifs</span>
                        <span className="font-semibold text-red-600">{stats?.activeDisputes}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="withdrawals">
              <WithdrawalManagementSection />
            </TabsContent>

            <TabsContent value="disputes">
              <ContestationsManagement />
            </TabsContent>

            <TabsContent value="order-disputes">
              <OrderContestationManagement />
            </TabsContent>

            <TabsContent value="messages">
              <ContactMessagesSection />
            </TabsContent>

            <TabsContent value="influencers">
              <InfluencerManagementSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;