
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";

const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-lg text-center">
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-4">
                <XCircle className="w-16 h-16 text-orange-500" />
              </div>
              <CardTitle className="text-2xl text-orange-600">
                Paiement annulé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Votre paiement a été annulé. Aucun montant n'a été débité.
              </p>

              <div className="pt-4 space-y-3">
                <Button asChild className="w-full">
                  <Link to="/orders">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Réessayer le paiement
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full">
                  <Link to="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à l'accueil
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
