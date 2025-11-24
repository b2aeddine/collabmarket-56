import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { Landmark, ExternalLink, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditStripeAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccount?: {
    iban: string;
    account_holder: string;
    bank_name: string;
  };
}

const EditStripeAccountModal = ({ isOpen, onClose, currentAccount }: EditStripeAccountModalProps) => {
  const { updateBankDetails, isLoading } = useStripeConnect();

  const handleOpenStripeDashboard = async () => {
    try {
      await updateBankDetails();
      // La redirection se fait automatiquement vers Stripe
    } catch (error) {
      console.error('Error opening Stripe dashboard:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Modifier votre compte bancaire</DialogTitle>
              <DialogDescription className="text-sm">
                Mettre à jour vos informations bancaires Stripe Connect
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-800">
            <strong>Important :</strong> Vous allez être redirigé vers le tableau de bord Stripe pour modifier vos informations bancaires de manière sécurisée.
          </AlertDescription>
        </Alert>

        {currentAccount && (
          <div className="bg-gray-50 p-4 rounded-lg border space-y-2">
            <p className="text-sm font-medium text-gray-700">Compte bancaire actuel :</p>
            <div className="space-y-1">
              <p className="text-sm text-gray-900 font-mono">
                {currentAccount.iban}
              </p>
              <p className="text-sm text-gray-600">
                {currentAccount.account_holder}
              </p>
              {currentAccount.bank_name && (
                <p className="text-xs text-gray-500">
                  {currentAccount.bank_name}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <Button
            onClick={handleOpenStripeDashboard}
            className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-pulse">●</span>
                <span className="ml-2">Ouverture en cours...</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Ouvrir le tableau de bord Stripe
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full"
            disabled={isLoading}
          >
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditStripeAccountModal;