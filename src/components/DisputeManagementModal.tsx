
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useResolveDispute } from "@/hooks/useDisputes";

interface DisputeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispute: any;
}

const DisputeManagementModal = ({ isOpen, onClose, dispute }: DisputeManagementModalProps) => {
  const [resolution, setResolution] = useState("");
  const [orderStatus, setOrderStatus] = useState<'completed' | 'cancelled'>('completed');
  const { toast } = useToast();
  const resolveDispute = useResolveDispute();

  if (!isOpen || !dispute) return null;

  const handleResolveDispute = async () => {
    if (!resolution.trim()) {
      toast({
        title: "Résolution requise",
        description: "Veuillez décrire la résolution du litige.",
        variant: "destructive"
      });
      return;
    }

    try {
      await resolveDispute.mutateAsync({
        disputeId: dispute.id,
        resolution,
        orderStatus
      });
      
      toast({
        title: "Litige résolu",
        description: "Le litige a été résolu avec succès.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de résoudre le litige.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Gestion du litige
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informations de la commande */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Détails de la commande</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Service:</strong> {dispute.order?.offers?.title}</p>
                <p><strong>Montant:</strong> {dispute.order?.total_amount}€</p>
                <p><strong>Commande:</strong> #{dispute.order?.id?.slice(0, 8)}</p>
              </div>
              <div>
                <p><strong>Commerçant:</strong> {dispute.order?.merchant?.first_name} {dispute.order?.merchant?.last_name}</p>
                <p><strong>Influenceur:</strong> {dispute.order?.influencer?.first_name} {dispute.order?.influencer?.last_name}</p>
                <p><strong>Statut:</strong> 
                  <Badge className="ml-2 bg-red-100 text-red-800">
                    {dispute.order?.status}
                  </Badge>
                </p>
              </div>
            </div>
          </div>

          {/* Description du litige */}
          <div>
            <h3 className="font-semibold mb-2">Description du litige</h3>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-gray-700">{dispute.description}</p>
              <p className="text-xs text-gray-500 mt-2">
                Créé le {new Date(dispute.date_opened).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          {/* Actions de résolution */}
          <div className="space-y-4">
            <h3 className="font-semibold">Résolution du litige</h3>
            
            <div>
              <Label className="text-sm font-medium">Décision sur la commande</Label>
              <RadioGroup value={orderStatus} onValueChange={(value: 'completed' | 'cancelled') => setOrderStatus(value)} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completed" id="completed" />
                  <Label htmlFor="completed" className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Confirmer la commande comme terminée
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cancelled" id="cancelled" />
                  <Label htmlFor="cancelled" className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Annuler la commande
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium">Commentaire de résolution</Label>
              <Textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Expliquez votre décision et les raisons..."
                className="mt-2 min-h-[100px]"
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3">
            <Button
              onClick={handleResolveDispute}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
              disabled={resolveDispute.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Résoudre le litige
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DisputeManagementModal;
