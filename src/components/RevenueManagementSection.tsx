import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Euro, CreditCard, Plus, Trash2, Edit } from "lucide-react";
import { useInfluencerRevenues } from "@/hooks/useInfluencerRevenues";
import { useBankAccounts, type BankAccount } from "@/hooks/useBankAccounts";
import { useWithdrawals } from "@/hooks/useWithdrawals";
import { toast } from "sonner";

const RevenueManagementSection = () => {
  const { balance, withdrawalRequests, isLoading } = useInfluencerRevenues();
  const { bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount } = useBankAccounts();
  const { createWithdrawal } = useWithdrawals();
  
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
  
  const [bankForm, setBankForm] = useState({
    iban: '',
    bic: '',
    account_holder: '',
    bank_name: '',
    is_default: true,
  });

  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    bankAccountId: '',
  });

  const handleAddBankAccount = async () => {
    if (!bankForm.iban || !bankForm.account_holder) {
      toast.error('IBAN et nom du titulaire sont obligatoires');
      return;
    }

    try {
      await addBankAccount.mutateAsync(bankForm);
      setBankForm({ iban: '', bic: '', account_holder: '', bank_name: '', is_default: true });
      setIsAddingBank(false);
    } catch (error) {
      console.error('Error adding bank account:', error);
    }
  };

  const handleUpdateBankAccount = async () => {
    if (!editingBank || !bankForm.iban || !bankForm.account_holder) {
      toast.error('IBAN et nom du titulaire sont obligatoires');
      return;
    }

    try {
      await updateBankAccount.mutateAsync({
        id: editingBank.id,
        ...bankForm,
      });
      setEditingBank(null);
      setBankForm({ iban: '', bic: '', account_holder: '', bank_name: '', is_default: true });
    } catch (error) {
      console.error('Error updating bank account:', error);
    }
  };

  const handleEditBank = (bank: BankAccount) => {
    setEditingBank(bank);
    setBankForm({
      iban: bank.iban,
      bic: bank.bic || '',
      account_holder: bank.account_holder,
      bank_name: bank.bank_name || '',
      is_default: bank.is_default,
    });
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawalForm.amount);
    
    if (!amount || amount <= 0) {
      toast.error('Montant invalide');
      return;
    }

    if (!withdrawalForm.bankAccountId) {
      toast.error('Veuillez sélectionner un compte bancaire');
      return;
    }

    if (amount > (balance || 0)) {
      toast.error('Solde insuffisant');
      return;
    }

    try {
      await createWithdrawal.mutateAsync({
        amount,
        bankAccountId: withdrawalForm.bankAccountId,
      });
      setWithdrawalForm({ amount: '', bankAccountId: '' });
      setIsWithdrawing(false);
    } catch (error) {
      console.error('Error creating withdrawal:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'paid': return 'Payé';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Euro className="w-5 h-5 mr-2" />
            Mes revenus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Euro className="w-5 h-5 mr-2" />
            Mes revenus
          </div>
          <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">
            {(balance || 0).toFixed(2)} €
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Dialog open={isAddingBank} onOpenChange={setIsAddingBank}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <CreditCard className="w-4 h-4 mr-2" />
                Ajouter IBAN
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un compte bancaire</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="iban">IBAN *</Label>
                  <Input
                    id="iban"
                    placeholder="FR76 1234 5678 9012 3456 7890 123"
                    value={bankForm.iban}
                    onChange={(e) => setBankForm(prev => ({ ...prev, iban: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="bic">BIC</Label>
                  <Input
                    id="bic"
                    placeholder="BNPAFRPP"
                    value={bankForm.bic}
                    onChange={(e) => setBankForm(prev => ({ ...prev, bic: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="account_holder">Nom du titulaire *</Label>
                  <Input
                    id="account_holder"
                    placeholder="Prénom Nom"
                    value={bankForm.account_holder}
                    onChange={(e) => setBankForm(prev => ({ ...prev, account_holder: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="bank_name">Nom de la banque</Label>
                  <Input
                    id="bank_name"
                    placeholder="BNP Paribas"
                    value={bankForm.bank_name}
                    onChange={(e) => setBankForm(prev => ({ ...prev, bank_name: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddingBank(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddBankAccount} disabled={addBankAccount.isPending}>
                    {addBankAccount.isPending ? 'Ajout...' : 'Ajouter'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {bankAccounts && bankAccounts.length > 0 && (
            <Dialog open={isWithdrawing} onOpenChange={setIsWithdrawing}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={(balance || 0) <= 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Demande de retrait
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Demande de retrait</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Solde disponible: {(balance || 0).toFixed(2)} €</Label>
                  </div>
                  <div>
                    <Label htmlFor="amount">Montant à retirer *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      max={balance || 0}
                      placeholder="0.00"
                      value={withdrawalForm.amount}
                      onChange={(e) => setWithdrawalForm(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankAccount">Compte bancaire *</Label>
                    <Select 
                      value={withdrawalForm.bankAccountId} 
                      onValueChange={(value) => setWithdrawalForm(prev => ({ ...prev, bankAccountId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un compte" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankAccounts?.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.account_holder} - {account.iban.slice(-4)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsWithdrawing(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleWithdraw} disabled={createWithdrawal.isPending}>
                      {createWithdrawal.isPending ? 'Création...' : 'Créer la demande'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Comptes bancaires */}
        {bankAccounts && bankAccounts.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3">Mes comptes bancaires</h3>
            <div className="space-y-2">
              {bankAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{account.account_holder}</span>
                      {account.is_default && (
                        <Badge variant="secondary" className="text-xs">Par défaut</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {account.iban} • {account.bank_name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditBank(account)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteBankAccount.mutate(account.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dialog d'édition */}
        <Dialog open={!!editingBank} onOpenChange={(open) => !open && setEditingBank(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le compte bancaire</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_iban">IBAN *</Label>
                <Input
                  id="edit_iban"
                  value={bankForm.iban}
                  onChange={(e) => setBankForm(prev => ({ ...prev, iban: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_bic">BIC</Label>
                <Input
                  id="edit_bic"
                  value={bankForm.bic}
                  onChange={(e) => setBankForm(prev => ({ ...prev, bic: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_account_holder">Nom du titulaire *</Label>
                <Input
                  id="edit_account_holder"
                  value={bankForm.account_holder}
                  onChange={(e) => setBankForm(prev => ({ ...prev, account_holder: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_bank_name">Nom de la banque</Label>
                <Input
                  id="edit_bank_name"
                  value={bankForm.bank_name}
                  onChange={(e) => setBankForm(prev => ({ ...prev, bank_name: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingBank(null)}>
                  Annuler
                </Button>
                <Button onClick={handleUpdateBankAccount} disabled={updateBankAccount.isPending}>
                  {updateBankAccount.isPending ? 'Mise à jour...' : 'Mettre à jour'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Historique des demandes de retrait */}
        {withdrawalRequests && withdrawalRequests.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3">Mes demandes de retrait</h3>
            <div className="space-y-2">
              {withdrawalRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{request.amount.toFixed(2)} €</span>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {request.requested_at ? new Date(request.requested_at).toLocaleDateString('fr-FR') : 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message si aucun compte bancaire */}
        {(!bankAccounts || bankAccounts.length === 0) && (
          <div className="text-center py-6 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucun compte bancaire configuré</p>
            <p className="text-sm">Ajoutez votre IBAN pour pouvoir effectuer des retraits</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueManagementSection;