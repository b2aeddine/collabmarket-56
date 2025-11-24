
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/common/GradientButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Instagram, Youtube, Twitter } from "lucide-react";

interface Offer {
  id: string;
  platform: string;
  type: string;
  description: string;
  price: number;
  deliveryTime: string;
  active: boolean;
}

interface AddOfferModalProps {
  onAddOffer: (offer: Offer) => void;
}

const AddOfferModal = ({ onAddOffer }: AddOfferModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    platform: "",
    type: "",
    description: "",
    price: "",
    deliveryTime: "",
  });

  const platforms = [
    { value: "instagram", label: "Instagram", icon: Instagram },
    { value: "tiktok", label: "TikTok", icon: "🎵" },
    { value: "youtube", label: "YouTube", icon: Youtube },
    { value: "x", label: "X (Twitter)", icon: Twitter },
    { value: "snapchat", label: "Snapchat", icon: "👻" },
  ];

  const offerTypes = [
    "Publication",
    "Story",
    "Reel",
    "Vidéo sponsorisée",
    "Package complet",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.platform && formData.type && formData.description && formData.price) {
      onAddOffer({
        id: Date.now().toString(),
        platform: formData.platform,
        type: formData.type,
        description: formData.description,
        price: parseInt(formData.price),
        deliveryTime: formData.deliveryTime || "2-3 jours",
        active: true,
      });
      setFormData({ platform: "", type: "", description: "", price: "", deliveryTime: "" });
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <GradientButton className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une offre
        </GradientButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle offre</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="platform">Réseau social</Label>
            <Select value={formData.platform} onValueChange={(value) => setFormData({...formData, platform: value})}>
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
            <Label htmlFor="type">Type d'offre</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un type" />
              </SelectTrigger>
              <SelectContent>
                {offerTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Décrivez votre offre..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Prix (€)</Label>
              <Input
                id="price"
                type="number"
                placeholder="150"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="deliveryTime">Délai de livraison</Label>
              <Input
                id="deliveryTime"
                placeholder="ex: 2-3 jours"
                value={formData.deliveryTime}
                onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90">
              Créer l'offre
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddOfferModal;
