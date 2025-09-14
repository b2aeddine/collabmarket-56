
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextareaField } from "@/components/forms/TextareaField";

interface CampaignDetailsSectionProps {
  brief: string;
  deadline: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const CampaignDetailsSection = ({ brief, deadline, onInputChange }: CampaignDetailsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Détails de la campagne</h3>
      
      <TextareaField
        label="Brief détaillé"
        name="brief"
        placeholder="Décrivez votre produit, le message à faire passer, le ton souhaité, les hashtags à utiliser, etc."
        value={brief}
        onChange={onInputChange}
        rows={6}
        required
        description="Plus votre brief est détaillé, meilleur sera le résultat !"
      />
      
      <div className="space-y-2">
        <Label htmlFor="deadline">Date limite souhaitée</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
          <Input
            id="deadline"
            name="deadline"
            type="date"
            value={deadline}
            onChange={onInputChange}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
};
