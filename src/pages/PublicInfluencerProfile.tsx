import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import snapchatLogo from "@/assets/snapchat-logo.png";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import SocialNetworkCard from "@/components/SocialNetworkCard";
import ReviewsSection from "@/components/ReviewsSection";
import AllServicesModal from "@/components/AllServicesModal";
import AllSocialNetworksModal from "@/components/AllSocialNetworksModal";
import AllPortfolioModal from "@/components/AllPortfolioModal";
import { Users, Heart, Star, MapPin, Eye, ExternalLink } from "lucide-react";
import { InfluencerProfileSkeleton } from "@/components/common/InfluencerProfileSkeleton";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ServicesCarousel } from "@/components/common/ServicesCarousel";
import { SocialNetworksCarousel } from "@/components/common/SocialNetworksCarousel";
import { PortfolioSection } from "@/components/PortfolioSection";

const PublicInfluencerProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<{ id: string; first_name?: string; last_name?: string; avatar_url?: string; bio?: string; custom_username?: string; is_profile_public?: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllServices, setShowAllServices] = useState(false);
  const [showAllNetworks, setShowAllNetworks] = useState(false);
  const [showAllPortfolio, setShowAllPortfolio] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;

      try {
      // Récupérer d'abord le profil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          bio,
          city,
          profile_views,
          profile_share_count,
          created_at,
          custom_username,
          is_verified,
          role,
          social_links(*),
          offers(*)
        `)
        .eq('custom_username', username)
        .eq('is_profile_public', true)
        .maybeSingle();

        console.log('🔍 Profile data fetched:', profileData);

        if (profileError) {
          console.error('❌ Error fetching profile:', profileError);
          setError('Profil non trouvé ou privé');
          return;
        }

        if (!profileData) {
          setError('Profil non trouvé');
          return;
        }

        // Récupérer les catégories séparément
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('profile_categories')
          .select(`
            category_id,
            categories (
              id,
              name,
              slug
            )
          `)
          .eq('profile_id', profileData.id);

        console.log('📊 Categories data:', categoriesData);

        if (categoriesError) {
          console.error('❌ Error fetching categories:', categoriesError);
        }

        // Combiner les données
        const combinedData = {
          ...profileData,
          profile_categories: categoriesData || []
        };

        console.log('✅ Combined data:', combinedData);
        setProfile(combinedData);
        
        // Incrémenter le compteur de partages
        await supabase
          .from('profiles')
          .update({ 
            profile_share_count: (profileData.profile_share_count || 0) + 1 
          })
          .eq('id', profileData.id);

      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors du chargement du profil');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (isLoading) {
    return <InfluencerProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              {error || 'Profil non trouvé'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fonction pour obtenir le logo de la plateforme
  const getPlatformLogo = (platform: string) => {
    const platformName = platform.toLowerCase();
    switch (platformName) {
      case 'instagram':
        return (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
        );
      case 'tiktok':
        return (
          <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </div>
        );
      case 'youtube':
        return (
          <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        );
      case 'x':
      case 'twitter':
        return (
          <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
        );
      case 'facebook':
        return (
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
        );
      case 'linkedin':
        return (
          <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>
        );
      case 'snapchat':
        return (
          <div className="w-10 h-10 rounded-xl overflow-hidden">
            <img src={snapchatLogo} alt="Snapchat" className="w-full h-full object-cover" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-lg bg-gray-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        );
    }
  };

  const getPlatformFromTitle = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('instagram') || lowerTitle.includes('insta')) return 'instagram';
    if (lowerTitle.includes('tiktok') || lowerTitle.includes('tik tok')) return 'tiktok';
    if (lowerTitle.includes('youtube') || lowerTitle.includes('yt')) return 'youtube';
    if (lowerTitle.includes('twitter') || lowerTitle.includes('x ')) return 'x';
    if (lowerTitle.includes('facebook') || lowerTitle.includes('fb')) return 'facebook';
    if (lowerTitle.includes('linkedin')) return 'linkedin';
    if (lowerTitle.includes('snapchat') || lowerTitle.includes('snap')) return 'snapchat';
    return 'default';
  };

  // Transformer les données pour l'affichage
  console.log('🔄 Transforming profile categories:', profile.profile_categories);
  
  // S'assurer que profile_categories est bien un tableau
  const categoriesArray = Array.isArray(profile.profile_categories) 
    ? profile.profile_categories 
    : [];
  
  console.log('📦 Categories array:', categoriesArray);
  
  const categoriesNames = categoriesArray
    .map(pc => {
      console.log('🏷️ Processing category:', pc);
      return pc?.categories?.name;
    })
    .filter((name): name is string => Boolean(name));
  
  console.log('✅ Final categories names:', categoriesNames);
  
  const influencer = {
    id: profile.id,
    username: `@${profile.custom_username}`,
    fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Utilisateur',
    city: profile.city || "France",
    avatar: profile.avatar_url || "/placeholder.svg",
    categories: categoriesNames.length > 0 ? categoriesNames : ["Lifestyle"],
    bio: profile.bio || "Passionné de création de contenu.",
    followers: profile.social_links?.reduce((sum, link) => sum + (link.followers || 0), 0) || 0,
    engagement: profile.social_links?.length > 0 
      ? Number((profile.social_links.reduce((sum, link) => sum + (link.engagement_rate || 0), 0) / profile.social_links.length).toFixed(1))
      : 0,
    profileViews: profile.profile_views || 0,
    shareCount: profile.profile_share_count || 0,
    socialNetworks: profile.social_links?.map(link => ({
      id: link.id,
      platform: link.platform as 'instagram' | 'tiktok' | 'youtube' | 'x' | 'snapchat',
      username: link.username,
      profile_url: link.profile_url,
      followers: link.followers || 0,
      engagement_rate: link.engagement_rate || 0,
      is_connected: link.is_connected || false,
    })) || [],
    services: (() => {
      console.log('Public profile offers:', profile.offers);
      const activeOffers = profile.offers?.filter(offer => offer.is_active);
      console.log('Public active offers:', activeOffers);
      return activeOffers?.map(offer => ({
        id: offer.id,
        type: offer.title,
        description: offer.description || '',
        price: Number(offer.price),
        deliveryTime: offer.delivery_time || '48h',
        popular: offer.is_popular || false,
      })) || [];
    })(),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
      <Header />
      
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="shadow-xl border-0">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <Avatar className="w-24 h-24 mx-auto mb-4">
                        <AvatarImage src={influencer.avatar} alt={influencer.fullName} />
                        <AvatarFallback className="text-2xl">
                          {influencer.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <h1 className="text-2xl font-bold mb-1">{influencer.username}</h1>
                      <p className="text-gray-600 mb-2">{influencer.fullName}</p>
                      <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
                        <MapPin className="w-4 h-4 mr-1" />
                        {influencer.city}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 justify-center mb-4">
                        {influencer.categories.map((category, index) => (
                          <Badge 
                            key={index} 
                            className={index === 0 ? "bg-gradient-primary text-white" : ""}
                            variant={index === 0 ? "default" : "secondary"}
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
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
                    </div>

                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Bio</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{influencer.bio}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Services */}
              {influencer.services.length > 0 && (
                <Card className="shadow-xl border-0 animate-fade-in">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Mes prestations</h2>
                      {influencer.services.length > 1 && (
                        <Button
                          variant="outline"
                          onClick={() => setShowAllServices(true)}
                          className="text-sm"
                        >
                          Voir tout
                        </Button>
                      )}
                    </div>
                    <ServicesCarousel 
                      services={influencer.services}
                      showOrderButton={false}
                      getPlatformLogo={getPlatformLogo}
                      getPlatformFromTitle={getPlatformFromTitle}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Social Networks */}
              {influencer.socialNetworks.length > 0 && (
                <Card className="shadow-xl border-0 animate-fade-in">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold">Réseaux sociaux</h2>
                      {influencer.socialNetworks.length > 1 && (
                        <Button
                          variant="outline"
                          onClick={() => setShowAllNetworks(true)}
                          className="text-sm"
                        >
                          Voir tout
                        </Button>
                      )}
                    </div>
                    <SocialNetworksCarousel 
                      networks={influencer.socialNetworks}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Portfolio Section */}
              <Card className="shadow-xl border-0 animate-fade-in">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
                  <PortfolioSection 
                    influencerId={profile.id} 
                    onViewAll={() => setShowAllPortfolio(true)}
                  />
                </CardContent>
              </Card>

              {/* Reviews Section */}
              <ReviewsSection influencerId={profile.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AllServicesModal
        isOpen={showAllServices}
        onClose={() => setShowAllServices(false)}
        services={influencer.services}
        getPlatformLogo={getPlatformLogo}
        getPlatformFromTitle={getPlatformFromTitle}
      />

      <AllSocialNetworksModal
        isOpen={showAllNetworks}
        onClose={() => setShowAllNetworks(false)}
        networks={influencer.socialNetworks}
      />

      <AllPortfolioModal
        open={showAllPortfolio}
        onOpenChange={setShowAllPortfolio}
        influencerId={profile.id}
      />
    </div>
  );
};

export default PublicInfluencerProfile;
