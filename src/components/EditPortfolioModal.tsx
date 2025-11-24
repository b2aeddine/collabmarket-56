import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  link_url: string | null;
  influencer_id: string;
  created_at: string | null;
}

interface EditPortfolioModalProps {
  item: PortfolioItem;
  onSave: (updatedItem: PortfolioItem) => void;
}

const EditPortfolioModal = ({ item, onSave }: EditPortfolioModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: item.title || "",
    description: item.description || "",
    link_url: item.link_url || "",
  });

  const handleSave = () => {
    const updatedItem: PortfolioItem = {
      ...item,
      title: formData.title,
      description: formData.description,
      link_url: formData.link_url,
    };
    
    onSave(updatedItem);
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
          <DialogTitle>Modifier le projet</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Titre du projet</Label>
            <Input
              placeholder="Nom du projet"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Description du projet..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Lien du projet</Label>
            <Input
              placeholder="https://..."
              value={formData.link_url}
              onChange={(e) => setFormData({...formData, link_url: e.target.value})}
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

export default EditPortfolioModal;
