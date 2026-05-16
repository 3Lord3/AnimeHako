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
  compact?: boolean;
  className?: string;
}

export function TournamentCard({ 
  anime, 
  isWinner = false, 
  isEliminated = false, 
  onClick,
  showDetails = true,
  compact = false,
  className = ''
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
        isEliminated && "opacity-50 grayscale",
        compact ? "w-3/5 sm:w-4/5 lg:w-3/4 aspect-[2/3] max-h-full" : "aspect-[2/3]",
        className
      )}
    >
      <div className={cn("relative w-full h-full", compact ? "h-full" : "aspect-[2/3]")}>
        {anime.poster ? (
          <img
            src={getImageUrl(anime.poster)}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Film className={cn("text-muted-foreground", compact ? "w-16 h-16 sm:w-24 sm:h-24" : "w-20 h-20")} />
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Winner badge */}
        {isWinner && (
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20">
            <Badge className={cn(
              "bg-yellow-500 text-black font-bold",
              compact ? "px-2 py-1 text-xs sm:text-sm" : "px-3 py-1 text-sm"
            )}>
              🏆 Победитель
            </Badge>
          </div>
        )}
        
        {/* Genres in top-right corner */}
        {showDetails && anime.genres && anime.genres.length > 0 && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-wrap gap-1 z-10 max-w-[60%] justify-end">
            {anime.genres.slice(0, compact ? 2 : 2).map((genre) => (
              <Badge 
                key={genre} 
                variant="secondary" 
                className={cn(
                  "text-muted-foreground border-0",
                  compact ? "text-xs sm:text-sm px-2 py-1 bg-black/60" : "text-xs px-2 py-0.5 bg-black/60"
                )}
              >
                {genre}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Title and info at bottom */}
        <div className={cn("absolute bottom-0 left-0 right-0 text-white", compact ? "p-3 sm:p-4 md:p-6" : "p-4")}>
          <h3 className={cn(
            "font-bold line-clamp-2",
            compact ? "text-sm sm:text-base md:text-lg" : "text-lg mb-1"
          )}>{anime.title}</h3>
          {anime.title_en && (
            <p className={cn("text-gray-200 line-clamp-1", compact ? "text-xs sm:text-sm" : "text-xs mb-2")}>{anime.title_en}</p>
          )}
          
          {showDetails && (
            <div className={cn("flex items-center gap-2 sm:gap-3", compact ? "text-xs sm:text-sm md:text-base" : "text-sm")}>
              {validRating && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Star className={cn("text-yellow-400 fill-yellow-400", compact ? "w-3 h-3 sm:w-4 sm:h-4" : "w-4 h-4")} />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                </div>
              )}
              {anime.year && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Calendar className={compact ? "w-3 h-3 sm:w-4 sm:h-4" : "w-4 h-4"} />
                  <span>{anime.year}</span>
                </div>
              )}
              {anime.episodes && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Clock className={compact ? "w-3 h-3 sm:w-4 sm:h-4" : "w-4 h-4"} />
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
          <div className={cn(
            "bg-white/90 text-black rounded-full font-semibold",
            compact ? "px-4 py-2 text-sm sm:text-base" : "px-4 py-2 text-sm"
          )}>
            Выбрать
          </div>
        </div>
      )}
    </div>
  );
}