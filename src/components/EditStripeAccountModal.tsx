import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { toast } from "sonner";
import { CheckCircle2, XCircle, AlertCircle, Landmark } from "lucide-react";
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
  const { updateBankDetails } = useStripeConnect();
  const [formData, setFormData] = useState({
    iban: "",
    accountHolder: "",
    country: "FR",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ibanValidation, setIbanValidation] = useState<{
    isValid: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  useEffect(() => {
    if (currentAccount) {
      // Afficher l'IBAN complet (pas masqué) pour permettre la modification
      const fullIban = currentAccount.iban || "";
      setFormData({
        iban: fullIban,
        accountHolder: currentAccount.account_holder || "",
        country: fullIban.substring(0, 2) || "FR",
      });
    }
  }, [currentAccount]);

  // Validation en temps réel de l'IBAN
  useEffect(() => {
    if (!formData.iban) {
      setIbanValidation(null);
      return;
    }

    const cleanedIban = formData.iban.replace(/\s/g, '').toUpperCase();
    
    // Validation progressive
    if (cleanedIban.length < 2) {
      setIbanValidation({
        isValid: false,
        message: 'Entrez le code pays (ex: FR, BE, ES...)',
        type: 'info'
      });
    } else if (!/^[A-Z]{2}/.test(cleanedIban)) {
      setIbanValidation({
        isValid: false,
        message: 'Le code pays doit être 2 lettres (ex: FR)',
        type: 'error'
      });
    } else if (cleanedIban.length < 15) {
      setIbanValidation({
        isValid: false,
        message: `${cleanedIban.length}/15 caractères minimum`,
        type: 'warning'
      });
    } else if (cleanedIban.length > 34) {
      setIbanValidation({
        isValid: false,
        message: 'IBAN trop long (max 34 caractères)',
        type: 'error'
      });
    } else {
      setIbanValidation({
        isValid: true,
        message: `✓ Format IBAN valide (${cleanedIban.substring(0, 2)})`,
        type: 'success'
      });
    }
  }, [formData.iban]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.iban || !formData.accountHolder) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Nettoyer l'IBAN
    const cleanedIban = formData.iban.replace(/\s/g, '').toUpperCase();
    
    // Validation de la longueur
    if (cleanedIban.length < 15 || cleanedIban.length > 34) {
      toast.error('L\'IBAN doit contenir entre 15 et 34 caractères');
      return;
    }

    // Validation du format de base (commence par 2 lettres)
    if (!/^[A-Z]{2}/.test(cleanedIban)) {
      toast.error('L\'IBAN doit commencer par le code pays (2 lettres)');
      return;
    }

    // Validation du nom du titulaire
    if (formData.accountHolder.trim().length < 3) {
      toast.error('Le nom du titulaire doit contenir au moins 3 caractères');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await updateBankDetails({
        iban: cleanedIban,
        accountHolder: formData.accountHolder.trim(),
        country: cleanedIban.substring(0, 2)
      });
      
      toast.success('✅ Compte bancaire mis à jour avec succès');
      
      // Rafraîchir le statut après 1 seconde
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
      onClose();
    } catch (error: any) {
      console.error('Error updating bank account:', error);
      
      // Gérer les différents types d'erreurs
      const errorData = error.response?.data || error;
      const errorCode = errorData?.code;
      
      let errorMessage = 'Erreur lors de la mise à jour du compte bancaire';
      
      switch (errorCode) {
        case 'INVALID_IBAN':
        case 'INVALID_IBAN_LENGTH':
          errorMessage = '❌ Format IBAN invalide. Veuillez vérifier votre IBAN.';
          break;
        case 'BANK_ACCOUNT_UNUSABLE':
          errorMessage = '❌ Ce compte bancaire ne peut pas être utilisé avec Stripe.';
          break;
        case 'BANK_ACCOUNT_DECLINED':
          errorMessage = '❌ Compte bancaire refusé. Veuillez contacter votre banque.';
          break;
        case 'BANK_ACCOUNT_EXISTS':
          errorMessage = '❌ Ce compte bancaire est déjà utilisé sur un autre compte.';
          break;
        case 'NO_STRIPE_ACCOUNT':
          errorMessage = '❌ Aucun compte Stripe Connect trouvé. Veuillez d\'abord le configurer.';
          break;
        case 'ACCOUNT_NOT_ACTIVE':
          errorMessage = '⚠️ Votre compte Stripe n\'est pas encore activé. Finalisez d\'abord la configuration.';
          break;
        default:
          errorMessage = errorData?.error || error.message || errorMessage;
      }
      
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsSubmitting(false);
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
            <strong>Important :</strong> Ce changement sera immédiatement appliqué sur votre compte Stripe Connect et utilisé pour vos futurs paiements.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="iban" className="text-sm font-medium flex items-center gap-2">
              IBAN *
              {ibanValidation && (
                <span className={`text-xs flex items-center gap-1 ${
                  ibanValidation.type === 'success' ? 'text-green-600' :
                  ibanValidation.type === 'error' ? 'text-red-600' :
                  ibanValidation.type === 'warning' ? 'text-amber-600' :
                  'text-blue-600'
                }`}>
                  {ibanValidation.type === 'success' && <CheckCircle2 className="w-3 h-3" />}
                  {ibanValidation.type === 'error' && <XCircle className="w-3 h-3" />}
                  {ibanValidation.type === 'warning' && <AlertCircle className="w-3 h-3" />}
                  {ibanValidation.message}
                </span>
              )}
            </Label>
            <Input
              id="iban"
              value={formData.iban}
              onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
              placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
              className={`font-mono text-base ${
                ibanValidation?.isValid ? 'border-green-500 focus-visible:ring-green-500' :
                ibanValidation?.type === 'error' ? 'border-red-500 focus-visible:ring-red-500' :
                ''
              }`}
              maxLength={42}
              required
            />
            <p className="text-xs text-muted-foreground">
              Tous les pays européens acceptés (FR, BE, ES, IT, DE, etc.)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_holder" className="text-sm font-medium">
              Nom du titulaire du compte *
            </Label>
            <Input
              id="account_holder"
              value={formData.accountHolder}
              onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
              placeholder="Jean Dupont"
              className="text-base"
              minLength={3}
              required
            />
            <p className="text-xs text-muted-foreground">
              Le nom doit correspondre au titulaire du compte bancaire
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-medium"
              disabled={isSubmitting || (ibanValidation && !ibanValidation.isValid)}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-pulse">●</span>
                  <span className="ml-2">Mise à jour en cours...</span>
                </>
              ) : (
                "Confirmer la modification"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStripeAccountModal;