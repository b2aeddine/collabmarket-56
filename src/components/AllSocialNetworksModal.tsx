import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import SocialNetworkCard from "@/components/SocialNetworkCard";

interface NetworkDisplay {
  id: string;
  platform: string;
  username: string;
  profile_url: string;
  followers: number;
  engagement_rate: number;
  is_connected?: boolean;
  is_active?: boolean;
  user_id?: string;
  created_at?: string;
}

interface AllSocialNetworksModalProps {
  isOpen: boolean;
  onClose: () => void;
  networks: NetworkDisplay[];
  onToggleActive?: (network: NetworkDisplay) => void;
  onDelete?: (id: string) => void;
  onUpdateNetwork?: (network: NetworkDisplay) => void;
  showActions?: boolean;
}

const AllSocialNetworksModal = ({ 
  isOpen, 
  onClose, 
  networks,
  onToggleActive,
  onDelete,
  onUpdateNetwork,
  showActions = false
}: AllSocialNetworksModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Tous les réseaux sociaux</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {networks.map((network) => (
              <Card key={network.id} className="h-full">
                <CardContent className="p-0 h-full">
                  <SocialNetworkCard
                    {...network}
                    onToggleActive={onToggleActive ? () => onToggleActive(network) : undefined}
                    onDelete={onDelete ? () => onDelete(network.id) : undefined}
                    onUpdateNetwork={onUpdateNetwork}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AllSocialNetworksModal;