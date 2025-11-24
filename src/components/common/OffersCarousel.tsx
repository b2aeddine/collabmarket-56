import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import OfferCard from "@/components/OfferCard";

interface Offer {
  id: string;
  type: string;
  platform: string;
  price: number;
  deliveryTime: string;
  active: boolean;
}

interface OffersCarouselProps {
  offers: Offer[];
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
  onSave: (updatedOffer: Offer) => void;
}

export const OffersCarousel = ({ 
  offers, 
  onToggleActive,
  onDelete,
  onSave
}: OffersCarouselProps) => {
  if (offers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-2">Aucune offre créée</p>
        <p className="text-sm">Commencez par ajouter votre première offre !</p>
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
        {offers.map((offer) => (
          <CarouselItem key={offer.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <OfferCard
                  id={offer.id}
                  type={offer.type}
                  platform={offer.platform}
                  price={offer.price}
                  deliveryTime={offer.deliveryTime}
                  active={offer.active}
                  onToggleActive={() => onToggleActive(offer.id)}
                  onDelete={() => onDelete(offer.id)}
                  onSave={onSave}
                  offer={offer}
                />
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="flex -left-6 h-10 w-10 border-2 border-primary bg-primary text-white hover:bg-primary/90 shadow-xl transition-all duration-200 z-30" />
      <CarouselNext className="flex -right-6 h-10 w-10 border-2 border-primary bg-primary text-white hover:bg-primary/90 shadow-xl transition-all duration-200 z-30" />
    </Carousel>
  );
};