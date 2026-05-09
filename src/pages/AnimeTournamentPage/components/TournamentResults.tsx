import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TournamentParticipant } from '@/hooks/useTournament';
import { cn } from '@/lib/utils';

interface TournamentResultsProps {
  participants: Array<TournamentParticipant & { position: number }>;
  champion: TournamentParticipant | null;
  onRestart: () => void;
}

export function TournamentResults({ participants, champion, onRestart }: TournamentResultsProps) {
  const sortedResults = [...participants].sort((a, b) => a.position - b.position);
  
  return (
    <div className="space-y-8 py-8">
      {/* Champion highlight */}
      {champion && (
        <div className="text-center">
          <div className="inline-block">
            <div className="w-40 h-40 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse" />
              <div className="absolute inset-4 bg-background rounded-full" />
              <div className="absolute inset-6 overflow-hidden rounded-full">
                <img
                  src={champion.anime.poster || ''}
                  alt={champion.anime.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                🏆 Чемпион
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground">{champion.anime.title}</h2>
            {champion.anime.title_en && (
              <p className="text-muted-foreground">{champion.anime.title_en}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Results table */}
      <div className="max-w-2xl mx-auto">
        <h3 className="text-xl font-bold mb-4 text-center text-foreground">Итоговая таблица</h3>
        <div className="space-y-2">
          {sortedResults.slice(0, 16).map((participant) => (
            <div
              key={participant.id}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg transition-colors border",
                participant.position <= 3 
                  ? "bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-transparent border-yellow-500/20" 
                  : "bg-card border-border"
              )}
            >
              {/* Position */}
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                participant.position === 1 && "bg-yellow-500 text-black",
                participant.position === 2 && "bg-gray-400 text-white",
                participant.position === 3 && "bg-amber-600 text-white",
                participant.position > 3 && "bg-muted text-muted-foreground"
              )}>
                {participant.position <= 3 ? (
                  participant.position === 1 ? '🥇' : participant.position === 2 ? '🥈' : '🥉'
                ) : (
                  participant.position
                )}
              </div>
              
              {/* Card preview */}
              <div className="w-16 h-20 rounded overflow-hidden bg-muted flex-shrink-0 border border-border">
                {participant.anime.poster ? (
                  <img
                    src={participant.anime.poster}
                    alt={participant.anime.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    Нет
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-foreground">{participant.anime.title}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {participant.anime.year && `${participant.anime.year} • `}
                  {participant.anime.genres?.slice(0, 2).join(', ')}
                </p>
              </div>
              
              {/* Rating */}
              {participant.anime.rating && (
                <div className="text-sm font-medium text-muted-foreground">
                  ★ {Number(participant.anime.rating).toFixed(1)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Restart button */}
      <div className="text-center">
        <Button onClick={onRestart} size="lg" variant="outline" className="gap-2 text-foreground border-2 hover:bg-accent">
          <RotateCcw className="w-4 h-4" />
          Провести ещё один турнир
        </Button>
      </div>
    </div>
  );
}