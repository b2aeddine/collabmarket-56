
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, CheckCircle } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import AllReviewsModal from "./AllReviewsModal";

interface ReviewsSectionProps {
  influencerId: string;
}

const ReviewsSection = ({ influencerId }: ReviewsSectionProps) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { reviews, reviewStats, isLoading, error } = useReviews(influencerId);

  if (isLoading) {
    return (
      <Card className="shadow-xl border-0 animate-fade-in">
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Avis clients</h2>
          <div className="text-center py-8">Chargement des avis...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Reviews error:', error);
    return (
      <Card className="shadow-xl border-0 animate-fade-in">
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Avis clients</h2>
          <div className="text-center py-8 text-gray-500">
            Erreur lors du chargement des avis.
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderStars = (rating: number, size: string = "w-4 h-4") => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`${size} ${
          index < rating 
            ? "text-yellow-500 fill-current" 
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Card className="shadow-xl border-0 animate-fade-in">
      <CardContent className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Avis clients</h2>
          <div className="flex items-center gap-4">
            {reviewStats && reviewStats.totalReviews > 0 && (
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center">
                    {renderStars(Math.round(reviewStats.averageRating))}
                  </div>
                  <span className="font-semibold text-lg">
                    {reviewStats.averageRating.toFixed(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {reviewStats.totalReviews} avis
                </p>
              </div>
            )}
            {reviews && reviews.length > 1 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAllReviews(true)}
              >
                Voir tout
              </Button>
            )}
          </div>
        </div>

        {!reviews || reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucun avis pour le moment.</p>
            <p className="text-sm">Soyez le premier à laisser un avis !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.slice(0, 3).map((review) => (
              <div
                key={review.id}
                className="border-l-4 border-primary/20 pl-4 py-4 bg-gray-50/50 rounded-r-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage 
                        src={review.merchant?.avatar_url ?? undefined} 
                        alt={`${review.merchant?.first_name} ${review.merchant?.last_name}`} 
                      />
                      <AvatarFallback>
                        {review.merchant?.first_name?.[0] || 'U'}
                        {review.merchant?.last_name?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {review.merchant?.company_name || 
                           `${review.merchant?.first_name} ${review.merchant?.last_name}` ||
                           'Utilisateur anonyme'}
                        </p>
                        {review.is_verified && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Vérifié
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {format(new Date(review.created_at), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                  </div>
                </div>
                
                {review.comment && (
                  <p className="text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* All Reviews Modal */}
        <AllReviewsModal
          isOpen={showAllReviews}
          onClose={() => setShowAllReviews(false)}
          reviews={(reviews || []).map(r => ({ 
            ...r, 
            comment: r.comment ?? undefined,
            is_public: r.is_public ?? false,
            is_verified: r.is_verified ?? false
          }))}
          reviewStats={reviewStats ?? undefined}
        />
      </CardContent>
    </Card>
  );
};

export default ReviewsSection;
