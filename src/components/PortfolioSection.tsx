import { usePortfolio } from "@/hooks/usePortfolio";
import { Card } from "@/components/ui/card";
import { ExternalLink, Image as ImageIcon } from "lucide-react";
import { OptimizedImage } from "@/components/common/OptimizedImage";

interface PortfolioSectionProps {
  influencerId: string;
}

export const PortfolioSection = ({ influencerId }: PortfolioSectionProps) => {
  const { portfolioItems, isLoading } = usePortfolio(influencerId);

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

  return (
    <div className="grid grid-cols-2 gap-4">
      {portfolioItems.map((item) => (
        <Card
          key={item.id}
          className="group overflow-hidden hover:shadow-lg transition-all cursor-pointer"
          onClick={() => {
            if (item.link_url) {
              window.open(item.link_url, "_blank");
            }
          }}
        >
          <div className="relative aspect-square">
            <OptimizedImage
              src={item.image_url}
              alt={item.title || "Portfolio item"}
              className="w-full h-full object-cover"
            />
            {item.link_url && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ExternalLink className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
          {(item.title || item.description) && (
            <div className="p-3">
              {item.title && (
                <h4 className="font-semibold text-sm mb-1 line-clamp-1">
                  {item.title}
                </h4>
              )}
              {item.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
