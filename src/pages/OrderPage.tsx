import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import { Loader2, AlertCircle } from "lucide-react";
import { useDirectPayment } from "@/hooks/useDirectPayment";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { OrderSkeleton } from "@/components/order/OrderSkeleton";
import { OrderSummary } from "@/components/order/OrderSummary";
import { BrandInfoSection } from "@/components/order/BrandInfoSection";
import { CampaignDetailsSection } from "@/components/order/CampaignDetailsSection";
import { FileUploadSection } from "@/components/order/FileUploadSection";
import { PaymentMethodSection } from "@/components/order/PaymentMethodSection";
import { useOrderData } from "@/hooks/useOrderData";
import { orderPaymentSchema } from "@/utils/validation";

const OrderPage = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();

  const { offerId, influencerId } = useMemo(() => {
    const offerId = params.serviceId;
    const influencerId = searchParams.get("influencer");
    return { offerId, influencerId };
  }, [params.serviceId, searchParams]);

  const directPayment = useDirectPayment();
  const { orderData, handleInputChange, handlePaymentMethodChange, handleCheckboxChange, handleFilesChange } = useOrderData();

  const [offer, setOffer] = useState<{
    id: string;
    price: number;
    title: string;
    description: string;
    delivery_time: string;
    influencer_id: string;
  } | null>(null);
  const [influencer, setInfluencer] = useState<{
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    custom_username?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pricingData = useMemo(() => {
    if (!offer) return null;

    const totalPrice = Number(offer.price);
    const serviceFee = Math.round(totalPrice * 0.10);
    const finalTotal = totalPrice + serviceFee;
    const netAmount = totalPrice * 0.9; // 90% goes to influencer after 10% commission

    return { totalPrice, serviceFee, finalTotal, netAmount };
  }, [offer]);

  const fetchData = useCallback(async () => {
    if (!offerId || !influencerId || offerId === 'undefined' || influencerId === 'undefined') {
      setError("Paramètres d'URL manquants ou invalides");
      setIsLoading(false);
      return;
    }

    try {
      const [offerResponse, influencerResponse] = await Promise.all([
        supabase
          .from('offers')
          .select('*')
          .eq('id', offerId)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('*')
          .eq('id', influencerId)
          .maybeSingle()
      ]);

      if (offerResponse.error) {
        throw new Error(`Erreur lors de la récupération de l'offre: ${offerResponse.error.message}`);
      }

      if (!offerResponse.data) {
        throw new Error('Offre non trouvée');
      }

      if (influencerResponse.error) {
        throw new Error(`Erreur lors de la récupération de l'influenceur: ${influencerResponse.error.message}`);
      }

      if (!influencerResponse.data) {
        throw new Error('Influenceur non trouvé');
      }

      if (offerResponse.data.influencer_id !== influencerId) {
        throw new Error('Cette offre ne correspond pas à cet influenceur');
      }

      setOffer(offerResponse.data);
      setInfluencer(influencerResponse.data);
      setError(null);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des données';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [offerId, influencerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data with Zod schema
    const validationResult = orderPaymentSchema.safeParse(orderData);

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    if (!offer || !influencer || !pricingData) {
      toast.error("Données manquantes, veuillez recharger la page");
      return;
    }

    try {
      // Direct payment with authorization (no order creation first)
      await directPayment.mutateAsync({
        influencerId: influencerId || "",
        offerId: offerId || "",
        amount: pricingData.finalTotal,
        brandName: validationResult.data.brandName,
        productName: validationResult.data.productName,
        brief: validationResult.data.brief,
        deadline: validationResult.data.deadline,
        requirements: validationResult.data.requirements,
      });

    } catch (_error) {
      // Error handling is done in the hook
    }
  }, [orderData, offer, influencer, pricingData, influencerId, offerId, directPayment]);

  // Show loading skeleton while fetching data
  if (isLoading) {
    return (
      <>
        <Header />
        <OrderSkeleton />
      </>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
        <Header />
        <div className="py-6 sm:py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col justify-center items-center min-h-[300px] sm:min-h-[400px] space-y-4 sm:space-y-6">
              <div className="text-center max-w-md px-4">
                <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-3 sm:mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-2 sm:mb-3">Erreur de chargement</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{error}</p>
                <div className="space-y-2 sm:space-y-3">
                  <Button onClick={() => window.location.reload()} className="w-full text-sm sm:text-base">
                    Recharger la page
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="w-full text-sm sm:text-base"
                  >
                    Retour à la page précédente
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if data is missing
  if (!offer || !influencer || !pricingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
        <Header />
        <div className="py-6 sm:py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col justify-center items-center min-h-[300px] sm:min-h-[400px] space-y-4 sm:space-y-6">
              <div className="text-center max-w-md px-4">
                <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-3 sm:mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-2 sm:mb-3">Données manquantes</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Impossible de récupérer les informations de la commande.
                </p>
                <div className="space-y-2 sm:space-y-3">
                  <Button onClick={() => window.location.reload()} className="w-full text-sm sm:text-base">
                    Recharger la page
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="w-full text-sm sm:text-base"
                  >
                    Retour à la page précédente
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isSubmitting = directPayment.isPending;

  // Main content when data is loaded successfully
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
      <Header />

      <div className="py-6 sm:py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24">
                <OrderSummary
                  offer={offer}
                  influencer={influencer}
                  pricingData={pricingData}
                />
              </div>
            </div>

            <div className="lg:col-span-2 order-1 lg:order-2">
              <Card className="shadow-xl border-0 animate-fade-in">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-xl sm:text-2xl">Commander une collaboration</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <BrandInfoSection
                      brandName={orderData.brandName}
                      productName={orderData.productName}
                      onInputChange={handleInputChange}
                    />

                    <CampaignDetailsSection
                      brief={orderData.brief}
                      deadline={orderData.deadline}
                      onInputChange={handleInputChange}
                    />

                    <FileUploadSection
                      files={orderData.files}
                      onFilesChange={handleFilesChange}
                    />

                    <PaymentMethodSection
                      paymentMethod={orderData.paymentMethod}
                      onPaymentMethodChange={handlePaymentMethodChange}
                    />

                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="acceptTerms"
                          checked={orderData.acceptTerms}
                          onCheckedChange={handleCheckboxChange}
                        />
                        <Label htmlFor="acceptTerms" className="text-xs sm:text-sm leading-relaxed">
                          J'accepte les conditions générales d'utilisation et la politique de confidentialité
                        </Label>
                      </div>
                    </div>

                    <div className="pt-4 sm:pt-6">
                      <Button
                        type="submit"
                        disabled={!orderData.acceptTerms || isSubmitting}
                        className="w-full bg-gradient-primary text-base sm:text-lg py-5 sm:py-6 text-white"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            <span className="hidden sm:inline">Redirection vers le paiement...</span>
                            <span className="sm:hidden">Redirection...</span>
                          </>
                        ) : (
                          `Payer maintenant - ${pricingData.finalTotal}€`
                        )}
                      </Button>
                      <p className="text-center text-xs sm:text-sm text-gray-500 mt-2">
                        L'influenceur devra accepter votre commande avant que le paiement soit capturé
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
