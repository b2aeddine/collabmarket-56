
import SocialNetworkCard from "../SocialNetworkCard";
import AddSocialNetworkModal from "../AddSocialNetworkModal";
import { SocialNetwork } from "@/types";
import { SocialNetworksCarousel } from "../common/SocialNetworksCarousel";

interface SocialNetworksListProps {
  networks: SocialNetwork[];
  onAddNetwork: (network: SocialNetwork) => void;
  onUpdateNetwork: (network: SocialNetwork) => void;
  onDeleteNetwork: (id: string) => void;
}

export const SocialNetworksList = ({ 
  networks, 
  onAddNetwork, 
  onUpdateNetwork, 
  onDeleteNetwork 
}: SocialNetworksListProps) => {
  const handleToggleActive = (network: SocialNetwork) => {
    onUpdateNetwork({
      ...network,
      is_active: !network.is_active
    });
  };

  return (
    <div className="space-y-6">
      <SocialNetworksCarousel 
        networks={networks}
        onToggleActive={handleToggleActive}
        onDelete={onDeleteNetwork}
        onUpdateNetwork={onUpdateNetwork}
        showActions={true}
      />
    </div>
  );
};
