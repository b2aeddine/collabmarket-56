import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCheckStripeConnectStatus } from "@/hooks/useCheckStripeConnectStatus";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OnboardingRefresh = () => {
  const { mutate: checkStatus, isPending } = useCheckStripeConnectStatus();
  const [status, setStatus] = useState<'checking' | 'success' | 'error' | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier automatiquement le statut au retour de Stripe
    console.log('🔄 Auto-checking Stripe status on return from Stripe...');
    setStatus('checking');
    
    // Attendre un peu pour que Stripe finisse de traiter
    const timer = setTimeout(() => {
      checkStatus(undefined, {
        onSuccess: (data) => {
          console.log('✅ Status check successful:', data);
          setStatus('success');
          // Rediriger après 2 secondes pour que l'utilisateur voie le succès
          setTimeout(() => {
            navigate('/influencer-dashboard');
          }, 2000);
        },
        onError: (error) => {
          console.error('❌ Status check failed:', error);
          setStatus('error');
        }
      });
    }, 1000); // Attendre 1 seconde après l'arrivée sur la page

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleRetry = () => {
    setStatus('checking');
    checkStatus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
      <Header />
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-xl">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Vérification du compte Stripe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {status === 'checking' && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-muted-foreground text-center">
                    Vérification de la configuration de votre compte Stripe Connect...
                  </p>
                </div>
              )}
              
              {status === 'success' && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                  <p className="text-green-700 font-medium text-center">
                    ✅ Configuration vérifiée avec succès !
                  </p>
                  <p className="text-sm text-muted-foreground text-center">
                    Redirection vers votre tableau de bord...
                  </p>
                </div>
              )}
              
              {status === 'error' && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <XCircle className="w-12 h-12 text-red-500" />
                  <p className="text-red-700 font-medium text-center">
                    ❌ Erreur lors de la vérification
                  </p>
                  <p className="text-sm text-muted-foreground text-center">
                    Une erreur est survenue. Vous pouvez réessayer ou revenir au tableau de bord.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate('/influencer-dashboard')}>
                      Retour au tableau de bord
                    </Button>
                    <Button onClick={handleRetry} disabled={isPending}>
                      {isPending ? 'Vérification...' : 'Réessayer'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OnboardingRefresh;
