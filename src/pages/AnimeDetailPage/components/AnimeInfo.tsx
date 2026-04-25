import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Clock, Film } from 'lucide-react';
import { SEASON_LABELS } from '@/types/constants';

interface AnimeInfoProps {
  anime: {
    rating: number | null;
    year: number | null;
    season: string | null;
    status: string | null;
    episodes: number | null;
    duration: number | null;
    studio: string | null;
    genres: string[];
    tags: string[];
  };
}

export function AnimeInfo({ anime }: AnimeInfoProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {anime.rating !== null && anime.rating !== undefined && !isNaN(Number(anime.rating)) && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            {typeof anime.rating === 'number' ? anime.rating.toFixed(1) : Number(anime.rating).toFixed(1)}
          </Badge>
        )}
        {anime.year && anime.year > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {anime.year}
          </Badge>
        )}
        {anime.season && (
          <Badge variant="outline">
            {SEASON_LABELS[anime.season] || anime.season}
          </Badge>
        )}
        {anime.status && (
          <Badge variant={anime.status === 'ongoing' ? 'default' : 'secondary'}>
            {anime.status === 'ongoing' ? 'Онгоинг' : 'Завершено'}
          </Badge>
        )}
        {anime.episodes && anime.episodes > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Film className="w-4 h-4" />
            {anime.episodes} эп.
          </Badge>
        )}
        {anime.duration && anime.duration > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {anime.duration} мин.
          </Badge>
        )}
      </div>

      {anime.studio && (
        <p>
          <strong>Студия:</strong> {anime.studio}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {anime.genres.map((genre) => (
          <Badge key={genre} variant="secondary">
            {genre}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {anime.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}