
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import DisputeManagementModal from "@/components/DisputeManagementModal";
import { AlertTriangle, Calendar, User, ShoppingBag } from "lucide-react";
import { useDisputes } from "@/hooks/useDisputes";

const AdminDisputes = () => {
  const { disputes, isLoading } = useDisputes();
  const [selectedDispute, setSelectedDispute] = useState(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "resolved": return "Résolu";
      case "pending": return "En attente";
      case "rejected": return "Rejeté";
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  const pendingDisputes = disputes?.filter(d => d.status === 'pending') || [];
  const resolvedDisputes = disputes?.filter(d => d.status === 'resolved') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-gradient">
            Gestion des litiges
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Arbitrage des conflits entre commerçants et influenceurs
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{pendingDisputes.length}</p>
                <p className="text-sm text-gray-600">En attente</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{resolvedDisputes.length}</p>
                <p className="text-sm text-gray-600">Résolus</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{disputes?.length || 0}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Disputes */}
        {pendingDisputes.length > 0 && (
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Litiges en attente ({pendingDisputes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingDisputes.map((dispute) => (
                  <div key={dispute.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(dispute.status)}>
                            {getStatusText(dispute.status)}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            #{dispute.order?.id?.slice(0, 8)}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold text-gray-800 mb-2">
                          {dispute.order?.offers?.title}
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>Commerçant: {dispute.order?.merchant?.first_name} {dispute.order?.merchant?.last_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>Influenceur: {dispute.order?.influencer?.first_name} {dispute.order?.influencer?.last_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" />
                            <span>Montant: {dispute.order?.total_amount}€</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Créé le {new Date(dispute.date_opened).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3">
                          <strong>Motif:</strong> {dispute.description}
                        </p>
                      </div>
                      
                      <Button
                        onClick={() => setSelectedDispute(dispute)}
                        className="bg-blue-500 hover:bg-blue-600 shrink-0"
                      >
                        Gérer le litige
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resolved Disputes */}
        {resolvedDisputes.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <AlertTriangle className="w-5 h-5" />
                Litiges résolus ({resolvedDisputes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resolvedDisputes.map((dispute) => (
                  <div key={dispute.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(dispute.status)}>
                            {getStatusText(dispute.status)}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            #{dispute.order?.id?.slice(0, 8)}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold text-gray-800 mb-2">
                          {dispute.order?.offers?.title}
                        </h3>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Résolution:</strong> {dispute.resolution}
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Résolu le {dispute.resolved_at ? new Date(dispute.resolved_at).toLocaleDateString('fr-FR') : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {disputes?.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center text-gray-500">
              Aucun litige trouvé
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de gestion des litiges */}
      {selectedDispute && (
        <DisputeManagementModal
          isOpen={!!selectedDispute}
          onClose={() => setSelectedDispute(null)}
          dispute={selectedDispute}
        />
      )}
    </div>
  );
};

export default AdminDisputes;
