import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { toast } from "sonner";

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

  useEffect(() => {
    if (currentAccount) {
      setFormData({
        iban: currentAccount.iban || "",
        accountHolder: currentAccount.account_holder || "",
        country: "FR",
      });
    }
  }, [currentAccount]);

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le compte bancaire Stripe</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="iban">IBAN *</Label>
            <Input
              id="iban"
              value={formData.iban}
              onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
              placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
              className="font-mono"
              maxLength={34}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format accepté: Code pays (2 lettres) + numéro de compte (15-32 caractères)
            </p>
            <p className="text-xs text-amber-600 mt-1">
              ⚠️ Ce changement sera immédiatement appliqué sur votre compte Stripe Connect
            </p>
          </div>

          <div>
            <Label htmlFor="account_holder">Nom du titulaire *</Label>
            <Input
              id="account_holder"
              value={formData.accountHolder}
              onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
              placeholder="Prénom Nom"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
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
              className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStripeAccountModal;