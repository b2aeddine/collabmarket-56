import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useNavigate } from "react-router-dom";

interface Service {
  id: string;
  type: string;
  description: string;
  price: number;
  deliveryTime: string;
  popular?: boolean;
}

interface ServicesCarouselProps {
  services: Service[];
  influencerId?: string;
  onServiceClick?: (serviceId: string) => void;
  getPlatformLogo?: (platform: string) => JSX.Element;
  getPlatformFromTitle?: (title: string) => string;
  showOrderButton?: boolean;
}

export const ServicesCarousel = ({ 
  services, 
  influencerId,
  onServiceClick,
  getPlatformLogo,
  getPlatformFromTitle,
  showOrderButton = true
}: ServicesCarouselProps) => {
  const navigate = useNavigate();

  const handleOrderClick = (serviceId: string) => {
    if (onServiceClick) {
      onServiceClick(serviceId);
    } else if (influencerId) {
      navigate(`/order/${serviceId}?influencer=${influencerId}`);
    }
  };

  if (services.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-2">Aucune prestation disponible</p>
        <p className="text-sm">Les prestations apparaîtront ici une fois configurées</p>
      </div>
    );
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: false,
      }}
      className="w-full px-8"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {services.map((service) => {
          const platform = getPlatformFromTitle ? getPlatformFromTitle(service.type) : '';
          const platformName = platform === 'x' ? 'X (Twitter)' : platform.charAt(0).toUpperCase() + platform.slice(1);
          
          return (
            <CarouselItem key={service.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
              <div className="h-full">
                <div className={`h-full p-4 sm:p-6 rounded-xl border-2 transition-all hover:shadow-lg relative flex flex-col ${
                  service.popular
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50 bg-white'
                }`}>
                  {service.popular && (
                    <Badge className="absolute -top-2 left-4 bg-primary z-10">
                      Populaire
                    </Badge>
                  )}
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 mt-1">
                        {getPlatformLogo && getPlatformLogo(platform)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold leading-tight">{service.type}</h3>
                        {platformName && <p className="text-sm text-muted-foreground">{platformName}</p>}
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-2 text-sm line-clamp-2">{service.description}</p>
                    <p className="text-xs text-muted-foreground mt-auto">Livraison : {service.deliveryTime}</p>
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
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="flex -left-6 h-10 w-10 border-2 border-primary bg-primary text-white hover:bg-primary/90 shadow-xl transition-all duration-200 z-30" />
      <CarouselNext className="flex -right-6 h-10 w-10 border-2 border-primary bg-primary text-white hover:bg-primary/90 shadow-xl transition-all duration-200 z-30" />
    </Carousel>
  );
};