import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { AnimeListItem } from '@/types';
import { getImageUrl } from '@/lib/imageUrl';

interface AnimeCardProps {
  anime: AnimeListItem;
  showRating?: boolean;
}

function getRatingColor(rating: number | string): string {
  const r = typeof rating === 'number' ? rating : Number(rating);
  if (r >= 8) return 'bg-green-500';
  if (r >= 6) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function AnimeCard({ anime, showRating = true }: AnimeCardProps) {
  const rating = anime.rating ? (typeof anime.rating === 'number' ? anime.rating : Number(anime.rating)) : null;
  
  return (
    <Link to={`/anime/${anime.id}`} className="block">
      <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
        <img
          src={getImageUrl(anime.poster)}
          alt={anime.title}
          className="object-cover w-full h-full transition-all hover:scale-105"
          loading="lazy"
        />
        {/* Gradient overlay for title */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-12">
          <h3 className="font-semibold text-sm text-white line-clamp-2">
            {anime.title}
          </h3>
        </div>
        {/* Rating badge */}
        {showRating && rating !== null && (
          <div className={`absolute top-2 right-2 ${getRatingColor(rating)} px-1.5 py-0.5 rounded flex items-center gap-0.5`}>
            <Star className="w-3.5 h-3.5 fill-white text-white" />
            <span className="text-sm font-bold text-white">
              {rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
