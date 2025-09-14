
import { CreditCard } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PaymentMethodSectionProps {
  paymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
}

export const PaymentMethodSection = ({ paymentMethod, onPaymentMethodChange }: PaymentMethodSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <CreditCard className="w-5 h-5 mr-2" />
        Mode de paiement
      </h3>
      
      <RadioGroup
        value={paymentMethod}
        onValueChange={onPaymentMethodChange}
      >
        <div className="flex items-center space-x-2 p-4 border rounded-lg">
          <RadioGroupItem value="stripe" id="stripe" />
          <Label htmlFor="stripe" className="flex-1">
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              <div>
                <p className="font-medium">Carte bancaire (Stripe)</p>
                <p className="text-sm text-gray-600">Paiement sécurisé par Stripe</p>
              </div>
            </div>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 p-4 border rounded-lg opacity-50">
          <RadioGroupItem value="paypal" id="paypal" disabled />
          <Label htmlFor="paypal" className="flex-1">
            <div className="flex items-center">
              <div className="w-5 h-5 mr-2 bg-blue-600 rounded"></div>
              <div>
                <p className="font-medium">PayPal</p>
                <p className="text-sm text-gray-600">Bientôt disponible</p>
              </div>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};
