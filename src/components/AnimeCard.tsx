import { Link } from 'react-router-dom';
import { Star, Eye, CheckCircle, XCircle, CalendarClock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AnimeListItem } from '@/types';
import { getImageUrl } from '@/lib/imageUrl';

interface AnimeCardProps {
  anime: AnimeListItem;
  showRating?: boolean;
  userStatus?: string | null;
  isFavorite?: boolean;
}

function getRatingColor(rating: number | string): string {
  const r = typeof rating === 'number' ? rating : Number(rating);
  if (r >= 8) return 'bg-green-500';
  if (r >= 6) return 'bg-yellow-500';
  return 'bg-red-500';
}

const statusIcons: Record<string, React.ReactNode> = {
  watching: <Eye size={24} strokeWidth={2.5} />,
  completed: <CheckCircle size={24} strokeWidth={2.5} />,
  dropped: <XCircle size={24} strokeWidth={2.5} />,
  planned: <CalendarClock size={24} strokeWidth={2.5} />,
};

const statusColors: Record<string, string> = {
  watching: 'bg-blue-500',
  completed: 'bg-green-500',
  dropped: 'bg-red-500',
  planned: 'bg-yellow-500',
};

export function AnimeCard({ anime, showRating = true, userStatus, isFavorite }: AnimeCardProps) {
  const rating = anime.rating ? (typeof anime.rating === 'number' ? anime.rating : Number(anime.rating)) : null;
  
  return (
    <Link to={`/anime/${anime.id}`} className="group block">
      <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
        <img
          src={getImageUrl(anime.poster)}
          alt={anime.title}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badges row - left top */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start gap-1">
          <div className="flex gap-1">
            {userStatus && statusColors[userStatus] && (
              <Badge className={`${statusColors[userStatus]} h-9 w-9 p-0 rounded-full`}>
                <span className="flex items-center justify-center w-full h-full">
                  {statusIcons[userStatus]}
                </span>
              </Badge>
            )}
            {isFavorite && (
              <Badge className="bg-pink-500 h-9 w-9 p-0 rounded-full">
                <span className="flex items-center justify-center w-full h-full text-lg">
                  ♥
                </span>
              </Badge>
            )}
          </div>
          {showRating && rating !== null && (
            <div className={`${getRatingColor(rating)} h-9 px-1.5 rounded flex items-center gap-0.5`}>
              <Star className="w-4 h-4 fill-white text-white" />
              <span className="text-sm font-bold text-white">
                {rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        {/* Gradient overlay for title */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-12">
          <h3 className="font-semibold text-sm text-white line-clamp-2">
            {anime.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
