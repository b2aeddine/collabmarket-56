import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Service {
  id: string;
  type: string;
  description: string;
  price: number;
  deliveryTime: string;
  popular?: boolean;
}

interface AllServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  influencerId?: string;
  onServiceClick?: (serviceId: string) => void;
  getPlatformLogo?: (platform: string) => JSX.Element;
  getPlatformFromTitle?: (title: string) => string;
  showOrderButton?: boolean;
}

const AllServicesModal = ({ 
  isOpen, 
  onClose, 
  services,
  influencerId,
  onServiceClick,
  getPlatformLogo,
  getPlatformFromTitle,
  showOrderButton = true
}: AllServicesModalProps) => {
  const navigate = useNavigate();

  const handleOrderClick = (serviceId: string) => {
    if (onServiceClick) {
      onServiceClick(serviceId);
    } else if (influencerId) {
      navigate(`/order/${serviceId}?influencer=${influencerId}`);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Toutes les prestations</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => {
              const platform = getPlatformFromTitle ? getPlatformFromTitle(service.type) : '';
              const platformName = platform === 'x' ? 'X (Twitter)' : platform.charAt(0).toUpperCase() + platform.slice(1);
              
              return (
                <div 
                  key={service.id} 
                  className={`h-full p-4 sm:p-6 rounded-xl border-2 transition-all hover:shadow-lg relative ${
                    service.popular
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50 bg-white'
                  }`}
                >
                  {service.popular && (
                    <Badge className="absolute -top-2 left-4 bg-primary z-10">
                      Populaire
                    </Badge>
                  )}
                  
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getPlatformLogo && getPlatformLogo(platform)}
                        <div>
                          <h3 className="text-lg font-semibold">{service.type}</h3>
                          {platformName && <p className="text-sm text-gray-500">{platformName}</p>}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2 text-sm">{service.description}</p>
                      <p className="text-xs text-gray-500">Livraison : {service.deliveryTime}</p>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <div className="text-xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent mb-3">
                        {service.price}€
                      </div>
                      {showOrderButton && (
                        <Button 
                          onClick={() => handleOrderClick(service.id)}
                          className={`w-full ${service.popular ? "bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90" : ""}`}
                          size="sm"
                        >
                          Commander
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AllServicesModal;