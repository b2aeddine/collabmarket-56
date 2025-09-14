import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ViewProfileButtonProps {
  customUsername?: string;
  influencerId: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
}

const ViewProfileButton = ({ 
  customUsername, 
  influencerId, 
  className = "",
  size = "sm",
  variant = "outline"
}: ViewProfileButtonProps) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    if (customUsername) {
      // Utiliser le custom_username pour le profil public
      window.open(`/profile/${customUsername}`, '_blank');
    } else {
      // Fallback vers le profil normal
      navigate(`/influencer/${influencerId}`);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleViewProfile}
      className={`text-orange-500 border-orange-200 hover:bg-orange-50 ${className}`}
    >
      <ExternalLink className="w-4 h-4 mr-2" />
      Voir le profil
    </Button>
  );
};

export default ViewProfileButton;