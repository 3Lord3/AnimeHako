import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AnimeListItem } from '@/types';
import { getImageUrl } from '@/lib/imageUrl';
import { STATUS_ICONS, STATUS_COLORS, FAVORITE_ICON, getRatingColor, type StatusType } from '@/types/constants';

interface AnimeCardProps {
  anime: AnimeListItem;
  showRating?: boolean;
  userStatus?: StatusType | null;
  isFavorite?: boolean;
}

export function AnimeCard({ anime, showRating = true, userStatus, isFavorite }: AnimeCardProps) {
  const rating = anime.rating ? (typeof anime.rating === 'number' ? anime.rating : Number(anime.rating)) : null;
  const validRating = rating !== null && !isNaN(rating);
  
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
            {userStatus && STATUS_COLORS[userStatus] && (
              <Badge 
                title={userStatus === 'watching' ? 'Смотрю' : userStatus === 'completed' ? 'Просмотрено' : userStatus === 'dropped' ? 'Брошено' : 'Запланировано'}
                className={`${STATUS_COLORS[userStatus]} h-9 w-9 p-0 rounded-full cursor-pointer`}
              >
                <span className="flex items-center justify-center w-full h-full text-black dark:text-white">
                  {STATUS_ICONS[userStatus]}
                </span>
              </Badge>
            )}
            {isFavorite && (
              <Badge title="Избранное" className="bg-pink-500 h-9 w-9 p-0 rounded-full cursor-pointer">
                <span className="flex items-center justify-center w-full h-full text-white">
                  {FAVORITE_ICON}
                </span>
              </Badge>
            )}
          </div>
          {showRating && validRating && (
            <div title={`Рейтинг: ${rating.toFixed(1)}`} className={`${getRatingColor(rating)} h-9 px-1.5 rounded flex items-center gap-0.5 cursor-pointer`}>
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
