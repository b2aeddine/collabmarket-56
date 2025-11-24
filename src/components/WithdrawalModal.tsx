
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCreateBankAccount } from "@/hooks/useRevenues";
import { supabase } from "@/integrations/supabase/client";
import { BankAccount } from "@/types";
import { Euro, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  bankAccounts: BankAccount[];
}

const WithdrawalModal = ({ isOpen, onClose, availableBalance, bankAccounts: _bankAccounts }: WithdrawalModalProps) => {
  const [amount, setAmount] = useState("");
  const [_selectedBankAccount, setSelectedBankAccount] = useState("");
  const [showAddBank, setShowAddBank] = useState(false);
  const [newBankAccount, setNewBankAccount] = useState({
    iban: "",
    bic: "",
    account_holder: "",
    bank_name: "",
    is_default: false,
  });

  const createBankAccountMutation = useCreateBankAccount();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleWithdrawal = async () => {
    if (!amount) {
      toast.error("Veuillez saisir un montant");
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    if (withdrawalAmount <= 0) {
      toast.error("Le montant doit être positif");
      return;
    }

    if (withdrawalAmount > availableBalance) {
      toast.error("Le montant demandé dépasse votre solde disponible");
      return;
    }

    setIsProcessing(true);
    try {
      // Appeler directement la fonction process-withdrawal pour créer un payout Stripe
      const { data: _data, error } = await supabase.functions.invoke('process-withdrawal', {
        body: { amount: withdrawalAmount }
      });

      if (error) {
        throw error;
      }
      
      toast.success("Retrait traité avec succès ! Le virement sera effectué sous peu.");
      setAmount("");
      setSelectedBankAccount("");
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du traitement du retrait";
      console.error("Error processing withdrawal:", error);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddBankAccount = async () => {
    if (!newBankAccount.iban || !newBankAccount.bic || !newBankAccount.account_holder || !newBankAccount.bank_name) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      await createBankAccountMutation.mutateAsync(newBankAccount);
      toast.success("Compte bancaire ajouté avec succès !");
      setNewBankAccount({
        iban: "",
        bic: "",
        account_holder: "",
        bank_name: "",
        is_default: false,
      });
      setShowAddBank(false);
    } catch (error) {
      console.error("Error creating bank account:", error);
      toast.error("Erreur lors de l'ajout du compte bancaire");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Euro className="w-5 h-5" />
            Demander un retrait
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Solde disponible */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-1">Solde disponible</p>
              <p className="text-2xl font-bold text-green-600">{availableBalance.toFixed(2)}€</p>
            </CardContent>
          </Card>

          {/* Montant à retirer */}
          <div className="space-y-2">
            <Label htmlFor="amount">Montant à retirer (€)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={availableBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500">
              Maximum : {availableBalance.toFixed(2)}€
            </p>
          </div>

          {/* Info compte Stripe Connect */}
          <Card className="bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-medium">Compte bancaire configuré</p>
              </div>
              <p className="text-xs text-gray-600">
                Le retrait sera effectué sur votre compte bancaire Stripe Connect configuré.
              </p>
            </CardContent>
          </Card>

          {/* Formulaire d'ajout de compte bancaire */}
          {showAddBank && (
            <Card className="border-dashed">
              <CardContent className="p-4 space-y-4">
                <h4 className="font-semibold">Nouveau compte bancaire</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="iban">IBAN</Label>
                    <Input
                      id="iban"
                      value={newBankAccount.iban}
                      onChange={(e) => setNewBankAccount({...newBankAccount, iban: e.target.value})}
                      placeholder="FR76..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="bic">BIC</Label>
                    <Input
                      id="bic"
                      value={newBankAccount.bic}
                      onChange={(e) => setNewBankAccount({...newBankAccount, bic: e.target.value})}
                      placeholder="BNPAFRPP"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="account_holder">Nom du titulaire</Label>
                  <Input
                    id="account_holder"
                    value={newBankAccount.account_holder}
                    onChange={(e) => setNewBankAccount({...newBankAccount, account_holder: e.target.value})}
                    placeholder="Jean Dupont"
                  />
                </div>

                <div>
                  <Label htmlFor="bank_name">Nom de la banque</Label>
                  <Input
                    id="bank_name"
                    value={newBankAccount.bank_name}
                    onChange={(e) => setNewBankAccount({...newBankAccount, bank_name: e.target.value})}
                    placeholder="BNP Paribas"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddBankAccount}
                    disabled={createBankAccountMutation.isPending}
                    className="flex-1"
                  >
                    {createBankAccountMutation.isPending ? "Ajout..." : "Ajouter"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddBank(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Boutons d'action */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleWithdrawal}
              disabled={!amount || isProcessing}
              className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
            >
              {isProcessing ? "Traitement..." : "Confirmer le retrait"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalModal;
