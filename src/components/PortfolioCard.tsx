import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2 } from "lucide-react";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import EditPortfolioModal from "./EditPortfolioModal";

interface PortfolioCardProps {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  link_url: string | null;
  influencer_id: string;
  created_at: string | null;
  onDelete: () => void;
  onUpdate: (item: any) => void;
}

const PortfolioCard = ({
  id,
  title,
  description,
  image_url,
  link_url,
  influencer_id,
  created_at,
  onDelete,
  onUpdate,
}: PortfolioCardProps) => {
  const handleVisitLink = () => {
    if (link_url) {
      let normalizedUrl = link_url.trim();
      if (!normalizedUrl.match(/^https?:\/\//)) {
        normalizedUrl = 'https://' + normalizedUrl;
      }
      window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden space-y-3 sm:space-y-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 animate-fade-in">
      {/* Image */}
      <div className="aspect-square w-full">
        <OptimizedImage
          src={image_url}
          alt={title || "Portfolio item"}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 space-y-3">
        {/* Title and Description */}
        <div className="space-y-2">
          {title && (
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {link_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleVisitLink}
              className="w-full text-orange-500 border-orange-200 hover:bg-orange-50 text-xs sm:text-sm min-h-[32px] sm:min-h-[36px]"
            >
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Voir le projet</span>
              <span className="xs:hidden">Projet</span>
            </Button>
          )}
          
          <div className="flex gap-1 sm:gap-2">
            <EditPortfolioModal
              item={{
                id,
                title,
                description,
                image_url,
                link_url,
                influencer_id,
                created_at,
              }}
              onSave={onUpdate}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50 text-xs sm:text-sm min-h-[32px] sm:min-h-[36px]"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden xs:inline">Suppr.</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCard;
