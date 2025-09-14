import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Upload } from "lucide-react";
import { useCreateContestation } from "@/hooks/useContestations";

interface ContestationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

const ContestationModal = ({ isOpen, onClose, order }: ContestationModalProps) => {
  const [raisonContestation, setRaisonContestation] = useState("");
  const [preuveInfluenceur, setPreuveInfluenceur] = useState("");
  
  const createContestation = useCreateContestation();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!raisonContestation.trim()) return;

    try {
      await createContestation.mutateAsync({
        orderId: order.id,
        raisonContestation,
        preuveInfluenceur: preuveInfluenceur || undefined,
      });
      onClose();
      setRaisonContestation("");
      setPreuveInfluenceur("");
    } catch (error) {
      console.error('Error creating contestation:', error);
    }
  };

  // Vérifier si 48h se sont écoulées depuis la livraison
  const canContest = order.status === 'delivered' && order.updated_at && 
    new Date().getTime() - new Date(order.updated_at).getTime() > 48 * 60 * 60 * 1000;

  if (!canContest) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Contestation non disponible
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Vous pouvez contester cette commande seulement après 48h de non-confirmation par le commerçant.
            </p>
            <Button onClick={onClose} variant="outline" className="w-full">
              Fermer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Contester la commande
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>Service:</strong> {order.offers?.title}</p>
            <p><strong>Montant:</strong> {order.total_amount}€</p>
            <p><strong>Commande:</strong> #{order.id.slice(0, 8)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="raison">Motif de la contestation *</Label>
            <Textarea
              id="raison"
              value={raisonContestation}
              onChange={(e) => setRaisonContestation(e.target.value)}
              placeholder="Expliquez pourquoi vous contestez cette commande..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preuve">Preuve (lien ou description)</Label>
            <Input
              id="preuve"
              value={preuveInfluenceur}
              onChange={(e) => setPreuveInfluenceur(e.target.value)}
              placeholder="Lien vers votre travail réalisé ou description détaillée..."
            />
            <p className="text-xs text-muted-foreground">
              Ajoutez un lien vers votre publication ou décrivez le travail effectué
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> Cette contestation sera examinée par notre équipe administrative. 
              Assurez-vous d'avoir fourni toutes les preuves nécessaires.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-amber-500 hover:bg-amber-600"
              disabled={!raisonContestation.trim() || createContestation.isPending}
            >
              <Upload className="w-4 h-4 mr-2" />
              {createContestation.isPending ? 'Envoi...' : 'Envoyer la contestation'}
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

export default ContestationModal;