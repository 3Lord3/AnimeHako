import { AnimeCardSkeleton } from './AnimeCardSkeleton';

interface AnimeGridSkeletonProps {
  count?: number;
  showRating?: boolean;
}

export function AnimeGridSkeleton({ count = 10, showRating = true }: AnimeGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <AnimeCardSkeleton key={i} showRating={showRating} />
      ))}
    </div>
  );
}