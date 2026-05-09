import { Star, Calendar, Clock, Film } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AnimeListItem } from '@/types';
import { getImageUrl } from '@/lib/imageUrl';
import { cn } from '@/lib/utils';

interface TournamentCardProps {
  anime: AnimeListItem;
  isWinner?: boolean;
  isEliminated?: boolean;
  onClick?: () => void;
  showDetails?: boolean;
}

export function TournamentCard({ 
  anime, 
  isWinner = false, 
  isEliminated = false, 
  onClick,
  showDetails = true 
}: TournamentCardProps) {
  const rating = anime.rating ? (typeof anime.rating === 'number' ? anime.rating : Number(anime.rating)) : null;
  const validRating = rating !== null && !isNaN(rating);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl transition-all duration-300 bg-card",
        onClick && !isEliminated && "cursor-pointer hover:scale-[1.02] hover:shadow-2xl",
        isWinner && "ring-4 ring-yellow-400 ring-offset-2 ring-offset-background",
        isEliminated && "opacity-50 grayscale"
      )}
    >
      <div className="aspect-[2/3] relative">
        {anime.poster ? (
          <img
            src={getImageUrl(anime.poster)}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Film className="w-20 h-20 text-muted-foreground" />
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Winner badge */}
        {isWinner && (
          <div className="absolute top-3 left-3 z-20">
            <Badge className="bg-yellow-500 text-black font-bold px-3 py-1 text-sm">
              🏆 Победитель
            </Badge>
          </div>
        )}
        
        {/* Genres in top-right corner */}
        {showDetails && anime.genres && anime.genres.length > 0 && (
          <div className="absolute top-3 right-3 flex flex-wrap gap-1 z-10 max-w-[60%] justify-end">
            {anime.genres.slice(0, 2).map((genre) => (
              <Badge 
                key={genre} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white border-0"
              >
                {genre}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Title and info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-bold text-lg mb-1 line-clamp-2">{anime.title}</h3>
          {anime.title_en && (
            <p className="text-xs text-gray-200 mb-2 line-clamp-1">{anime.title_en}</p>
          )}
          
          {showDetails && (
            <div className="flex items-center gap-3 text-sm">
              {validRating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                </div>
              )}
              {anime.year && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{anime.year}</span>
                </div>
              )}
              {anime.episodes && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{anime.episodes} эп.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Click indicator */}
      {onClick && !isEliminated && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 text-black px-4 py-2 rounded-full font-semibold text-sm">
            Выбрать
          </div>
        </div>
      )}
    </div>
  );
}