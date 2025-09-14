
import { Building } from "lucide-react";
import { InputField } from "@/components/forms/InputField";

interface BrandInfoSectionProps {
  brandName: string;
  productName: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BrandInfoSection = ({ brandName, productName, onInputChange }: BrandInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <Building className="w-5 h-5 mr-2" />
        Informations sur votre marque
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Nom de la marque"
          name="brandName"
          placeholder="Ma Super Marque"
          value={brandName}
          onChange={onInputChange}
          required
        />
        
        <InputField
          label="Produit à promouvoir"
          name="productName"
          placeholder="Mon Produit Génial"
          value={productName}
          onChange={onInputChange}
          required
        />
      </div>
    </div>
  );
};
