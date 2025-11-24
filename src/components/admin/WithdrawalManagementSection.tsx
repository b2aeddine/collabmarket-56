import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Euro, Check, X, Clock } from "lucide-react";
import { useAdminWithdrawals } from "@/hooks/useWithdrawals";

const WithdrawalManagementSection = () => {
  const { withdrawalRequests, isLoading, updateWithdrawalStatus } = useAdminWithdrawals();
  const [selectedRequest, setSelectedRequest] = useState<{ id: string; amount: number; status: string; influencer_id: string } | null>(null);
  const [processingStatus, setProcessingStatus] = useState<'approved' | 'rejected' | 'paid'>('approved');
  const [adminNotes, setAdminNotes] = useState('');

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <Check className="w-4 h-4" />;
      case 'paid': return <Check className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;

    try {
      await updateWithdrawalStatus.mutateAsync({
        id: selectedRequest.id,
        status: processingStatus,
        adminNotes: adminNotes || undefined,
      });
      
      setSelectedRequest(null);
      setAdminNotes('');
      setProcessingStatus('approved');
    } catch (error) {
      console.error('Error updating withdrawal status:', error);
    }
  };

  const openProcessDialog = (request: { id: string; amount: number; status: string; influencer_id: string; admin_notes?: string }) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
    setProcessingStatus(request.status === 'pending' ? 'approved' : request.status);
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Euro className="w-5 h-5 mr-2" />
            Gestion des retraits
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

  const pendingCount = withdrawalRequests?.filter(r => r.status === 'pending').length || 0;
  const totalPendingAmount = withdrawalRequests
    ?.filter(r => r.status === 'pending')
    ?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Euro className="w-5 h-5 mr-2" />
            Gestion des retraits
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-yellow-100 text-yellow-800">
              {pendingCount} en attente
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              {totalPendingAmount.toFixed(2)} € à traiter
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!withdrawalRequests || withdrawalRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Euro className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune demande de retrait</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Influenceur</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>IBAN</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawalRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {request.profiles?.first_name} {request.profiles?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.profiles?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {Number(request.amount).toFixed(2)} €
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {request.bank_accounts?.account_holder}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.bank_accounts?.iban}
                        </div>
                        {request.bank_accounts?.bank_name && (
                          <div className="text-xs text-gray-400">
                            {request.bank_accounts.bank_name}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(request.requested_at).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(request.requested_at).toLocaleTimeString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{getStatusLabel(request.status)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openProcessDialog(request)}
                          >
                            Traiter
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Traiter la demande de retrait</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                              <div><strong>Influenceur:</strong> {request.profiles?.first_name} {request.profiles?.last_name}</div>
                              <div><strong>Email:</strong> {request.profiles?.email}</div>
                              <div><strong>Montant:</strong> {Number(request.amount).toFixed(2)} €</div>
                              <div><strong>IBAN:</strong> {request.bank_accounts?.iban}</div>
                              <div><strong>Titulaire:</strong> {request.bank_accounts?.account_holder}</div>
                              {request.bank_accounts?.bic && (
                                <div><strong>BIC:</strong> {request.bank_accounts.bic}</div>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor="status">Nouveau statut</Label>
                              <Select 
                                value={processingStatus} 
                                onValueChange={(value: 'approved' | 'rejected' | 'paid') => setProcessingStatus(value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="approved">Approuver</SelectItem>
                                  <SelectItem value="rejected">Rejeter</SelectItem>
                                  <SelectItem value="paid">Marquer comme payé</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="notes">Notes administratives</Label>
                              <Textarea
                                id="notes"
                                placeholder="Ajouter des notes (optionnel)"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                rows={3}
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                                Annuler
                              </Button>
                              <Button 
                                onClick={handleUpdateStatus}
                                disabled={updateWithdrawalStatus.isPending}
                              >
                                {updateWithdrawalStatus.isPending ? 'Traitement...' : 'Confirmer'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WithdrawalManagementSection;