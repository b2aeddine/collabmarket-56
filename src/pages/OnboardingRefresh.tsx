import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { useEffect } from "react";

const OnboardingRefresh = () => {
  const { startOnboarding, isLoading } = useStripeConnect();

  useEffect(() => {
    // No auto-redirect; let the user explicitly retry
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
      <Header />
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-xl">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Reprendre la configuration Stripe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Vous avez interrompu l’onboarding Stripe. Cliquez ci-dessous pour reprendre la configuration de votre compte.
              </p>
              <Button onClick={() => startOnboarding()} disabled={isLoading}>
                {isLoading ? 'Redirection...' : 'Reprendre l’onboarding'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OnboardingRefresh;
