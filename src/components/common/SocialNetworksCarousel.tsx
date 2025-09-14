import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import SocialNetworkCard from "@/components/SocialNetworkCard";

interface NetworkDisplay {
  id: string;
  platform: string;
  username: string;
  profile_url: string;
  followers: number;
  engagement_rate: number;
  is_connected?: boolean;
  is_active?: boolean;
  user_id?: string;
  created_at?: string;
}

interface SocialNetworksCarouselProps {
  networks: NetworkDisplay[];
  onToggleActive?: (network: NetworkDisplay) => void;
  onDelete?: (id: string) => void;
  onUpdateNetwork?: (network: NetworkDisplay) => void;
  showActions?: boolean;
}

export const SocialNetworksCarousel = ({ 
  networks, 
  onToggleActive,
  onDelete,
  onUpdateNetwork,
  showActions = false
}: SocialNetworksCarouselProps) => {
  if (networks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-2">Aucun réseau social configuré</p>
        <p className="text-sm">Vos réseaux sociaux apparaîtront ici</p>
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
        {networks.map((network) => (
          <CarouselItem key={network.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <SocialNetworkCard
                  {...network}
                  onToggleActive={onToggleActive ? () => onToggleActive(network) : undefined}
                  onDelete={onDelete ? () => onDelete(network.id) : undefined}
                  onUpdateNetwork={onUpdateNetwork}
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