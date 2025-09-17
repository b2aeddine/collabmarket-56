import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CreditCard, CheckCircle, AlertCircle, Clock, ExternalLink, Loader2, Building, RefreshCcw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useStripeConnect } from '@/hooks/useStripeConnect';
import { useStripeIdentity } from '@/hooks/useStripeIdentity';
import { useCheckStripeIdentityStatus } from '@/hooks/useCheckStripeIdentityStatus';
import { toast } from 'sonner';

const AccountSetupSection = () => {
  const { user, refreshUser } = useAuth();
  const { 
    accountStatus, 
    isLoadingStatus, 
    isLoading: stripeConnectLoading, 
    startOnboarding, 
    updateBankDetails, 
    refetchAccountStatus,
  } = useStripeConnect();
  const { createIdentitySession, isLoading: identityLoading } = useStripeIdentity();
  const { mutate: checkIdentityStatus, isPending: isCheckingIdentityStatus } = useCheckStripeIdentityStatus();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm] = useState({
    iban: '',
    accountHolder: '',
    country: 'FR'
  });
  const [isRefreshingConnect, setIsRefreshingConnect] = useState(false);

  // Gérer le retour de Stripe et les messages
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const setupParam = urlParams.get('setup');
    
    if (setupParam === 'complete') {
      toast.success('Configuration Stripe terminée avec succès !');
      // Rafraîchir les données
      setTimeout(async () => {
        await refreshUser();
      }, 1000);
      // Nettoyer l'URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (setupParam === 'refresh') {
      toast.error('Configuration incomplète, veuillez réessayer');
      // Nettoyer l'URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    // Vérifier le statut de vérification d'identité au retour de Stripe
    if (urlParams.get('verification') === 'complete') {
      setTimeout(async () => {
        await refreshUser();
      }, 2000);
    }
  }, [refreshUser]);

  // Rafraîchir les données utilisateur périodiquement
  useEffect(() => {
    if (!user || user.identity_status === 'verified') return;

    const interval = setInterval(async () => {
      const refreshedUser = await refreshUser();
      if (refreshedUser?.identity_status === 'verified') {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user?.identity_status, refreshUser]);

  // Gérer les statuts
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
      label: 'Configuration incomplète', 
      color: 'bg-orange-100 text-orange-800',
      icon: AlertCircle 
    };
  };

  const getStripeConnectStatus = () => {
    if (isLoadingStatus) {
      return {
        status: 'loading',
        label: 'Vérification...',
        color: 'bg-gray-100 text-gray-800',
        icon: Loader2
      };
    }

    if (!accountStatus?.hasAccount) {
      return {
        status: 'no_account',
        label: 'Configuration incomplète',
        color: 'bg-orange-100 text-orange-800',
        icon: AlertCircle
      };
    }

    if (!accountStatus.onboardingCompleted) {
      return {
        status: 'pending',
        label: 'Configuration incomplète',
        color: 'bg-orange-100 text-orange-800',
        icon: Clock
      };
    }

    if (accountStatus.onboardingCompleted && accountStatus.chargesEnabled) {
      return {
        status: 'active',
        label: 'Configuré',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle
      };
    }

    return {
      status: 'error',
      label: 'Problème détecté',
      color: 'bg-red-100 text-red-800',
      icon: AlertCircle
    };
  };

  // Handlers
  const handleStartVerification = async () => {
    try {
      await createIdentitySession();
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  const handleStartOnboarding = () => {
    startOnboarding('FR');
  };

  const handleRefreshConnectStatus = async () => {
    try {
      setIsRefreshingConnect(true);
      toast.info('Actualisation du statut Stripe Connect...');
      const result = await refetchAccountStatus();
      const data = result.data as any;
      if (data?.onboardingCompleted && data?.chargesEnabled) {
        toast.success('Compte Stripe configuré et activé ✅');
      } else if (data?.needsOnboarding || !data?.onboardingCompleted) {
        toast.warning('Configuration incomplète — poursuivez l’onboarding Stripe');
      } else {
        toast.success('Statut mis à jour');
      }
    } catch (error: any) {
      console.error('Refresh status error:', error);
      toast.error(error.message || 'Erreur lors de l’actualisation du statut');
    } finally {
      setIsRefreshingConnect(false);
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
  };

  const identityStatus = getIdentityStatus();
  const stripeConnectStatus = getStripeConnectStatus();

  // Vérifier si les deux sont complètement validés
  const isIdentityVerified = identityStatus.status === 'verified';
  const isStripeConnectActive = stripeConnectStatus.status === 'active';
  const bothValidated = isIdentityVerified && isStripeConnectActive;

  // Si les deux sont validés depuis plus de 24h, ne pas afficher la section
  if (bothValidated && user?.created_at) {
    const createdAt = new Date(user.created_at);
    const now = new Date();
    const timeDiff = now.getTime() - createdAt.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    if (hoursDiff > 24) {
      return null;
    }
  }

  // Si les deux ne sont pas encore validés, afficher la section
  if (!bothValidated) {
    return (
      <div className="space-y-6">
        {/* Header avec icônes */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Configuration du compte</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Points de navigation */}
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setCurrentSlide(0)}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentSlide === 0 ? 'bg-gradient-to-r from-pink-500 to-orange-500' : 'bg-gray-300'
            }`}
          />
          <button
            onClick={() => setCurrentSlide(1)}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentSlide === 1 ? 'bg-gradient-to-r from-pink-500 to-orange-500' : 'bg-gray-300'
            }`}
          />
        </div>

        {/* Slider Container */}
        <Card className="border-0 shadow-lg bg-white rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {/* Slide 1 - Configuration des paiements */}
                <div className="w-full flex-shrink-0 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-semibold text-gray-900">Configuration des paiements</h4>
                    <Badge className={`${stripeConnectStatus.color} px-3 py-1 rounded-full font-medium`}>
                      {stripeConnectStatus.label}
                    </Badge>
                  </div>

                  <div className="text-gray-600 mb-6">
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

                  {(!accountStatus?.hasAccount || !accountStatus?.onboardingCompleted) && (
                    <div className="space-y-3">
                      <Button 
                        onClick={handleStartOnboarding}
                        disabled={stripeConnectLoading}
                        className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-medium py-3 rounded-lg"
                      >
                        {stripeConnectLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <ExternalLink className="w-4 h-4 mr-2" />
                        )}
                        Finaliser la configuration
                      </Button>
                      <Button 
                        onClick={handleRefreshConnectStatus}
                        variant="outline"
                        disabled={isRefreshingConnect || isLoadingStatus}
                        className="w-full"
                      >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        {isRefreshingConnect ? 'Actualisation...' : 'Actualiser le statut'}
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
                    <form onSubmit={handleBankFormSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50 mt-4">
                      <div>
                        <label htmlFor="accountHolder" className="block text-sm font-medium text-gray-700 mb-1">
                          Nom du titulaire du compte
                        </label>
                        <input
                          id="accountHolder"
                          type="text"
                          value={bankForm.accountHolder}
                          onChange={(e) => setBankForm(prev => ({ ...prev, accountHolder: e.target.value }))}
                          placeholder="John Doe"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="iban" className="block text-sm font-medium text-gray-700 mb-1">
                          IBAN
                        </label>
                        <input
                          id="iban"
                          type="text"
                          value={bankForm.iban}
                          onChange={(e) => setBankForm(prev => ({ ...prev, iban: e.target.value.toUpperCase() }))}
                          placeholder="FR76 3000 3000 0100 0000 0000 051"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={stripeConnectLoading}>
                          {stripeConnectLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
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
                </div>

                {/* Slide 2 - Vérification d'identité */}
                <div className="w-full flex-shrink-0 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-semibold text-gray-900">Vérification d'identité</h4>
                    <Badge className={`${identityStatus.color} px-3 py-1 rounded-full font-medium`}>
                      {identityStatus.label}
                    </Badge>
                  </div>

                  <div className="text-gray-600 mb-6">
                    {identityStatus.status === 'not_started' && (
                      <p>
                        Votre vérification d'identité est en attente. Finalisez le processus de vérification
                        pour activer pleinement votre compte.
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

                  {(identityStatus.status === 'not_started' || identityStatus.status === 'requires_input') && (
                    <Button
                      onClick={handleStartVerification}
                      disabled={identityLoading}
                      className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-medium py-3 rounded-lg mb-6"
                    >
                      {identityLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ExternalLink className="w-4 h-4 mr-2" />
                      )}
                      {identityStatus.status === 'requires_input' ? 'Continuer la vérification' : 'Vérifier mon identité'}
                    </Button>
                  )}

                  {identityStatus.status === 'not_started' && (
                    <div className="text-sm text-gray-500">
                      <p className="font-medium mb-2">Documents acceptés :</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Carte d'identité (recto/verso)</li>
                        <li>Passeport</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si les deux sont validés mais depuis moins de 24h, afficher un message de confirmation
  return (
    <Card className="border-0 shadow-lg bg-green-50 rounded-xl mb-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 text-green-800">
          <CheckCircle className="w-6 h-6" />
          <div>
            <h3 className="text-lg font-semibold">Configuration terminée !</h3>
            <p className="text-sm text-green-700">
              Votre compte est maintenant entièrement configuré et prêt à recevoir des paiements.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSetupSection;