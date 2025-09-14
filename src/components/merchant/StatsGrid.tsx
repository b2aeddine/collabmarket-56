
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Heart, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface StatsGridProps {
  stats: {
    totalOrders: number;
    totalSpent: number;
    favoriteInfluencers: number;
    newMessages: number;
  };
}

const StatsGrid = ({ stats }: StatsGridProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 px-2 sm:px-0">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white rounded-lg">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total commandes</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
            </div>
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600/60" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white rounded-lg">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total dépensé</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">{stats.totalSpent}€</p>
            </div>
            <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">€</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white rounded-lg">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Favoris</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">{stats.favoriteInfluencers}</p>
            </div>
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-purple-600/60" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-white hover:shadow-xl transition-shadow cursor-pointer rounded-lg">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <Link to="/messages">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Messages</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600">{stats.newMessages}</p>
              </div>
              <div className="relative">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-orange-600/60" />
                {stats.newMessages > 0 && (
                  <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center p-0">
                    {stats.newMessages}
                  </Badge>
                )}
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsGrid;
