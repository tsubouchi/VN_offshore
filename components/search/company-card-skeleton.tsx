import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CompanyCardSkeleton() {
  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Logo skeleton */}
          <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
          
          <div className="flex-1 space-y-2">
            {/* Company name skeleton */}
            <Skeleton className="h-6 w-48" />
            
            {/* Rating and location skeleton */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-32" />
            </div>
            
            {/* Description skeleton */}
            <div className="space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            
            {/* Technologies skeleton */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-18" />
              <Skeleton className="h-6 w-14" />
            </div>
            
            {/* Price skeleton */}
            <Skeleton className="h-5 w-24" />
          </div>
          
          {/* Buttons skeleton */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}