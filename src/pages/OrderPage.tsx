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
import PaymentButton from "@/components/PaymentButton";

const OrderPage = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  
  const { offerId, influencerId } = useMemo(() => {
    const offerId = params.serviceId;
    const influencerId = searchParams.get("influencer");
    console.log("OrderPage: URL params extracted", { offerId, influencerId });
    return { offerId, influencerId };
  }, [params.serviceId, searchParams]);

  const directPayment = useDirectPayment();
  const { orderData, handleInputChange, handlePaymentMethodChange, handleCheckboxChange } = useOrderData();

  const [offer, setOffer] = useState<any>(null);
  const [influencer, setInfluencer] = useState<any>(null);
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
      console.log("Starting data fetch for", { offerId, influencerId });
      
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

      console.log("Data fetched successfully");
      setOffer(offerResponse.data);
      setInfluencer(influencerResponse.data);
      setError(null);

    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des données';
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
    
    if (!orderData.acceptTerms) {
      toast.error("Vous devez accepter les conditions générales");
      return;
    }

    if (!orderData.brandName || !orderData.productName || !orderData.brief) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!offer || !influencer || !pricingData) {
      toast.error("Données manquantes, veuillez recharger la page");
      return;
    }

    try {
      console.log("Creating direct payment with data:", orderData);
      
      // Direct payment with authorization (no order creation first)
      await directPayment.mutateAsync({
        influencerId: influencerId || "",
        offerId: offerId || "",
        amount: pricingData.finalTotal,
        brandName: orderData.brandName,
        productName: orderData.productName,
        brief: orderData.brief,
        deadline: orderData.deadline,
        specialInstructions: `Marque: ${orderData.brandName}\nProduit: ${orderData.productName}\nBrief: ${orderData.brief}`,
      });

    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Erreur lors de la création du paiement");
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
        <div className="py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col justify-center items-center min-h-[400px] space-y-6">
              <div className="text-center max-w-md">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-600 mb-3">Erreur de chargement</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="space-y-3">
                  <Button onClick={() => window.location.reload()} className="w-full">
                    Recharger la page
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.history.back()}
                    className="w-full"
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
        <div className="py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col justify-center items-center min-h-[400px] space-y-6">
              <div className="text-center max-w-md">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-600 mb-3">Données manquantes</h2>
                <p className="text-gray-600 mb-6">
                  Impossible de récupérer les informations de la commande.
                </p>
                <div className="space-y-3">
                  <Button onClick={() => window.location.reload()} className="w-full">
                    Recharger la page
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.history.back()}
                    className="w-full"
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
      
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <OrderSummary 
                offer={offer}
                influencer={influencer}
                pricingData={pricingData}
              />
            </div>

            <div className="lg:col-span-2">
              <Card className="shadow-xl border-0 animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-2xl">Commander une collaboration</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
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

                    <FileUploadSection />

                    <PaymentMethodSection
                      paymentMethod={orderData.paymentMethod}
                      onPaymentMethodChange={handlePaymentMethodChange}
                    />

                    <div className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="acceptTerms"
                          checked={orderData.acceptTerms}
                          onCheckedChange={handleCheckboxChange}
                        />
                        <Label htmlFor="acceptTerms" className="text-sm leading-relaxed">
                          J'accepte les conditions générales d'utilisation et la politique de confidentialité
                        </Label>
                      </div>
                    </div>

                    <div className="pt-6">
                      <Button
                        type="submit"
                        disabled={!orderData.acceptTerms || isSubmitting}
                        className="w-full bg-gradient-primary text-lg py-6 text-white"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Redirection vers le paiement...
                          </>
                        ) : (
                          `Payer maintenant - ${pricingData.finalTotal}€`
                        )}
                      </Button>
                      <p className="text-center text-sm text-gray-500 mt-2">
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
