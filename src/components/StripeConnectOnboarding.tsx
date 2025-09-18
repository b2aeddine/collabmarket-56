import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ExternalLink,
  Building,
  Loader2,
  Euro,
  Info,
  RefreshCcw
} from 'lucide-react';
import { useStripeConnect } from '@/hooks/useStripeConnect';

const StripeConnectOnboarding = () => {
  const { 
    accountStatus, 
    isLoadingStatus, 
    isLoading, 
    startOnboarding, 
    updateBankDetails, 
    refetchAccountStatus 
  } = useStripeConnect();

  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm] = useState({
    iban: '',
    accountHolder: '',
    country: 'FR'
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getStatusInfo = () => {
    if (isLoadingStatus) {
      return {
        status: 'loading',
        label: 'Vérification...',
        color: 'bg-gray-100 text-gray-800',
        icon: <Loader2 className="w-4 h-4 animate-spin" />
      };
    }

    if (!accountStatus?.hasAccount) {
      return {
        status: 'no_account',
        label: 'Configuration incomplète',
        color: 'bg-orange-100 text-orange-800',
        icon: <AlertCircle className="w-4 h-4" />
      };
    }

    if (!accountStatus.onboardingCompleted) {
      return {
        status: 'pending',
        label: 'Configuration incomplète',
        color: 'bg-orange-100 text-orange-800',
        icon: <Clock className="w-4 h-4" />
      };
    }

    if (accountStatus.onboardingCompleted && accountStatus.chargesEnabled) {
      return {
        status: 'active',
        label: 'Configuré',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="w-4 h-4" />
      };
    }

    return {
      status: 'error',
      label: 'Problème détecté',
      color: 'bg-red-100 text-red-800',
      icon: <AlertCircle className="w-4 h-4" />
    };
  };

  const statusInfo = getStatusInfo();

  const handleStartOnboarding = () => {
    startOnboarding('FR');
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refetchAccountStatus();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBankFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.iban || !bankForm.accountHolder) {
      return;
    }
    
    await updateBankDetails(bankForm);
    setShowBankForm(false);
    setBankForm({ iban: '', accountHolder: '', country: 'FR' });
  };

  return (
    <Card className="border-0 shadow-lg bg-white rounded-xl">
      <CardContent className="p-6 space-y-6">
        {/* Header with title and status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Configuration des paiements</h3>
          </div>
          <Badge className={`${statusInfo.color} px-3 py-1 rounded-full font-medium`}>
            {statusInfo.label}
          </Badge>
        </div>

        {/* Description */}
        <div className="text-gray-600">
          {!accountStatus?.hasAccount && (
            <p>Votre compte Stripe Connect est créé mais la configuration n'est pas terminée. Finalisez la configuration pour recevoir des paiements.</p>
          )}
          {accountStatus?.hasAccount && !accountStatus.onboardingCompleted && (
            <p>Votre compte Stripe Connect est créé mais la configuration n'est pas terminée. Finalisez la configuration pour recevoir des paiements.</p>
          )}
          {accountStatus?.onboardingCompleted && accountStatus.chargesEnabled && (
            <p>Votre compte Stripe Connect est entièrement configuré et prêt à recevoir des paiements.</p>
          )}
        </div>

        {/* Action Button */}
        {(!accountStatus?.hasAccount || !accountStatus?.onboardingCompleted) && (
          <div className="space-y-3">
            <Button 
              onClick={handleStartOnboarding}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-medium py-3 rounded-lg"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              Finaliser la configuration
            </Button>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              disabled={isRefreshing || isLoadingStatus}
              className="w-full"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              {isRefreshing ? 'Actualisation...' : 'Actualiser le statut'}
            </Button>
          </div>
        )}

        {accountStatus?.hasAccount && accountStatus?.onboardingCompleted && !showBankForm && (
          <Button 
            onClick={() => setShowBankForm(true)}
            variant="outline"
            className="w-full"
          >
            <Building className="w-4 h-4 mr-2" />
            {accountStatus.hasExternalAccount ? 'Modifier l\'IBAN' : 'Ajouter un IBAN'}
          </Button>
        )}

        {/* Bank Account Form */}
        {showBankForm && (
          <form onSubmit={handleBankFormSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <div>
              <Label htmlFor="accountHolder">Nom du titulaire du compte</Label>
              <Input
                id="accountHolder"
                value={bankForm.accountHolder}
                onChange={(e) => setBankForm(prev => ({ ...prev, accountHolder: e.target.value }))}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                value={bankForm.iban}
                onChange={(e) => setBankForm(prev => ({ ...prev, iban: e.target.value.toUpperCase() }))}
                placeholder="FR76 3000 3000 0100 0000 0000 051"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Enregistrer
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowBankForm(false)}
              >
                Annuler
              </Button>
            </div>
          </form>
        )}

        {/* Requirements */}
        {accountStatus?.requirementsNeeded && accountStatus.requirementsNeeded.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">Informations requises :</div>
              <ul className="list-disc list-inside text-sm space-y-1">
                {accountStatus.requirementsNeeded.map((req: string, index: number) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default StripeConnectOnboarding;