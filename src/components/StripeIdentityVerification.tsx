import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertCircle, CheckCircle, ExternalLink, Loader2, Clock } from "lucide-react";
import { useStripeIdentity } from "@/hooks/useStripeIdentity";
import { useCheckStripeIdentityStatus } from "@/hooks/useCheckStripeIdentityStatus";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const StripeIdentityVerification = () => {
  const { createIdentitySession, isLoading } = useStripeIdentity();
  const { mutate: _checkStatus, isPending: _isCheckingStatus } = useCheckStripeIdentityStatus();
  const { user, refreshUser } = useAuth();

  // Vérifier le statut de vérification au retour de Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verification') === 'complete') {
      // L'utilisateur revient de Stripe, attendre et rafraîchir
      setTimeout(async () => {
        await refreshUser();
      }, 2000); // Attendre 2 secondes que le webhook soit traité
    }
  }, [refreshUser, user]);

  // Rafraîchir les données utilisateur périodiquement pour détecter les changements
  useEffect(() => {
    if (!user || user.identity_status === 'verified') return;

    const interval = setInterval(async () => {
      const refreshedUser = await refreshUser();
      // Si l'utilisateur est maintenant vérifié, arrêter le polling
      if (refreshedUser?.identity_status === 'verified') {
        clearInterval(interval);
      }
    }, 3000); // Vérifier toutes les 3 secondes

    return () => clearInterval(interval);
  }, [user, refreshUser]);

  const getIdentityStatus = () => {
    const identityStatus = user?.identity_status || 'pending';
    const stripeStatus = user?.stripe_identity_status || 'not_started';

    if (identityStatus === 'verified') {
      return { 
        status: 'verified', 
        label: 'Vérifiée', 
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle 
      };
    }

    if (stripeStatus === 'requires_input') {
      return { 
        status: 'requires_input', 
        label: 'En attente de vérification', 
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock 
      };
    }

    if (stripeStatus === 'processing') {
      return { 
        status: 'processing', 
        label: 'Vérification en cours', 
        color: 'bg-blue-100 text-blue-800',
        icon: Clock 
      };
    }

    return { 
      status: 'not_started', 
      label: 'Non vérifiée', 
      color: 'bg-orange-100 text-orange-800',
      icon: AlertCircle 
    };
  };

  const handleStartVerification = async () => {
    try {
      await createIdentitySession();
    } catch (error) {
      // L'erreur est déjà gérée dans le hook useStripeIdentity
      console.error('Verification error:', error);
    }
  };

  const _handleCheckStatus = () => {
    _checkStatus(undefined, {
      onSuccess: () => {
        // Rafraîchir les données utilisateur après vérification du statut
        refreshUser();
      }
    });
  };

  const identityStatus = getIdentityStatus();
  const _StatusIcon = identityStatus.icon;

  return (
    <Card className="border-0 shadow-lg bg-white rounded-xl">
      <CardContent className="p-6 space-y-6">
        {/* Header with title and status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Vérification d'identité</h3>
          </div>
          <Badge className={`${identityStatus.color} px-3 py-1 rounded-full font-medium`}>
            {identityStatus.label}
          </Badge>
        </div>

        {/* Description */}
        <div className="text-gray-600">
          {identityStatus.status === 'not_started' && (
            <p>
              Vérifiez votre identité pour finaliser votre compte et recevoir des paiements.
              Vous pouvez utiliser votre carte d'identité, passeport, permis de conduire ou carte de séjour.
            </p>
          )}
          
          {identityStatus.status === 'requires_input' && (
            <p>
              Votre vérification d'identité est en attente. Finalisez le processus de vérification
              pour activer pleinement votre compte.
            </p>
          )}
          
          {identityStatus.status === 'processing' && (
            <p>
              Votre vérification d'identité est en cours de traitement. 
              Nous vous notifierons une fois la vérification terminée.
            </p>
          )}
          
          {identityStatus.status === 'verified' && (
            <p>
              Votre identité a été vérifiée avec succès. Votre compte est maintenant
              entièrement activé pour recevoir des paiements.
            </p>
          )}
        </div>

        {/* Action Button */}
        {(identityStatus.status === 'not_started' || identityStatus.status === 'requires_input') && (
          <Button
            onClick={handleStartVerification}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-medium py-3 rounded-lg"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4 mr-2" />
            )}
            {identityStatus.status === 'requires_input' ? 'Continuer la vérification' : 'Vérifier mon identité'}
          </Button>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <p><strong>Documents acceptés :</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Carte d'identité (recto/verso)</li>
            <li>Passeport</li>
            <li>Permis de conduire</li>
            <li>Carte de séjour</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default StripeIdentityVerification;