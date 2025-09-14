
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit } from "lucide-react";

interface SocialNetwork {
  id: string;
  platform: string;
  username: string;
  profile_url: string;
  followers: number;
  engagement_rate: number;
  is_connected?: boolean;
  is_active?: boolean;
  access_token?: string;
  last_updated?: string;
  user_id: string;
  created_at: string;
}

interface EditSocialNetworkModalProps {
  network: SocialNetwork;
  onSave: (updatedNetwork: SocialNetwork) => void;
}

const EditSocialNetworkModal = ({ network, onSave }: EditSocialNetworkModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    platform: network.platform,
    username: network.username,
    profile_url: network.profile_url,
    followers: network.followers || 0,
    engagement_rate: network.engagement_rate || 0,
  });

  const platforms = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'snapchat', label: 'Snapchat' },
    { value: 'x', label: 'X (Twitter)' },
    { value: 'youtube', label: 'YouTube' },
  ];

  const handleSave = () => {
    const updatedNetwork: SocialNetwork = {
      ...network,
      platform: formData.platform,
      username: formData.username,
      profile_url: formData.profile_url,
      followers: formData.followers,
      engagement_rate: formData.engagement_rate,
    };
    
    onSave(updatedNetwork);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 text-xs sm:text-sm min-h-[32px] sm:min-h-[36px]"
        >
          <Edit className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
          <span className="hidden xs:inline">Modif.</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le réseau social</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Plateforme</Label>
            <Select value={formData.platform} onValueChange={(value) => setFormData({...formData, platform: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    {platform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nom d'utilisateur</Label>
            <Input
              placeholder="@username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Lien du profil</Label>
            <Input
              placeholder="https://..."
              value={formData.profile_url}
              onChange={(e) => setFormData({...formData, profile_url: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90">
              Enregistrer
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditSocialNetworkModal;
