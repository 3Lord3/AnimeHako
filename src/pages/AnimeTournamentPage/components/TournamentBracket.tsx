import { Trophy, Swords } from 'lucide-react';
import type { Round } from '@/hooks/useTournament';
import { cn } from '@/lib/utils';
import { getRoundName } from '@/hooks/useTournament';
import { PairSlot } from './PairSlot';

interface TournamentBracketProps {
  rounds: Round[];
  currentRoundIndex: number;
  roundStarted: boolean;
}

export function TournamentBracket({ rounds, currentRoundIndex, roundStarted }: TournamentBracketProps) {
  const getMatchSpacing = (roundIndex: number) => {
    return Math.pow(2, roundIndex) * 80;
  };

  const totalRounds = rounds.length;

  return (
    <div className="w-full overflow-x-auto pb-8 px-2">
      {/* Round headers - scrollable on mobile */}
      <div className="flex justify-center gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-6 min-w-max px-2">
        {rounds.map((round, idx) => {
          const completedCount = round.pairs.filter(p => p.status === 'completed' || p.status === 'bye').length;
          const isCurrentRound = idx === currentRoundIndex;

          return (
            <div key={round.index} className="text-center min-w-[80px] sm:min-w-[100px] md:min-w-[140px]">
              <div className={cn(
                "inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium",
                isCurrentRound && roundStarted ? "bg-primary text-primary-foreground" :
                isCurrentRound ? "bg-yellow-500 text-black font-bold" :
                "bg-muted text-foreground"
              )}>
                {idx === rounds.length - 1 ? (
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                ) : (
                  <Swords className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
                {getRoundName(round.index, totalRounds)}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                {completedCount}/{round.pairs.length}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bracket visualization */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 min-w-max px-2">
        {rounds.map((round, roundIdx) => {
          const isCurrentRound = roundIdx === currentRoundIndex;
          const isPastRound = roundIdx < currentRoundIndex;

          return (
            <div
              key={round.index}
              className="flex flex-col"
              style={{
                gap: round.pairs.length <= 2 ? `${getMatchSpacing(roundIdx) / 2}px` : `${getMatchSpacing(roundIdx)}px`,
                justifyContent: 'space-around',
              }}
            >
              {round.pairs.map((pair) => {
                const isPlayable = isCurrentRound && roundStarted && pair.status === 'playing' && !pair.winner;
                const showPair = isPastRound || isCurrentRound;

                if (!showPair) {
                  // Future round - show placeholder
                  return (
                    <div
                      key={pair.id}
                      className="w-[80px] sm:w-[100px] md:w-[140px] h-[50px] sm:h-[60px] md:h-[70px] bg-muted/30 rounded-lg border-2 border-dashed border-border opacity-50"
                    />
                  );
                }

                return (
                  <div
                    key={pair.id}
                    className={cn(
                      "w-[80px] sm:w-[100px] md:w-[140px] transition-all duration-300",
                      pair.winner && "opacity-60",
                      isPlayable && "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg"
                    )}
                  >
                    {pair.status === 'bye' ? (
                      <div className={cn("bg-card rounded-lg shadow-md overflow-hidden ring-2 ring-yellow-500")}>
                        <PairSlot participant={pair.participants[0]} isWinner={true} isBye={true} />
                        <div className="h-px bg-border" />
                        <div className="h-[22px] sm:h-[24px] md:h-[32px] flex items-center justify-center bg-yellow-500/20 text-[10px] sm:text-xs text-yellow-600 font-medium">
                          BYE
                        </div>
                      </div>
                    ) : pair.participants.length === 2 ? (
                      <div className={cn(
                        "bg-card rounded-lg shadow-md overflow-hidden",
                        pair.winner && "ring-2 ring-green-500"
                      )}>
                        <PairSlot
                          participant={pair.participants[0]}
                          isWinner={pair.winner?.id === pair.participants[0].id}
                          isBye={false}
                        />
                        <div className="h-px bg-border" />
                        <PairSlot
                          participant={pair.participants[1]}
                          isWinner={pair.winner?.id === pair.participants[1].id}
                          isBye={false}
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <PairSlot participant={pair.participants[0]} isWinner={false} isBye={false} />
                        <PairSlot participant={null} isWinner={false} isBye={false} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}