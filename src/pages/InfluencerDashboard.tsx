import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";
import AddOfferModal from "@/components/AddOfferModal";
import AddSocialNetworkModal from "@/components/AddSocialNetworkModal";
import EditProfileModal from "@/components/EditProfileModal";
import ProfileShareButton from "@/components/ProfileShareButton";
import ProfileSettingsModal from "@/components/ProfileSettingsModal";
import { TrendingUp, Eye, ShoppingBag, Instagram, MessageCircle, Camera, Zap, Megaphone, Euro, MapPin, Settings } from "lucide-react";

import { SocialNetwork } from "@/types";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { useOffers, useCreateOffer, useUpdateOffer, useDeleteOffer } from "@/hooks/useOffers";
import { useSocialLinks, useUpdateSocialLink, useDeleteSocialLink } from "@/hooks/useSocialLinks";
import { useProfileCategories } from "@/hooks/useCategories";
import { useInfluencerRevenues } from "@/hooks/useInfluencerRevenues";
import { useUnreadMessagesCount } from "@/hooks/useMessages";
import { toast } from "sonner";
import AccountSetupSection from "@/components/AccountSetupSection";
import { DashboardSkeleton } from "@/components/common/DashboardSkeleton";
import { OffersSkeleton } from "@/components/common/OffersSkeleton";
import { SocialNetworksSkeleton } from "@/components/common/SocialNetworksSkeleton";
import InfluencerOnboardingModal from "@/components/InfluencerOnboardingModal";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { SocialNetworksCarousel } from "@/components/common/SocialNetworksCarousel";
import { OffersCarousel } from "@/components/common/OffersCarousel";
import { PortfolioManagement } from "@/components/PortfolioManagement";

