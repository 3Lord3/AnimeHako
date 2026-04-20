import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { AnimeListItem } from '@/types';

interface AnimeCardProps {
  anime: AnimeListItem;
}

export function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <Link to={`/anime/${anime.id}`} className="block">
      <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
        <img
          src={anime.poster || '/placeholder-poster.jpg'}
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
        {anime.rating && (
          <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded-md flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-white">
              {typeof anime.rating === 'number' ? anime.rating.toFixed(1) : Number(anime.rating).toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
