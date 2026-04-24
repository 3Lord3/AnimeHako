import { Skeleton } from '@/components/ui/skeleton';

interface AnimeCardSkeletonProps {
  showRating?: boolean;
}

export function AnimeCardSkeleton({ showRating = true }: AnimeCardSkeletonProps) {
  return (
    <div className="group block">
      <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
        <Skeleton className="w-full h-full" />
        {/* Badges row - left top */}
        {showRating && (
          <div className="absolute top-2 right-2">
            <Skeleton className="h-9 w-12 rounded" />
          </div>
        )}
        {/* Gradient overlay for title */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-12">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}