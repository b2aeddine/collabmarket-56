
import { Button } from "@/components/ui/button";
import { ExternalLink, Edit, Trash2, Check } from "lucide-react";
import EditSocialNetworkModal from "./EditSocialNetworkModal";
import snapchatLogo from "@/assets/snapchat-logo.png";

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
  
  const getPlatformLogo = (platform: string) => {
    const platformName = platform.toLowerCase();
    switch (platformName) {
      case 'instagram':
        return (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
        );
      case 'tiktok':
        return (
          <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </div>
        );
      case 'youtube':
        return (
          <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        );
      case 'x':
      case 'twitter':
        return (
          <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
        );
      case 'facebook':
        return (
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
        );
      case 'linkedin':
        return (
          <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>
        );
      case 'snapchat':
        return (
          <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center relative overflow-hidden">
            <img 
              src={snapchatLogo} 
              alt="Snapchat" 
              className="w-6 h-6 object-contain"
            />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-lg bg-gray-500 flex items-center justify-center">
            <ExternalLink className="w-6 h-6 text-white" />
          </div>
        );
    }
  };

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
    <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 animate-fade-in">
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
