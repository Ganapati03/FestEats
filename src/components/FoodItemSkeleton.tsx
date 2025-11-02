import { Skeleton } from './ui/skeleton';
import { Card, CardContent } from './ui/card';

export function FoodItemSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}
