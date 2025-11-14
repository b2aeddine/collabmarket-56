
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";
import SocialNetworkCard from "@/components/SocialNetworkCard";
import ReviewsSection from "@/components/ReviewsSection";
import { getPlatformLogo } from "@/lib/platformLogos";
import { Users, Heart, Star, MapPin, Eye } from "lucide-react";
import { InfluencerProfileSkeleton } from "@/components/common/InfluencerProfileSkeleton";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ServicesCarousel } from "@/components/common/ServicesCarousel";
import { SocialNetworksCarousel } from "@/components/common/SocialNetworksCarousel";
import snapchatLogo from "@/assets/snapchat-logo.png";

const PublicInfluencerProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            social_links(*),
            offers(*),
            profile_categories(
              categories(*)
            )
          `)
          .eq('custom_username', username)
          .eq('is_profile_public', true)
          .single();

        if (error) {
          setError('Profil non trouvé ou privé');
          return;
        }

        setProfile(data);
        
        // Incrémenter le compteur de partages
        await supabase
          .from('profiles')
          .update({ 
            profile_share_count: (data.profile_share_count || 0) + 1 
          })
          .eq('id', data.id);

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
  console.log('Profile categories data:', profile.profile_categories);
  const influencer = {
    id: profile.id,
    username: `@${profile.custom_username}`,
    fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Utilisateur',
    city: profile.city || "France",
    avatar: profile.avatar_url || "/placeholder.svg",
    categories: profile.profile_categories?.map(pc => pc.categories?.name).filter(Boolean) || ["Lifestyle"],
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
                          <Badge key={index} variant={index === 0 ? "default" : "secondary"}>
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
                    <h2 className="text-2xl font-bold mb-6">Prestations disponibles</h2>
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
                    <h2 className="text-2xl font-bold mb-4">Réseaux sociaux</h2>
                    <SocialNetworksCarousel 
                      networks={influencer.socialNetworks}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Reviews Section */}
              <ReviewsSection influencerId={profile.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicInfluencerProfile;
