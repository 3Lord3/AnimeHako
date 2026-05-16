import type { TournamentParticipant } from '@/hooks/useTournament';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/imageUrl';

interface PairSlotProps {
  participant: TournamentParticipant | null;
  isWinner: boolean;
  isBye: boolean;
}

export function PairSlot({ participant, isWinner, isBye }: PairSlotProps) {
  if (!participant) {
    return (
      <div className="h-[32px] bg-muted/30 rounded border border-dashed border-border" />
    );
  }

  return (
    <div
      className={cn(
        "h-[22px] sm:h-[24px] md:h-[32px] flex items-center gap-1 sm:gap-1.5 px-1 sm:px-2 py-0.5 sm:py-1 bg-muted/50",
        isWinner && "bg-green-500/20"
      )}
    >
      <div className="w-4 h-5 sm:w-5 sm:h-6 rounded overflow-hidden bg-muted flex-shrink-0">
        {participant.anime.poster && (
          <img
            src={getImageUrl(participant.anime.poster)}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <span className="text-[10px] sm:text-xs font-medium truncate flex-1 text-foreground">
        {participant.anime.title}
      </span>
      {isWinner && <span className="text-green-500 text-sm">✓</span>}
      {isBye && <span className="text-yellow-500 text-[10px] sm:text-xs">B</span>}
    </div>
  );
}