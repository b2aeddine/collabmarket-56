import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const PaymentStatusAlert = () => {
  const { user } = useAuth();
  const [pendingPaymentOrders, setPendingPaymentOrders] = useState<any[]>([]);
  const [isRecovering, setIsRecovering] = useState(false);

  const checkPendingPayments = async () => {
    if (!user) return;

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        offers(title),
        influencer:profiles!orders_influencer_id_fkey(first_name, last_name)
      `)
      .eq("merchant_id", user.id)
      .eq("status", "pending_payment")
      .is("webhook_received_at", null);

    if (!error && orders) {
      setPendingPaymentOrders(orders);
    }
  };

  const handleRecoverPayments = async () => {
    setIsRecovering(true);
    try {
      const { data, error } = await supabase.functions.invoke("recover-payments");
      
      if (error) throw error;
      
      if (data.recovered_orders > 0) {
        toast.success(`${data.recovered_orders} commande(s) récupérée(s) !`);
        checkPendingPayments(); // Refresh la liste
      } else {
        toast.info("Aucune commande à récupérer trouvée.");
      }
    } catch (error) {
      console.error("Error recovering payments:", error);
      toast.error("Erreur lors de la récupération des paiements");
    } finally {
      setIsRecovering(false);
    }
  };

  useEffect(() => {
    checkPendingPayments();
    
    // Vérifier toutes les 30 secondes
    const interval = setInterval(checkPendingPayments, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  if (pendingPaymentOrders.length === 0) return null;

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <strong className="text-amber-800">
            {pendingPaymentOrders.length} commande(s) en cours de traitement
          </strong>
          <p className="text-sm text-amber-700 mt-1">
            Ces commandes ont été payées mais ne sont pas encore confirmées. 
            Cela peut prendre quelques minutes.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRecoverPayments}
          disabled={isRecovering}
          className="ml-4 border-amber-300 text-amber-700 hover:bg-amber-100"
        >
          {isRecovering ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Actualiser
        </Button>
      </AlertDescription>
    </Alert>
  );
};