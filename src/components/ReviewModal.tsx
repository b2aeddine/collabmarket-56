import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Order } from '@/types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

const ReviewModal = ({ isOpen, onClose, order }: ReviewModalProps) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          order_id: order.id,
          influencer_id: order.influencer_id,
          merchant_id: order.merchant_id,
          rating,
          comment: comment.trim(),
          is_public: true,
          is_verified: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Avis publié avec succès !",
        description: "Merci pour votre retour sur cette collaboration.",
      });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setRating(5);
      setComment("");
      onClose();
    },
    onError: (error: any) => {
      console.error('Error creating review:', error);
      toast({
        title: "Erreur",
        description: error.message?.includes('duplicate') 
          ? "Vous avez déjà laissé un avis pour cette commande."
          : "Impossible de publier l'avis. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast({
        title: "Commentaire requis",
        description: "Veuillez ajouter un commentaire à votre avis.",
        variant: "destructive",
      });
      return;
    }

    createReviewMutation.mutate();
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating);
  };

  const influencerName = `${order?.influencer?.first_name || ''} ${order?.influencer?.last_name || ''}`.trim() || 'Influenceur';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Évaluer la collaboration avec {influencerName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">Notez votre expérience (1 à 5 étoiles)</p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-transform hover:scale-110"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500">{rating} étoile{rating > 1 ? 's' : ''}</p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Votre commentaire *
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience avec cet influenceur..."
              className="min-h-[120px] resize-none"
              maxLength={500}
              required
            />
            <p className="text-xs text-gray-500 text-right">
              {comment.length}/500 caractères
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={createReviewMutation.isPending}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-primary"
              disabled={createReviewMutation.isPending || !comment.trim()}
            >
              {createReviewMutation.isPending ? "Publication..." : "Publier l'avis"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;