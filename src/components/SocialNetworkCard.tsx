
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Check } from "lucide-react";
import EditSocialNetworkModal from "./EditSocialNetworkModal";
import { getPlatformLogo } from "@/lib/platformLogos";

interface SocialNetworkCardProps {
  id?: string;
  platform: string;
  username: string;
  profile_url: string;
  followers: number;
  engagement_rate: number;
  is_connected?: boolean;
  is_active?: boolean;
  onDelete?: () => void;
  onToggleActive?: () => void;
  onUpdateNetwork?: (network: any) => void;
  user_id?: string;
  created_at?: string;
}

const SocialNetworkCard = ({ 
  id,
  platform, 
  username, 
  profile_url,
  followers, 
  engagement_rate, 
  is_connected,
  is_active = true,
  onDelete,
  onToggleActive,
  onUpdateNetwork,
  user_id,
  created_at
}: SocialNetworkCardProps) => {
  

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

  const handleVisitProfile = () => {
    if (profile_url) {
      // Normaliser l'URL pour gérer tous les cas possibles
      let url = profile_url.trim();
      
      // Supprimer les espaces en début/fin
      url = url.replace(/^\/+/, ''); // Supprimer les / en début
      
      // Ajouter https:// si l'URL ne commence pas par http:// ou https://
      if (!url.match(/^https?:\/\//)) {
        url = 'https://' + url;
      }
      
      console.log('Opening URL:', url, 'from original:', profile_url);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1).replace('.0', '')}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}k`;
    }
    return count.toString();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02] animate-fade-in">
      {/* Header avec logo et statut */}
      <div className="flex items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {getPlatformLogo(platform)}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{getPlatformDisplayName(platform)}</h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate">@{username}</p>
          </div>
        </div>
        {is_connected && (
          <div className="flex items-center gap-1 text-green-600 flex-shrink-0">
            <Check className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="space-y-2 sm:space-y-3">
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
          <span className="text-pink-500 font-semibold text-xs sm:text-sm">
            {formatFollowers(followers)} abonnés
          </span>
          <span className="text-pink-500 font-semibold text-xs sm:text-sm">
            {engagement_rate}% engagement
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleVisitProfile()}
          className="w-full text-orange-500 border-orange-200 hover:bg-orange-50 text-xs sm:text-sm min-h-[32px] sm:min-h-[36px]"
        >
          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">Visiter réseau</span>
          <span className="xs:hidden">Réseau</span>
        </Button>
        
        {(onUpdateNetwork || onDelete) && (
          <div className="flex gap-2">
            {onUpdateNetwork && id && user_id && created_at && (
              <EditSocialNetworkModal
                network={{
                  id,
                  platform,
                  username,
                  profile_url,
                  followers,
                  engagement_rate,
                  is_connected,
                  is_active,
                  user_id,
                  created_at
                }}
                onSave={onUpdateNetwork}
              />
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="text-red-500 border-red-200 hover:bg-red-50 text-xs sm:text-sm min-h-[32px] sm:min-h-[36px]"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialNetworkCard;
