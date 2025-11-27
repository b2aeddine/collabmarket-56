
import { useMemo, useCallback, memo } from "react";
import Header from "@/components/Header";
import ProfileCard from "@/components/merchant/ProfileCard";
import StatsGrid from "@/components/merchant/StatsGrid";
import RecentOrdersCard from "@/components/merchant/RecentOrdersCard";
import FavoriteInfluencersCard from "@/components/merchant/FavoriteInfluencersCard";
import { PaymentStatusAlert } from "@/components/PaymentStatusAlert";
import { ProfileSkeleton } from "@/components/common/ProfileSkeleton";
import { StatsSkeleton } from "@/components/common/StatsSkeleton";
import { useToast } from "@/hooks/use-toast";
import { useUnreadMessagesCount } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { useFavorites } from "@/hooks/useFavorites";

const MerchantDashboard = memo(() => {
  const { toast } = useToast();
  const { profile, user, loading: authLoading, refetchUser, updateProfile } = useAuth();
  const unreadCount = useUnreadMessagesCount();
  const { orders, isLoading: ordersLoading } = useOrders('commercant');
  const { favorites, isLoading: favoritesLoading } = useFavorites();

  const handleSaveProfile = useCallback(async (updatedUser: { firstName?: string; lastName?: string; email?: string; phone?: string; bio?: string; city?: string; avatar?: string }) => {
    try {
      const updateData = {
        first_name: updatedUser.firstName,
        last_name: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        city: updatedUser.city,
        bio: updatedUser.bio,
        avatar_url: updatedUser.avatar,
      };

      const { error } = await updateProfile(updateData);

      if (error) {
        toast({
          title: "Erreur",
          description: "Erreur lors de la mise à jour du profil",
          variant: "destructive"
        });
        return;
      }

      await refetchUser();
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });
    } catch (_error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du profil",
        variant: "destructive"
      });
    }
  }, [updateProfile, refetchUser, toast]);

  const stats = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        totalOrders: 0,
        activeOrders: 0,
        completedOrders: 0,
        totalSpent: 0,
        favoriteInfluencers: 0,
        newMessages: 0,
      };
    }

    // Filter completed orders
    const completedOrders = orders.filter(order =>
      ['completed', 'terminée', 'terminee'].includes(order.status.toLowerCase())
    );

    // Calculate total spent for completed orders
    const capturedOrders = orders.filter(order =>
      ['completed', 'terminée', 'terminee'].includes(order.status.toLowerCase())
    );

    const totalSpent = capturedOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

    return {
      totalOrders: orders.length,
      activeOrders: orders.filter(order =>
        ['in_progress', 'delivered', 'pending', 'accepted', 'disputed'].includes(order.status.toLowerCase())
      ).length,
      completedOrders: completedOrders.length,
      totalSpent,
      favoriteInfluencers: favorites?.length || 0,
      newMessages: unreadCount,
    };
  }, [orders, favorites, unreadCount]);

  // Show loading state while user data is being fetched
  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
        <Header />
        <div className="py-6 sm:py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-1">
                <ProfileSkeleton />
              </div>
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <StatsSkeleton />
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <RecentOrdersCard orders={[]} isLoading={true} />
                  <FavoriteInfluencersCard favorites={[]} isLoading={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
      <Header />

      <div className="py-6 sm:py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Profile Sidebar */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
                <ProfileCard
                  profile={profile}
                  user={user}
                  onSaveProfile={handleSaveProfile}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <PaymentStatusAlert />

              <StatsGrid stats={stats} />

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <RecentOrdersCard
                  orders={orders}
                  isLoading={ordersLoading}
                />
                <FavoriteInfluencersCard
                  favorites={favorites}
                  isLoading={favoritesLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

MerchantDashboard.displayName = 'MerchantDashboard';

export default MerchantDashboard;
