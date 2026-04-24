import { Badge } from '@/components/ui/badge';

interface FavoriteBadgeProps {
  size?: 'sm' | 'md' | 'lg';
}

export function FavoriteBadge({ size = 'md' }: FavoriteBadgeProps) {
  const sizeClasses = {
    sm: 'h-7 w-7 p-0 text-sm',
    md: 'h-9 w-9 p-0 text-lg',
    lg: 'h-11 w-11 p-0 text-xl',
  };

  return (
    <Badge className={`bg-pink-500 ${sizeClasses[size]} p-0 rounded-full`}>
      <span className="flex items-center justify-center w-full h-full">
        ♥
      </span>
    </Badge>
  );
}