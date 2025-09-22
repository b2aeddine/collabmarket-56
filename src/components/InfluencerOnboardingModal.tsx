import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CreditCard, CheckCircle, ExternalLink } from "lucide-react";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InfluencerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfluencerOnboardingModal = ({ isOpen, onClose }: InfluencerOnboardingModalProps) => {
  const { accountStatus, isLoading, startOnboarding } = useStripeConnect();
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (accountStatus?.onboardingCompleted && accountStatus?.payoutsEnabled) {
      setStep(3); // Configuration terminée
    } else if (accountStatus?.hasAccount) {
      setStep(2); // Compte créé, onboarding en cours
    } else {
      setStep(1); // Pas de compte
    }
  }, [accountStatus]);

  const handleStartOnboarding = async () => {
    await startOnboarding('FR');
  };

  const handleSkip = () => {
    // Permettre de passer temporairement, mais notifier l'utilisateur
    localStorage.setItem('stripe_onboarding_skipped', 'true');
    onClose();
  };

  const isConfigurationComplete = accountStatus?.onboardingCompleted && accountStatus?.payoutsEnabled;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <CreditCard className="w-5 h-5" />
            Configuration des paiements
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Étape 1: Information */}
          {step === 1 && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Configuration obligatoire :</strong> Pour recevoir des paiements sur Collabmarket, 
                  vous devez configurer votre compte Stripe Connect.
                </AlertDescription>
              </Alert>

              <Card className="bg-gradient-to-r from-pink-50 to-orange-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Que devez-vous fournir ?</h3>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Informations personnelles (nom, adresse)</li>
                    <li>• Pièce d'identité</li>
                    <li>• Coordonnées bancaires (IBAN)</li>
                    <li>• Informations fiscales</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  onClick={handleStartOnboarding}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Commencer la configuration
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="flex-1"
                >
                  Passer temporairement
                </Button>
              </div>
            </div>
          )}

          {/* Étape 2: Configuration en cours */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Configuration incomplète</h3>
                <p className="text-sm text-gray-600">
                  Votre compte Stripe Connect est créé mais la configuration n'est pas terminée.
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Vous devez finaliser votre configuration Stripe pour pouvoir recevoir des paiements.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  onClick={handleStartOnboarding}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Finaliser la configuration
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Plus tard
                </Button>
              </div>
            </div>
          )}

          {/* Étape 3: Configuration terminée */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Configuration terminée !</h3>
                <p className="text-sm text-gray-600">
                  Votre compte Stripe Connect est maintenant configuré. Vous pouvez recevoir des paiements.
                </p>
              </div>

              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
              >
                Continuer vers le dashboard
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfluencerOnboardingModal;