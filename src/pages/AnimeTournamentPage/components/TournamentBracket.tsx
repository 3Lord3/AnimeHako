import { Trophy, Swords } from 'lucide-react';
import type { Round, TournamentParticipant } from '@/hooks/useTournament';
import { cn } from '@/lib/utils';

interface TournamentBracketProps {
  rounds: Round[];
  currentRoundIndex: number;
  roundStarted: boolean;
}

export function TournamentBracket({ rounds, currentRoundIndex, roundStarted }: TournamentBracketProps) {
  console.log('[TournamentBracket] Render:', {
    currentRoundIndex,
    roundsCount: rounds.length,
    roundStarted,
    rounds: rounds.map(r => ({
      index: r.index,
      pairsCount: r.pairs.length,
      isComplete: r.isComplete,
      pairs: r.pairs.map(p => ({
        id: p.id,
        participants: p.participants.map(pp => pp.anime.title),
        winner: p.winner?.anime?.title || null,
        status: p.status,
      })),
    })),
  });
  
  const getRoundName = (roundIndex: number, totalRounds: number) => {
    // roundIndex starts from 0 (first round) to totalRounds-1 (final)
    // Display round number should be 1-based from first round to final
    const displayRound = roundIndex + 1;
    if (displayRound === totalRounds) return 'Финал';
    if (totalRounds === 2 && displayRound === 1) return 'Полуфинал';
    if (totalRounds === 3 && displayRound === 1) return 'Четвертьфинал';
    if (totalRounds === 3 && displayRound === 2) return 'Полуфинал';
    if (displayRound === totalRounds - 1) return 'Полуфинал';
    if (displayRound === totalRounds - 2) return 'Четвертьфинал';
    return `${displayRound} раунд`;
  };
  
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
                      <div className={cn(
                        "bg-card rounded-lg shadow-md overflow-hidden ring-2 ring-yellow-500"
                      )}>
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

interface PairSlotProps {
  participant: TournamentParticipant | null;
  isWinner: boolean;
  isBye: boolean;
}

function PairSlot({ participant, isWinner, isBye }: PairSlotProps) {
  if (!participant) {
    return (
      <div className="h-[32px] bg-muted/30 rounded border border-dashed border-border" />
    );
  }
  
  return (
    <div className={cn(
      "h-[22px] sm:h-[24px] md:h-[32px] flex items-center gap-1 sm:gap-1.5 px-1 sm:px-2 py-0.5 sm:py-1 bg-muted/50",
      isWinner && "bg-green-500/20"
    )}>
      <div className="w-4 h-5 sm:w-5 sm:h-6 rounded overflow-hidden bg-muted flex-shrink-0">
        {participant.anime.poster && (
          <img src={participant.anime.poster} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <span className="text-[10px] sm:text-xs font-medium truncate flex-1 text-foreground">{participant.anime.title}</span>
      {isWinner && <span className="text-green-500 text-sm">✓</span>}
      {isBye && <span className="text-yellow-500 text-[10px] sm:text-xs">B</span>}
    </div>
  );
}