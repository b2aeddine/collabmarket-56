
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 px-2 sm:px-0">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white rounded-lg">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-6 w-8" />
              </div>
              <Skeleton className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
