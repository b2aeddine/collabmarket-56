import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-teal-50">
      <div className="px-0 sm:px-4 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="px-4 sm:px-0">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>

          {/* Profile Card */}
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

          {/* Stats Grid */}
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

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 px-0 sm:px-0">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="border-0 shadow-lg rounded-none sm:rounded-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3 flex-1">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="min-w-0 flex-1">
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-32 mb-2" />
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <Skeleton className="h-5 w-12 mb-1" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};