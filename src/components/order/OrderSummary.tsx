
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText } from "lucide-react";
import { Offer, User } from "@/types";

interface OrderSummaryProps {
  offer: Offer;
  influencer: User;
  pricingData: {
    totalPrice: number;
    serviceFee: number;
    finalTotal: number;
  };
}

export const OrderSummary = ({ offer, influencer, pricingData }: OrderSummaryProps) => {
  return (
    <div className="sticky top-24">
      <Card className="shadow-xl border-0 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Récapitulatif
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Influencer Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Avatar className="w-12 h-12">
              <AvatarImage src={influencer.avatar_url} alt={influencer.first_name} />
              <AvatarFallback>
                {(influencer.first_name?.[0] || '') + (influencer.last_name?.[0] || '')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">@{influencer.custom_username || 'influenceur'}</p>
              <p className="text-sm text-gray-600">
                {`${influencer.first_name || ''} ${influencer.last_name || ''}`.trim() || 'Utilisateur'}
              </p>
            </div>
          </div>

          {/* Service Details */}
          <div>
            <h3 className="font-semibold text-lg mb-2">{offer.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{offer.description}</p>
            <div className="flex justify-between items-center text-sm">
              <span>Livraison :</span>
              <span className="font-medium">{offer.delivery_time || '48h'}</span>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Prix de base</span>
              <span>{pricingData.totalPrice}€</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Frais de service (10%)</span>
              <span>{pricingData.serviceFee}€</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">{pricingData.finalTotal}€</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
