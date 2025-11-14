import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Eye, Calendar, User, Euro } from "lucide-react";
import { useContestations, useUpdateContestationStatus } from "@/hooks/useContestations";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const ContestationsManagement = () => {
  const { contestations, isLoading } = useContestations(true); // Vue admin
  const updateContestationStatus = useUpdateContestationStatus();
  const [selectedContestation, setSelectedContestation] = useState<any>(null);
  const [adminDecision, setAdminDecision] = useState("");

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'bg-amber-100 text-amber-800';
      case 'validée': return 'bg-green-100 text-green-800';
      case 'refusée': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutText = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'validée': return 'Validée';
      case 'refusée': return 'Refusée';
      default: return statut;
    }
  };

  const handleDecision = async (contestationId: string, statut: 'validée' | 'refusée') => {
    if (!adminDecision.trim()) return;

    try {
      await updateContestationStatus.mutateAsync({
        contestationId,
        statut,
        adminDecision,
      });
      setSelectedContestation(null);
      setAdminDecision("");
    } catch (error) {
      console.error('Error updating contestation:', error);
    }
  };

  if (isLoading) {
    return <div className="p-6">Chargement des contestations...</div>;
  }

  const contestationsEnAttente = contestations?.filter(c => c.statut === 'en_attente') || [];
  const contestationsTraitees = contestations?.filter(c => c.statut !== 'en_attente') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des contestations</h2>
        <Badge variant="outline">
          {contestationsEnAttente.length} en attente
        </Badge>
      </div>

      {/* Contestations en attente */}
      {contestationsEnAttente.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-amber-600">Contestations en attente de traitement</h3>
          {contestationsEnAttente.map((contestation) => (
            <Card key={contestation.id} className="border-amber-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Contestation #{contestation.id.slice(0, 8)}
                  </CardTitle>
                  <Badge className={getStatutColor(contestation.statut)}>
                    {getStatutText(contestation.statut)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4" />
                      <span><strong>Influenceur:</strong> {contestation.order?.influencer?.first_name} {contestation.order?.influencer?.last_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4" />
                      <span><strong>Commerçant:</strong> {contestation.order?.merchant?.company_name || `${contestation.order?.merchant?.first_name} ${contestation.order?.merchant?.last_name}`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Euro className="w-4 h-4" />
                      <span><strong>Montant:</strong> {contestation.order?.total_amount}€</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span><strong>Contestée:</strong> {formatDistanceToNow(new Date(contestation.date_contestation), { addSuffix: true, locale: fr })}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Service:</strong> {contestation.order?.offers?.title}</p>
                    <p className="text-sm"><strong>Statut commande:</strong> {contestation.order?.status}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Motif de la contestation:</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{contestation.raison_contestation}</p>
                </div>

                {contestation.preuve_influenceur && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Preuve fournie:</p>
                    <p className="text-sm bg-blue-50 p-3 rounded-lg">{contestation.preuve_influenceur}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedContestation(contestation)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Traiter
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Contestations traitées */}
      {contestationsTraitees.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">Contestations traitées</h3>
          {contestationsTraitees.map((contestation) => (
            <Card key={contestation.id} className="opacity-75">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">#{contestation.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {contestation.order?.offers?.title} - {contestation.order?.total_amount}€
                    </p>
                  </div>
                  <Badge className={getStatutColor(contestation.statut)}>
                    {getStatutText(contestation.statut)}
                  </Badge>
                </div>
                {contestation.admin_decision && (
                  <p className="text-sm mt-2 text-muted-foreground">
                    <strong>Décision:</strong> {contestation.admin_decision}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de traitement */}
      {selectedContestation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Traiter la contestation #{selectedContestation.id.slice(0, 8)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><strong>Service:</strong> {selectedContestation.order?.offers?.title}</p>
                <p><strong>Motif:</strong> {selectedContestation.raison_contestation}</p>
                {selectedContestation.preuve_influenceur && (
                  <p><strong>Preuve:</strong> {selectedContestation.preuve_influenceur}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="decision">Votre décision administrative *</Label>
                <Textarea
                  id="decision"
                  value={adminDecision}
                  onChange={(e) => setAdminDecision(e.target.value)}
                  placeholder="Expliquez votre décision et les raisons..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleDecision(selectedContestation.id, 'validée')}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  disabled={!adminDecision.trim() || updateContestationStatus.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Valider la contestation
                </Button>
                <Button
                  onClick={() => handleDecision(selectedContestation.id, 'refusée')}
                  variant="destructive"
                  className="flex-1"
                  disabled={!adminDecision.trim() || updateContestationStatus.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Refuser la contestation
                </Button>
              </div>

              <Button
                onClick={() => {
                  setSelectedContestation(null);
                  setAdminDecision("");
                }}
                variant="outline"
                className="w-full"
              >
                Fermer
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {contestations?.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Aucune contestation pour le moment.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContestationsManagement;