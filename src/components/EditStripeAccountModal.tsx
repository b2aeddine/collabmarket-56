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
      toast.error("L'IBAN et le nom du titulaire sont obligatoires");
      return;
    }

    // Valider le format IBAN français
    const ibanRegex = /^FR\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{3}$/;
    const cleanIban = formData.iban.replace(/\s/g, '');
    
    if (!ibanRegex.test(cleanIban)) {
      toast.error("Format IBAN invalide. Utilisez le format FR suivi de 25 chiffres");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateBankDetails({
        iban: cleanIban,
        accountHolder: formData.accountHolder,
        country: formData.country,
      });
      
      toast.success("Compte bancaire mis à jour avec succès !");
      onClose();
      
      // Recharger la page pour refléter les changements
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Error updating bank account:", error);
      toast.error(error?.message || "Erreur lors de la mise à jour du compte bancaire");
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
              onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
              placeholder="FR76 1234 5678 9012 3456 7890 123"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Ce changement sera répercuté sur votre compte Stripe Connect
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