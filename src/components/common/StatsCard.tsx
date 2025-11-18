
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
}

export const StatsCard = ({ title, value, icon: Icon, description, className }: StatsCardProps) => {
  return (
    <Card className={`${className} animate-fade-in`}>
      <CardContent className="flex items-center p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg mr-4 transition-transform duration-200 hover:rotate-12 hover:scale-110">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
};
