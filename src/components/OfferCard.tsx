import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import EditOfferModal from "./EditOfferModal";
import { getPlatformLogo } from "@/lib/platformLogos";

interface OfferCardProps {
  id: string;
  type: string;
  platform: string;
  price: number;
  deliveryTime: string;
  active: boolean;
  onToggleActive: () => void;
  onDelete: () => void;
  onSave: (updatedOffer: any) => void;
  offer: any;
}

const OfferCard = ({ 
  id,
  type, 
  platform,
  price, 
  deliveryTime, 
  active,
  onToggleActive,
  onDelete,
  onSave,
  offer
}: OfferCardProps) => {
  

  const getPlatformDisplayName = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'x': return 'X';
      case 'twitter': return 'X';
      case 'instagram': return 'Instagram';
      case 'tiktok': return 'TikTok';
      case 'youtube': return 'YouTube';
      case 'facebook': return 'Facebook';
      case 'linkedin': return 'LinkedIn';
      case 'snapchat': return 'Snapchat';
      default: return platform.charAt(0).toUpperCase() + platform.slice(1);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02] animate-fade-in">
      {/* Header avec logo et statut */}
      <div className="flex items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {getPlatformLogo(platform)}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{type}</h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate">{getPlatformDisplayName(platform)}</p>
          </div>
        </div>
        <Badge variant={active ? "default" : "secondary"} className="text-xs flex-shrink-0">
          {active ? "Actif" : "Pausé"}
        </Badge>
      </div>

      {/* Stats */}
      <div className="space-y-2 sm:space-y-3">
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
          <span className="text-pink-500 font-semibold text-xs sm:text-sm">
            {price}€
          </span>
          <span className="text-pink-500 font-semibold text-xs sm:text-sm">
            {deliveryTime}
          </span>
        </div>
        
        {/* Badge Actif/Pause */}
        <div className="flex justify-end">
          <button
            onClick={onToggleActive}
            className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
              active 
                ? 'bg-orange-500 text-white' 
                : 'bg-green-500 text-white'
            }`}
          >
            {active ? 'Désactiver' : 'Activer'}
          </button>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="space-y-2">
        <div className="flex gap-1 sm:gap-2">
          <EditOfferModal 
            offer={offer} 
            onSave={onSave}
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
  );
};

export default OfferCard;