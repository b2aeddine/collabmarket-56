import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";
import SocialNetworkCard from "@/components/SocialNetworkCard";
import MessagingModal from "@/components/MessagingModal";
import ReviewsSection from "@/components/ReviewsSection";
import { getPlatformLogo } from "@/lib/platformLogos";
import AllServicesModal from "@/components/AllServicesModal";
import AllSocialNetworksModal from "@/components/AllSocialNetworksModal";
import { Users, Heart, Star, MapPin, MessageCircle, Eye, ArrowLeft } from "lucide-react";
import { useProfile, useIncrementProfileViews } from "@/hooks/useProfiles";
import { useReviews } from "@/hooks/useReviews";
import { InfluencerProfileSkeleton } from "@/components/common/InfluencerProfileSkeleton";
import { ServicesCarousel } from "@/components/common/ServicesCarousel";
import { SocialNetworksCarousel } from "@/components/common/SocialNetworksCarousel";
const InfluencerProfile = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  const [showAllNetworks, setShowAllNetworks] = useState(false);
  const {
    profile,
    isLoading,
    error
  } = useProfile(id || '');
  const {
    reviewStats
  } = useReviews(id || '');
  const incrementViews = useIncrementProfileViews();
  console.log('Profile data:', profile);
  console.log('Review stats:', reviewStats);

  // Incrémenter les vues du profil
  useEffect(() => {
    if (id && profile) {
      const hasViewedToday = localStorage.getItem(`profile_viewed_${id}_${new Date().toDateString()}`);
      if (!hasViewedToday) {
        incrementViews.mutate({
          profileId: id
        });
        localStorage.setItem(`profile_viewed_${id}_${new Date().toDateString()}`, "true");
      }
    }
  }, [id, profile, incrementViews]);
  if (isLoading) {
    return <InfluencerProfileSkeleton />;
  }
  if (error) {
    console.error('Profile error:', error);
    return <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              Erreur lors du chargement du profil.
            </div>
            <Button onClick={() => navigate('/catalog')} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour au catalogue
            </Button>
          </div>
        </div>
      </div>;
  }
  if (!profile) {
    return <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-gray-600 mb-4">
              Profil non trouvé.
            </div>
            <Button onClick={() => navigate('/catalog')} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour au catalogue
            </Button>
          </div>
        </div>
      </div>;
  }


  // Fonction pour déterminer la plateforme basée sur le titre de l'offre
  const getPlatformFromTitle = (title: string) => {
    const titleLower = title.toLowerCase();
    // Ordre important: vérifier les plateformes spécifiques d'abord
    if (titleLower.includes('tiktok')) {
      return 'tiktok';
    } else if (titleLower.includes('youtube')) {
      return 'youtube';
    } else if (titleLower.includes('snapchat')) {
      return 'snapchat';
    } else if (titleLower.includes('twitter') || titleLower.startsWith('x -') || titleLower.includes(' x ')) {
      return 'x';
    } else if (titleLower.includes('instagram') || titleLower.includes('story') || titleLower.includes('post') || titleLower.includes('reel')) {
      return 'instagram';
    } else if (titleLower.includes('facebook')) {
      return 'facebook';
      return 'x';
    }
    return 'instagram'; // Par défaut
  };

  // Cast profile to proper type after validation
  const validProfile = profile as any;

  // Transformer les données pour l'affichage avec les vraies statistiques d'avis
  const influencer = validProfile ? {
    id: validProfile.id,
    username: `@${(validProfile.first_name || 'user').toLowerCase()}`,
    fullName: `${validProfile.first_name || ''} ${validProfile.last_name || ''}`.trim() || 'Utilisateur',
    city: validProfile.city || "France",
    avatar: validProfile.avatar_url || "/placeholder.svg",
    category: validProfile.profile_categories?.[0]?.categories?.name || "Lifestyle",
    bio: validProfile.bio || "Passionné de création de contenu.",
    followers: validProfile.social_links?.reduce((sum: any, link: any) => sum + (link.followers || 0), 0) || 0,
    engagement: validProfile.social_links?.length > 0 ? Number((validProfile.social_links.reduce((sum: any, link: any) => sum + (link.engagement_rate || 0), 0) / validProfile.social_links.length).toFixed(1)) : 0,
    // Utiliser les vraies données d'avis de la base de données
    rating: reviewStats?.averageRating || 0,
    reviewCount: reviewStats?.totalReviews || 0,
    profileViews: validProfile.profile_views || 0,
    gallery: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    socialNetworks: validProfile.social_links?.map((link: any) => ({
      id: link.id,
      platform: link.platform as 'instagram' | 'tiktok' | 'youtube' | 'x' | 'snapchat',
      username: link.username,
      profile_url: link.profile_url,
      followers: link.followers || 0,
      engagement_rate: link.engagement_rate || 0,
      is_connected: link.is_active || false
    })) || [],
    services: (() => {
      console.log('Profile offers:', validProfile.offers);
      const activeOffers = validProfile.offers?.filter((offer: any) => offer.is_active) || [];
      console.log('Active offers:', activeOffers);
      if (activeOffers.length === 0) return [];
      return activeOffers.map((offer: any) => ({
        id: offer.id,
        type: offer.title || 'Service',
        description: offer.description || '',
        price: Number(offer.price) || 0,
        deliveryTime: offer.delivery_time || '48h',
        popular: offer.is_popular || false
      }));
    })(),
      id: 'default-1',
      type: "Story Instagram",
      description: "Story de 24h avec mention de votre produit",
      price: 100,
      deliveryTime: "24h"
    }, {
      id: 'default-2',
      type: "Post Instagram",
      description: "Post permanent avec photo de votre produit",
      price: 150,
      deliveryTime: "48h"
    }]
  } : {
    id: '',
    username: '@user',
    fullName: 'Utilisateur',
    city: 'France',
    avatar: '/placeholder.svg',
    category: 'Lifestyle',
    bio: '',
    followers: 0,
    engagement: 0,
    rating: 0,
    reviewCount: 0,
    profileViews: 0,
    gallery: [],
    socialNetworks: [],
    services: []
  };

  // Si le profil n'existe pas, afficher un message d'erreur
  if (!influencer || !influencer.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
        <Header />
        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Profil introuvable</h1>
            <p className="text-gray-600 mb-6">L'influenceur que vous recherchez n'existe pas ou a été supprimé.</p>
            <Button onClick={() => navigate('/catalog')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au catalogue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
      <Header />
      
      <div className="py-4 sm:py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Bouton retour */}
          <div className="mb-4">
            <Button onClick={() => navigate('/catalog')} variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour au catalogue
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Profile Info Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 lg:top-24">
                <Card className="shadow-xl border-0">
                  <CardContent className="p-4 sm:p-6">
                    <div className="text-center mb-6">
                      <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4">
                        <AvatarImage src={influencer.avatar} alt={influencer.fullName} />
                        <AvatarFallback className="text-xl sm:text-2xl">
                          {influencer.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <h1 className="text-xl sm:text-2xl font-bold mb-1">{influencer.username}</h1>
                      <p className="text-gray-600 mb-2">{influencer.fullName}</p>
                      <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
                        <MapPin className="w-4 h-4 mr-1" />
                        {influencer.city}
                      </div>
                      
                      <Badge className="mb-4">{influencer.category}</Badge>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Vues du profil</span>
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1 text-primary" />
                          <span className="font-semibold">{influencer.profileViews.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Abonnés</span>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-primary" />
                          <span className="font-semibold">{influencer.followers.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Engagement</span>
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 mr-1 text-red-500" />
                          <span className="font-semibold">{influencer.engagement}%</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Note</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                          <span className="font-semibold">
                            {influencer.rating > 0 ? `${influencer.rating} (${influencer.reviewCount} avis)` : 'Pas encore d\'avis'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Bio</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{influencer.bio}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button onClick={() => setIsMessagingOpen(true)} variant="outline" className="w-full">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contacter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Services */}
              <Card className="shadow-xl border-0 animate-fade-in">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold">Mes prestations</h2>
                    {influencer.services.length > 3 && <Button variant="outline" size="sm" onClick={() => setShowAllServices(true)}>
                        Voir tout
                      </Button>}
                  </div>
                  <ServicesCarousel services={influencer.services || []} influencerId={id} getPlatformLogo={getPlatformLogo} getPlatformFromTitle={getPlatformFromTitle} />
                </CardContent>
              </Card>

              {/* Social Networks */}
              <Card className="shadow-xl border-0 animate-fade-in">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold">Réseaux sociaux</h2>
                    {influencer.socialNetworks.length > 1 && <Button variant="outline" size="sm" onClick={() => setShowAllNetworks(true)}>
                        Voir tout
                      </Button>}
                  </div>
                  <SocialNetworksCarousel networks={influencer.socialNetworks || []} />
                </CardContent>
              </Card>

              {/* Reviews Section */}
              <ReviewsSection influencerId={validProfile.id} />

              {/* Gallery */}
              <Card className="shadow-xl border-0 animate-fade-in">
                
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Messaging Modal */}
      <MessagingModal isOpen={isMessagingOpen} onClose={() => setIsMessagingOpen(false)} influencer={influencer} />

      {/* All Services Modal */}
      <AllServicesModal isOpen={showAllServices} onClose={() => setShowAllServices(false)} services={influencer.services || []} influencerId={id} getPlatformLogo={getPlatformLogo} getPlatformFromTitle={getPlatformFromTitle} />

      {/* All Social Networks Modal */}
      <AllSocialNetworksModal isOpen={showAllNetworks} onClose={() => setShowAllNetworks(false)} networks={influencer.socialNetworks || []} />
    </div>;
};
export default InfluencerProfile;