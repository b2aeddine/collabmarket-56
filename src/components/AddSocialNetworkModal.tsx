
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/common/GradientButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Instagram, Youtube, Twitter } from "lucide-react";
import { SocialNetwork } from "@/types";
import { useCreateSocialLink } from "@/hooks/useSocialLinks";
import { toast } from "sonner";

interface AddSocialNetworkModalProps {
  userId?: string;
}

const AddSocialNetworkModal = ({ userId: _userId }: AddSocialNetworkModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    platform: "" as SocialNetwork['platform'],
    username: "",
    profile_url: "",
    followers: "",
    engagement_rate: "",
  });

  const createSocialLinkMutation = useCreateSocialLink();

  const platforms = [
    { value: "instagram" as const, label: "Instagram", icon: Instagram },
    { value: "tiktok" as const, label: "TikTok", icon: "🎵" },
    { value: "youtube" as const, label: "YouTube", icon: Youtube },
    { value: "x" as const, label: "X (Twitter)", icon: Twitter },
    { value: "snapchat" as const, label: "Snapchat", icon: "👻" },
  ];

  const resetForm = () => {
    setFormData({ 
      platform: "" as SocialNetwork['platform'], 
      username: "", 
      profile_url: "", 
      followers: "", 
      engagement_rate: "" 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.platform || !formData.username || !formData.profile_url) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const socialData = {
        platform: formData.platform,
        username: formData.username,
        profile_url: formData.profile_url,
        followers: formData.followers ? parseInt(formData.followers) : 0,
        engagement_rate: formData.engagement_rate ? parseFloat(formData.engagement_rate) : 0,
      };

      await createSocialLinkMutation.mutateAsync(socialData);
      
      toast.success("Réseau social ajouté avec succès !");
      
      // Reset form and close modal
      resetForm();
      setIsOpen(false);

    } catch (error) {
      toast.error("Erreur lors de l'ajout du réseau social");
    }
  };

  const handleClose = () => {
    resetForm();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <GradientButton className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un réseau
        </GradientButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un réseau social</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="platform">Réseau social *</Label>
            <Select 
              value={formData.platform} 
              onValueChange={(value: SocialNetwork['platform']) => {
                // Platform selected
                setFormData({...formData, platform: value});
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un réseau" />
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

          <div>
            <Label htmlFor="username">Nom d'utilisateur *</Label>
            <Input
              id="username"
              placeholder="@username"
              value={formData.username}
              onChange={(e) => {
                // Username changed
                setFormData({...formData, username: e.target.value});
              }}
              required
            />
          </div>

          <div>
            <Label htmlFor="profile_url">Lien du profil *</Label>
            <Input
              id="profile_url"
              placeholder="https://..."
              value={formData.profile_url}
              onChange={(e) => {
                // Profile URL changed
                setFormData({...formData, profile_url: e.target.value});
              }}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="followers">Abonnés</Label>
              <Input
                id="followers"
                type="number"
                placeholder="10000"
                value={formData.followers}
                onChange={(e) => setFormData({...formData, followers: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="engagement_rate">Engagement (%)</Label>
              <Input
                id="engagement_rate"
                type="number"
                step="0.1"
                placeholder="4.2"
                value={formData.engagement_rate}
                onChange={(e) => setFormData({...formData, engagement_rate: e.target.value})}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={createSocialLinkMutation.isPending}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90" 
              disabled={createSocialLinkMutation.isPending}
            >
              {createSocialLinkMutation.isPending ? 'Ajout...' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSocialNetworkModal;