const InfluencerDashboard = () => {
  const { user, updateProfile, refetchUser, loading: authLoading } = useAuth();
  const { orders } = useOrders('influenceur');
  const { offers, isLoading: offersLoading } = useOffers(user?.id);
  const { socialLinks, isLoading: socialLinksLoading } = useSocialLinks(user?.id);
  const { profileCategories, isLoading: categoriesLoading } = useProfileCategories(user?.id);
  const { revenues } = useInfluencerRevenues();
  const unreadMessagesCount = useUnreadMessagesCount();
  const { accountStatus } = useStripeConnect();
  const [searchParams] = useSearchParams();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  // Vérifier si l'onboarding Stripe est nécessaire
  useEffect(() => {
    const onboardingParam = searchParams.get('onboarding');
    const skipped = localStorage.getItem('stripe_onboarding_skipped');
    
    if (onboardingParam === 'stripe') {
      setShowOnboardingModal(true);
    } else if (!skipped && accountStatus !== undefined) {
      // Vérifier si le compte Stripe Connect est configuré
      const needsOnboarding = !accountStatus?.onboardingCompleted || !accountStatus?.payoutsEnabled;
      if (needsOnboarding) {
        setShowOnboardingModal(true);
      }
    }
  }, [searchParams, accountStatus]);
  
  const createOfferMutation = useCreateOffer();
  const updateOfferMutation = useUpdateOffer();
  const deleteOfferMutation = useDeleteOffer();
  const createSocialLinkMutation = useCreateSocialLink();
  const updateSocialLinkMutation = useUpdateSocialLink();
  const deleteSocialLinkMutation = useDeleteSocialLink();

  // Memoize stats to prevent unnecessary recalculations
  const stats = useMemo(() => {
    if (!user?.id) return {
      views: 0,
      orders: 0,
      revenue: 0,
      engagement: 0,
      newMessages: 0,
    };

    // No need to filter orders again - useOrders already filters by influencer_id
    const totalRevenue = revenues?.reduce((sum, revenue) => sum + Number(revenue.net_amount || 0), 0) || 0;

    return {
      views: user.profile_views || 0,
      orders: orders?.length || 0,
      revenue: totalRevenue,
      engagement: 4.2,
      newMessages: unreadMessagesCount,
    };
  }, [user, orders, revenues, unreadMessagesCount]);

  const [profileViews] = useState(user?.profile_views || 0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Memoize social networks to prevent unnecessary re-renders
  const socialNetworks = useMemo(() => {
    return socialLinks?.map(link => ({
      id: link.id,
      platform: link.platform as SocialNetwork['platform'],
      username: link.username,
      profile_url: link.profile_url,
      followers: link.followers || 0,
      engagement_rate: link.engagement_rate || 0,
      is_connected: link.is_connected || false,
      is_active: link.is_active || true,
      user_id: link.user_id,
      created_at: link.created_at,
    })) || [];
  }, [socialLinks]);

  const _getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram": return <Instagram className="w-5 h-5" />;
      case "tiktok": return <span className="text-lg">🎵</span>;
      case "youtube": return <span className="text-lg">📺</span>;
      case "x": return <span className="text-lg">🐦</span>;
      case "snapchat": return (
        <div className="w-5 h-5 bg-yellow-400 rounded-lg flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.206 2.024c-1.018 0-6.683.585-6.683 7.728 0 1.374.336 2.591.611 3.415-.317.132-.675.278-1.026.423-1.322.546-1.93 1.004-1.93 1.65 0 .697.644 1.278 1.415 1.278.212 0 .433-.042.664-.126.87-.322 1.576-.48 2.098-.48.284 0 .474.066.632.169-.349.679-1.09 2.148-3.167 2.802-.133.042-.197.13-.197.245 0 .228.28.413.56.413.076 0 .152-.013.226-.04 2.638-.914 3.694-2.871 4.094-3.679.136.007.274.011.414.011.138 0 .276-.004.412-.011.4.808 1.456 2.765 4.094 3.679.074.027.15.04.226.04.28 0 .56-.185.56-.413 0-.115-.064-.203-.197-.245-2.077-.654-2.818-2.123-3.167-2.802.158-.103.348-.169.632-.169.522 0 1.228.158 2.098.48.231.084.452.126.664.126.771 0 1.415-.581 1.415-1.278 0-.646-.608-1.104-1.93-1.65-.351-.145-.709-.291-1.026-.423.275-.824.611-2.041.611-3.415 0-7.143-5.665-7.728-6.683-7.728l-.081.001-.081-.001z"/>
          </svg>
        </div>
      );
      default: return <span className="text-lg">🔗</span>;
    }
  };

  const _getOfferTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "publication": case "post": return <Camera className="w-4 h-4" />;
      case "story": return <Zap className="w-4 h-4" />;
      case "reel": case "vidéo": return <Play className="w-4 h-4" />;
      case "sponsoring": case "package": return <Megaphone className="w-4 h-4" />;
      default: return <Camera className="w-4 h-4" />;
    }
  };

  const handleAddOffer = async (newOffer: { type: string; price: number; platform: string; description?: string; deliveryTime?: string }) => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour créer une offre");
      return;
    }

    try {
      // Validation des champs obligatoires
      if (!newOffer.type || !newOffer.price || !newOffer.platform) {
      toast.error('Tous les champs obligatoires doivent être remplis (plateforme, type, prix)');
        return;
      }

      await createOfferMutation.mutateAsync({
        influencer_id: user.id,
        title: `${newOffer.platform} - ${newOffer.type}`, // Inclure la plateforme dans le titre
        description: newOffer.description || `Offre ${newOffer.type} sur ${newOffer.platform}`,
        price: Number(newOffer.price),
        delivery_time: newOffer.deliveryTime || "2-3 jours",
        is_active: true,
        is_popular: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      toast.success("Offre créée avec succès !");
    } catch (_error) {
      toast.error("Erreur lors de la création de l'offre");
    }
  };

  const _handleToggleNetwork = async (networkId: string) => {
    const network = socialNetworks.find(n => n.id === networkId);
    if (!network) return;

    const newActiveState = !network.is_active;

    try {
      await updateSocialLinkMutation.mutateAsync({
        socialLinkId: networkId,
        data: {
          is_active: newActiveState,
        }
      });
      
      toast.success(`Réseau social ${newActiveState ? 'activé' : 'désactivé'} avec succès !`);
    } catch (_error) {
      toast.error("Erreur lors de la modification du réseau social");
    }
  };

  const handleAddNetwork = async (newNetwork: Omit<SocialNetwork, 'id' | 'created_at'>) => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour ajouter un réseau social");
      return;
    }

    try {
      await createSocialLinkMutation.mutateAsync({
        platform: newNetwork.platform,
        username: newNetwork.username,
        profile_url: newNetwork.profile_url,
        followers: newNetwork.followers || 0,
        engagement_rate: newNetwork.engagement_rate || 0,
      });
      toast.success("Réseau social ajouté avec succès !");
    } catch (_error) {
      toast.error("Erreur lors de l'ajout du réseau social");
    }
  };

  const handleUpdateNetwork = async (updatedNetwork: SocialNetwork) => {
    try {
      // Validation du lien avant mise à jour
      if (updatedNetwork.profile_url && !updatedNetwork.profile_url.match(/^https?:\/\//)) {
        toast.error("Le lien doit commencer par http:// ou https://");
        return;
      }

      await updateSocialLinkMutation.mutateAsync({
        socialLinkId: updatedNetwork.id,
        data: {
          platform: updatedNetwork.platform,
          username: updatedNetwork.username,
          profile_url: updatedNetwork.profile_url,
          followers: updatedNetwork.followers,
          engagement_rate: updatedNetwork.engagement_rate,
          is_active: updatedNetwork.is_active,
        }
      });
      toast.success("Réseau social mis à jour avec succès !");
    } catch (_error) {
      toast.error("Erreur lors de la mise à jour du réseau social");
    }
  };

  const handleDeleteNetwork = async (networkId: string) => {
    try {
      await deleteSocialLinkMutation.mutateAsync(networkId);
      toast.success("Réseau social supprimé avec succès !");
    } catch (_error) {
      toast.error("Erreur lors de la suppression du réseau social");
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    try {
      toast.loading("Suppression en cours...", { id: 'delete-offer' });
      await deleteOfferMutation.mutateAsync(offerId);
      toast.success("Offre supprimée avec succès !", { id: 'delete-offer' });
    } catch (_error: unknown) {
      const errorMessage = error?.message || "Erreur lors de la suppression de l'offre";
      toast.error(errorMessage, { id: 'delete-offer' });
    }
  };

  const handleSaveProfile = async (updatedUser: { firstName?: string; lastName?: string; email?: string; phone?: string; city?: string; bio?: string; avatar?: string; companyName?: string }) => {
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
        toast.error("Erreur lors de la mise à jour du profil");
        return;
      }

      await refetchUser();
      toast.success("Profil mis à jour avec succès !");
    } catch (_error) {
      toast.error("Erreur lors de la mise à jour du profil");
    }
  };

  const handleSaveOffer = async (updatedOffer: { id: string; type: string; platform: string; price: number; deliveryTime: string; active: boolean }) => {
    try {
      await updateOfferMutation.mutateAsync({
        offerId: updatedOffer.id,
        data: {
          title: updatedOffer.type,
          description: updatedOffer.description,
          price: Number(updatedOffer.price),
          delivery_time: updatedOffer.deliveryTime,
          is_active: updatedOffer.active,
          updated_at: new Date().toISOString(),
        }
      });
      toast.success("Offre mise à jour avec succès !");
    } catch (_error) {
      toast.error("Erreur lors de la mise à jour de l'offre");
    }
  };

  const handleToggleOffer = async (offerId: string) => {
    const offer = offers?.find(o => o.id === offerId);
    if (!offer) return;

    try {
      await updateOfferMutation.mutateAsync({
        offerId: offerId,
        data: {
          is_active: !offer.is_active,
          updated_at: new Date().toISOString(),
        }
      });
      toast.success(`Offre ${offer.is_active ? 'désactivée' : 'activée'} avec succès !`);
    } catch (_error) {
      toast.error("Erreur lors de la modification de l'offre");
    }
  };

  const handleProfileUpdate = () => {
    // Rafraîchir les données du profil
    window.location.reload();
  };

  const userOffers = offers?.map(offer => {
    // Extraire la plateforme du titre (format: "platform - type")
    const titleParts = offer.title?.split(' - ') || [];
    const platform = titleParts[0]?.toLowerCase() || "instagram";
    const type = titleParts.slice(1).join(' - ') || offer.title;
    
    return {
      id: offer.id,
      platform: platform,
      type: type,
      description: offer.description || '',
      price: Number(offer.price),
      active: offer.is_active || false,
      deliveryTime: offer.delivery_time || "2-3 jours",
    };
  }) || [];

  const userForModal = user ? {
    id: user.id,
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    email: user.email,
    phone: user.phone || '',
    city: user.city || '',
    gender: '',
    avatar: user.avatar_url,
    bio: user.bio,
  } : null;

  // Show loading state while initial data is being fetched
  if (authLoading || !user) {
    return <DashboardSkeleton />;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
        <Header />
        
        <div className="py-6 sm:py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Profile Sidebar */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
                  <Card className="shadow-xl border-0">
                    <CardContent className="p-4 sm:p-6">
                      <div className="text-center mb-6">
                        <div className="relative inline-block">
                          <Avatar className="w-24 h-24 mx-auto mb-4">
                            <AvatarImage src={user?.avatar_url} alt={user?.first_name} />
                            <AvatarFallback className="text-2xl">
                              {user?.first_name?.[0]}{user?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          
                          {/* Bouton de partage à côté de la photo de profil */}
                          <div className="absolute -top-2 -right-2">
                            <ProfileShareButton
                              profileId={user?.id || ''}
                              customUsername={user?.custom_username || ''}
                              isPublic={user?.is_profile_public || false}
                            />
                          </div>
                        </div>
                        
                        <div className="mb-3 sm:mb-4">
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                            {categoriesLoading ? (
                              <Badge variant="secondary" className="text-xs">
                                Chargement des niches...
                              </Badge>
                            ) : profileCategories && profileCategories.length > 0 ? (
                              profileCategories.map((categoryItem: { id: string; categories?: { name: string } }) => (
                                <Badge 
                                  key={categoryItem.id} 
                                  className="bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs"
                                >
                                  {categoryItem.categories?.name || 'Catégorie inconnue'}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Aucune niche sélectionnée
                              </Badge>
                            )}
                          </div>

                          <h2 className="text-xl font-bold mb-2">{user?.first_name} {user?.last_name}</h2>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-600 mb-3">
                            <span className="text-sm">{user?.email}</span>
                            {user?.city && (
                              <div className="flex items-center justify-center sm:justify-start">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span className="text-sm">{user.city}</span>
                              </div>
                            )}
                          </div>

                          {user?.bio && (
                            <p className="text-gray-600 text-sm mb-3">{user.bio}</p>
                          )}

                        </div>

                        <div className="space-y-3">
                          <Button 
                            onClick={() => setIsEditModalOpen(true)}
                            variant="outline"
                            className="w-full"
                          >
                            <User className="w-4 h-4 mr-2" />
                            Modifier le profil
                          </Button>
                          
                          <Button 
                            onClick={() => setIsSettingsModalOpen(true)}
                            variant="outline"
                            className="w-full"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Paramètres de partage
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Account Setup Section */}
                  <AccountSetupSection />
                </div>
              </div>

              {/* Main content area */}
              <div className="lg:col-span-2">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-50 to-white">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Vues du profil</p>
                          <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-primary truncate">{profileViews.toLocaleString()}</p>
                        </div>
                        <Eye className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-primary/60 flex-shrink-0 ml-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Link to="/orders" className="block">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-white hover:shadow-xl transition-shadow cursor-pointer h-full">
                      <CardContent className="p-3 sm:p-4 lg:p-6 h-full">
                        <div className="flex items-center justify-between h-full">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Commandes</p>
                            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-secondary truncate">{stats.orders}</p>
                          </div>
                          <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-secondary/60 flex-shrink-0 ml-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link to="/revenue-management" className="block">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-white hover:shadow-xl transition-shadow cursor-pointer h-full">
                      <CardContent className="p-3 sm:p-4 lg:p-6 h-full">
                        <div className="flex items-center justify-between h-full">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Revenus totaux</p>
                            <p className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent truncate">{stats.revenue}€</p>
                          </div>
                          <Euro className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-accent/60 flex-shrink-0 ml-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link to="/messages" className="block">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-shadow cursor-pointer h-full">
                      <CardContent className="p-3 sm:p-4 lg:p-6 h-full">
                        <div className="flex items-center justify-between h-full">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Messages</p>
                            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-600 truncate">{stats.newMessages}</p>
                          </div>
                          <div className="relative flex-shrink-0 ml-2">
                            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600/60" />
                            {stats.newMessages > 0 && (
                              <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center p-0">
                                {stats.newMessages}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>

                {/* Offers Section */}
                <Card className="border-0 shadow-lg mb-6 sm:mb-8">
                  <CardHeader className="pb-3 sm:pb-6">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <CardTitle className="text-lg sm:text-xl">Mes offres</CardTitle>
                      <div className="w-full sm:w-auto">
                        <AddOfferModal onAddOffer={handleAddOffer} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {offersLoading ? (
                      <OffersSkeleton />
                    ) : (
                      <OffersCarousel 
                        offers={userOffers}
                        onToggleActive={handleToggleOffer}
                        onDelete={handleDeleteOffer}
                        onSave={handleSaveOffer}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Social Networks Section */}
                <Card className="border-0 shadow-lg mb-6 sm:mb-8">
                  <CardHeader className="pb-3 sm:pb-6">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <CardTitle className="text-lg sm:text-xl">Mes réseaux sociaux</CardTitle>
                      <div className="w-full sm:w-auto">
                        <AddSocialNetworkModal onAddNetwork={handleAddNetwork} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {socialLinksLoading ? (
                      <SocialNetworksSkeleton />
                    ) : (
                      <SocialNetworksCarousel 
                        networks={socialNetworks || []}
                        onToggleActive={(network) => handleUpdateNetwork({
                          ...network,
                          is_active: !network.is_active
                        } as SocialNetwork)}
                        onDelete={handleDeleteNetwork}
                        onUpdateNetwork={handleUpdateNetwork}
                        showActions={true}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Portfolio Section */}
                {user && <PortfolioManagement userId={user.id} />}
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {userForModal && (
          <EditProfileModal 
            user={userForModal} 
            onSave={handleSaveProfile} 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
          />
        )}
        <ProfileSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          profile={user}
          onProfileUpdate={handleProfileUpdate}
        />

        <InfluencerOnboardingModal
          isOpen={showOnboardingModal}
          onClose={() => setShowOnboardingModal(false)}
        />
      </div>
    </TooltipProvider>
  );
};

export default InfluencerDashboard;
