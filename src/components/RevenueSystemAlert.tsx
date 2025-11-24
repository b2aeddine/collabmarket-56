import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, CheckCircle } from "lucide-react";

export const RevenueSystemAlert = () => {
  return (
    <Alert className="bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-900">Système de revenus mis à jour</AlertTitle>
      <AlertDescription className="text-blue-800">
        <div className="space-y-2 text-sm">
          <p>
            Les revenus affichés correspondent maintenant <strong>uniquement aux paiements réellement capturés via Stripe</strong>.
          </p>
          <div className="flex items-start gap-2 mt-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Les montants affichés sont maintenant 100% fiables et synchronisés avec Stripe</span>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
