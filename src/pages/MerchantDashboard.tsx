
import { useMemo } from "react";
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

const MerchantDashboard = () => {
  const { toast } = useToast();
  const { profile, user, loading: authLoading, refetchUser, updateProfile } = useAuth();
  const unreadCount = useUnreadMessagesCount();
  const { orders, isLoading: ordersLoading } = useOrders('commercant');
  const { favorites, isLoading: favoritesLoading } = useFavorites();

  const handleSaveProfile = async (updatedUser: any) => {
    try {
      const updateData = {
        first_name: updatedUser.firstName,
        last_name: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        city: updatedUser.city,
        bio: updatedUser.bio,
        avatar_url: updatedUser.avatar,
        company_name: updatedUser.companyName,
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
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du profil",
        variant: "destructive"
      });
    }
  };

  // Memoize stats calculation to avoid recalculation on every render
  const stats = useMemo(() => ({
    totalOrders: orders?.length || 0,
    activeOrders: orders?.filter(order => ['en_cours', 'delivered', 'payment_authorized'].includes(order.status)).length || 0,
    completedOrders: orders?.filter(order => ['completed', 'terminée'].includes(order.status)).length || 0,
    totalSpent: orders?.filter(order => ['completed', 'terminée'].includes(order.status)).reduce((sum, order) => sum + Number(order.total_amount), 0) || 0,
    favoriteInfluencers: favorites?.length || 0,
    newMessages: unreadCount,
  }), [orders, favorites, unreadCount]);

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
};

export default MerchantDashboard;
