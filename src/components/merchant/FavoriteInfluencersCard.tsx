
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { OrderListSkeleton } from "@/components/common/OrderListSkeleton";

interface Favorite {
  id: string;
  influencer_id: string;
  influencer?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    bio?: string;
    social_links?: Array<{
      followers?: number;
    }>;
  };
}

interface FavoriteInfluencersCardProps {
  favorites?: Favorite[];
  isLoading: boolean;
}

const FavoriteInfluencersCard = ({ favorites, isLoading }: FavoriteInfluencersCardProps) => {
  return (
    <Card className="border-0 shadow-lg rounded-none sm:rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Influenceurs favoris</span>
          <Button asChild size="sm" variant="outline">
            <Link to="/catalog">Découvrir</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <OrderListSkeleton />
          ) : favorites?.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Aucun favori pour le moment</div>
          ) : (
            favorites?.slice(0, 3).map((favorite, index) => (
              <div 
                key={favorite.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-[1.01] hover:shadow-md animate-fade-in"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both'
                }}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={favorite.influencer?.avatar_url || undefined} />
                    <AvatarFallback>
                      {favorite.influencer ? 
                        `${favorite.influencer.first_name?.[0] || ''}${favorite.influencer.last_name?.[0] || ''}` : 
                        'IN'
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-800 truncate">
                      {favorite.influencer ? 
                        `${favorite.influencer.first_name || ''} ${favorite.influencer.last_name || ''}`.trim() || 'Influenceur' : 
                        'Influenceur'
                      }
                    </h4>
                    <p className="text-sm text-gray-600 truncate">
                      {favorite.influencer?.bio ? favorite.influencer.bio.slice(0, 50) + '...' : 'Influenceur'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        Influenceur
                      </Badge>
                      {favorite.influencer?.social_links && favorite.influencer.social_links.length > 0 && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Star className="w-3 h-3 mr-1 text-yellow-500 fill-current" />
                          {favorite.influencer.social_links[0].followers?.toLocaleString() || '0'} abonnés
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <Button asChild size="sm" variant="outline" className="mt-1">
                    <Link to={`/influencer/${favorite.influencer_id}`}>Voir</Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FavoriteInfluencersCard;
