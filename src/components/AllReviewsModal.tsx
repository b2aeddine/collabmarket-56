import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  is_verified: boolean;
  merchant?: {
    first_name?: string;
    last_name?: string;
    company_name?: string;
    avatar_url?: string;
  };
}

interface AllReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: Review[];
  reviewStats?: {
    averageRating: number;
    totalReviews: number;
  };
}

const AllReviewsModal = ({ 
  isOpen, 
  onClose, 
  reviews,
  reviewStats
}: AllReviewsModalProps) => {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Tous les avis clients</DialogTitle>
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
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
          {!reviews || reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aucun avis pour le moment.</p>
              <p className="text-sm">Soyez le premier à laisser un avis !</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-l-4 border-primary/20 pl-4 py-4 bg-gray-50/50 rounded-r-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage 
                          src={review.merchant?.avatar_url} 
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AllReviewsModal;