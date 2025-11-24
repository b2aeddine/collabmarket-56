import { usePortfolio } from "@/hooks/usePortfolio";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Image as ImageIcon } from "lucide-react";
import { OptimizedImage } from "@/components/common/OptimizedImage";

interface PortfolioSectionProps {
  influencerId: string;
  showAll?: boolean;
  onViewAll?: () => void;
}

export const PortfolioSection = ({ influencerId, showAll = false, onViewAll }: PortfolioSectionProps) => {
  const { portfolioItems, isLoading } = usePortfolio(influencerId);
  const displayItems = showAll ? portfolioItems : portfolioItems.slice(0, 4);
  const hasMore = portfolioItems.length > 4;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (portfolioItems.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ImageIcon className="mx-auto h-12 w-12 mb-3 opacity-50" />
        <p className="text-lg mb-2">Aucun projet pour le moment.</p>
        <p className="text-sm">Le portfolio apparaîtra ici une fois configuré.</p>
      </div>
    );
  }

  const handleVisitLink = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (url) {
      let normalizedUrl = url.trim();
      if (!normalizedUrl.match(/^https?:\/\//)) {
        normalizedUrl = 'https://' + normalizedUrl;
      }
      window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {displayItems.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <div className="relative aspect-square">
            <OptimizedImage
              src={item.image_url}
              alt={item.title || "Portfolio item"}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3 space-y-2">
            {item.title && (
              <h4 className="font-semibold text-sm line-clamp-1">
                {item.title}
              </h4>
            )}
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}
            {item.link_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleVisitLink(item.link_url!, e)}
                className="w-full text-orange-500 border-orange-200 hover:bg-orange-50 text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                Voir le projet
              </Button>
            )}
          </div>
        </Card>
        ))}
      </div>
      
      {!showAll && hasMore && onViewAll && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={onViewAll}
            className="w-full"
          >
            Voir tout ({portfolioItems.length})
          </Button>
        </div>
      )}
    </div>
  );
};
