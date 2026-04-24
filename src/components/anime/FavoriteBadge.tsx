import { Badge } from '@/components/ui/badge';
import { FAVORITE_ICON } from '@/types/constants';

interface FavoriteBadgeProps {
  size?: 'sm' | 'md' | 'lg';
}

export function FavoriteBadge({ size = 'md' }: FavoriteBadgeProps) {
  const sizeClasses = {
    sm: 'h-7 w-7 p-0',
    md: 'h-9 w-9 p-0',
    lg: 'h-11 w-11 p-0',
  };

  return (
    <Badge className={`bg-pink-500 ${sizeClasses[size]} p-0 rounded-full`}>
      <span className="flex items-center justify-center w-full h-full">
        {FAVORITE_ICON}
      </span>
    </Badge>
  );
}