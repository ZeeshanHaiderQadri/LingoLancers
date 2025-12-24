/**
 * Skeleton loader for travel plan cards
 * Provides visual feedback while travel plans are loading
 * Matches exact proportions of real travel plan cards
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TravelPlanSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Destination title - single line */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-5 bg-muted rounded-sm"></div>
              <div className="h-5 bg-muted rounded w-28"></div>
            </div>
            
            {/* Travel details - compact single line */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 bg-muted rounded-sm"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 bg-muted rounded-sm"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 bg-muted rounded-sm"></div>
                <div className="h-3 bg-muted rounded w-12"></div>
              </div>
            </div>
          </div>
          
          {/* Status badge - compact */}
          <div className="h-5 bg-muted rounded-full w-16"></div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Preferences - 2 lines max */}
        <div className="space-y-1 mb-4">
          <div className="h-3 bg-muted rounded w-full"></div>
          <div className="h-3 bg-muted rounded w-2/3"></div>
        </div>
        
        {/* Buttons - compact height */}
        <div className="flex gap-2">
          <div className="h-8 bg-muted rounded flex-1"></div>
          <div className="h-8 w-8 bg-muted rounded"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TravelPlanSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-muted rounded w-40"></div>
        <div className="h-5 bg-muted rounded w-16"></div>
      </div>
      <div className="grid gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <TravelPlanSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}