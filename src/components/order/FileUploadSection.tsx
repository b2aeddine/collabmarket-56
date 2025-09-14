
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FileUploadSection = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Fichiers du produit</h3>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
        <p className="text-lg font-medium mb-2">Téléchargez vos images</p>
        <p className="text-gray-600 mb-4">
          Photos du produit, logo, visuels à utiliser (JPG, PNG, PDF)
        </p>
        <Button variant="outline" type="button">
          Choisir des fichiers
        </Button>
      </div>
    </div>
  );
};
