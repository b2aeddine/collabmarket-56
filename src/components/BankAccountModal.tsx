import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import { toast } from "sonner";

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BankAccountModal = ({ isOpen, onClose }: BankAccountModalProps) => {
  const { addBankAccount } = useBankAccounts();
  const [formData, setFormData] = useState({
    iban: "",
    bic: "",
    account_holder: "",
    bank_name: "",
    is_default: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.iban || !formData.account_holder) {
      toast.error("L'IBAN et le nom du titulaire sont obligatoires");
      return;
    }

    setIsSubmitting(true);
    try {
      await addBankAccount.mutateAsync(formData);
      setFormData({
        iban: "",
        bic: "",
        account_holder: "",
        bank_name: "",
        is_default: false,
      });
      onClose();
    } catch (error) {
      console.error("Error adding bank account:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un compte bancaire</DialogTitle>
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
          </div>

          <div>
            <Label htmlFor="account_holder">Nom du titulaire *</Label>
            <Input
              id="account_holder"
              value={formData.account_holder}
              onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
              placeholder="Prénom Nom"
              required
            />
          </div>

          <div>
            <Label htmlFor="bic">BIC (optionnel)</Label>
            <Input
              id="bic"
              value={formData.bic}
              onChange={(e) => setFormData({ ...formData, bic: e.target.value })}
              placeholder="BNPAFRPP"
            />
          </div>

          <div>
            <Label htmlFor="bank_name">Nom de la banque (optionnel)</Label>
            <Input
              id="bank_name"
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              placeholder="BNP Paribas"
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
              {isSubmitting ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BankAccountModal;