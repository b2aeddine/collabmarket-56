
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { OrderListSkeleton } from "@/components/common/OrderListSkeleton";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  influencer?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
  offers?: {
    title?: string;
  };
}

interface RecentOrdersCardProps {
  orders?: Order[];
  isLoading: boolean;
}

const RecentOrdersCard = ({ orders, isLoading }: RecentOrdersCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "pending": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_progress": return "En cours";
      case "completed": return "Réalisée";
      case "cancelled": return "Annulée";
      case "pending": return "En attente";
      default: return status;
    }
  };

  return (
    <Card className="border-0 shadow-lg rounded-none sm:rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Commandes récentes</span>
          <Button asChild size="sm" variant="outline">
            <Link to="/orders">Voir tout</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <OrderListSkeleton />
          ) : orders?.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Aucune commande pour le moment</div>
          ) : (
            orders?.slice(0, 3).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3 flex-1">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={order.influencer?.avatar_url || undefined} />
                    <AvatarFallback>
                      {order.influencer ? 
                        `${order.influencer.first_name?.[0] || ''}${order.influencer.last_name?.[0] || ''}` : 
                        'IN'
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-800 truncate">
                      {order.influencer ? 
                        `${order.influencer.first_name || ''} ${order.influencer.last_name || ''}`.trim() || 'Influenceur' : 
                        'Influenceur'
                      }
                    </h4>
                    <p className="text-sm text-gray-600 truncate">{order.offers?.title || 'Prestation'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-lg bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                    {Number(order.total_amount)}€
                  </p>
                  <Button size="sm" variant="outline" className="mt-1">
                    Voir
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrdersCard;
