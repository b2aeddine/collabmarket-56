import { memo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Star } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";

interface InfluencerCardProps {
  influencer: {
    id: string;
    name: string;
    fullName: string;
    bio: string;
    followers: number;
    engagement: number;
    niche: string;
    categories?: string[];
    minPrice: number;
    avatar: string;
    location: string;
  };
}

// Memoized component to prevent unnecessary re-renders
const InfluencerCard = memo(({ influencer }: InfluencerCardProps) => {
  const { reviewStats } = useReviews(influencer.id);

  const formattedFollowers = influencer.followers > 0 
    ? (influencer.followers / 1000).toFixed(0) + 'k' 
    : '0';

  return (
    <Card className="border-0 shadow-lg transition-all duration-300 bg-white hover:shadow-xl hover:scale-[1.02] animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <img
            src={influencer.avatar}
            alt={influencer.name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
            loading="lazy" // Lazy load images for better performance
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 truncate">{influencer.name}</h3>
            <p className="text-gray-600 text-sm truncate">{influencer.fullName}</p>
            <p className="text-gray-500 text-xs truncate">{influencer.location}</p>
            
            {/* Categories badges - responsive layout */}
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge className="bg-gradient-primary text-white text-xs shrink-0">
                {influencer.categories && influencer.categories.length > 0 ? influencer.categories[0] : influencer.niche}
              </Badge>
              {influencer.categories && influencer.categories.length > 1 && 
                influencer.categories.slice(1).map((category, index) => (
                  <Badge key={index} variant="secondary" className="text-xs shrink-0">
                    {category}
                  </Badge>
                ))
              }
            </div>
          </div>
        </div>

        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {influencer.bio}
        </p>

        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-primary mr-1" />
            </div>
            <div className="text-lg font-bold text-primary">
              {formattedFollowers}
            </div>
            <div className="text-xs text-gray-600">Abonnés</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-secondary mr-1" />
            </div>
            <div className="text-lg font-bold text-secondary">{influencer.engagement}%</div>
            <div className="text-xs text-gray-600">Engagement</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Star className="w-4 h-4 text-accent mr-1" />
            </div>
            <div className="text-lg font-bold text-accent">
              {reviewStats?.averageRating ? reviewStats.averageRating.toFixed(1) : '0.0'}
            </div>
            <div className="text-xs text-gray-600">
              {reviewStats?.totalReviews || 0} avis
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs text-gray-600">À partir de</span>
            <div className="text-2xl font-bold text-primary">{influencer.minPrice}€</div>
          </div>
        </div>

        <Button asChild className="w-full bg-gradient-primary">
          <Link to={`/influencer/${influencer.id}`}>
            Voir le profil
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
});

InfluencerCard.displayName = 'InfluencerCard';

export default InfluencerCard;