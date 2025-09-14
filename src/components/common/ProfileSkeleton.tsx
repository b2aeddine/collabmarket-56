
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const ProfileSkeleton = () => {
  return (
    <Card className="border-0 shadow-lg rounded-none sm:rounded-lg mx-0 sm:mx-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="mb-4">
              <Skeleton className="h-6 w-32 mb-2" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-20 mt-2" />
            </div>
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
