import { useMemo } from 'react';
import { Trophy, Swords } from 'lucide-react';
import type { TournamentMatch as TournamentMatchType } from '@/hooks/useTournament';
import { cn } from '@/lib/utils';

interface TournamentBracketProps {
  matches: TournamentMatchType[];
  currentRound: number;
  totalRounds: number;
  roundStarted: boolean;
}

export function TournamentBracket({ matches, currentRound, totalRounds, roundStarted }: TournamentBracketProps) {
  console.log('[TournamentBracket] Render:', {
    currentRound,
    totalRounds,
    roundStarted,
    matchesCount: matches.length,
    matchesByRound: matches.reduce((acc, m) => {
      acc[m.round] = acc[m.round] || [];
      acc[m.round].push({ id: m.id, p1: m.participant1?.anime?.title || null, p2: m.participant2?.anime?.title || null });
      return acc;
    }, {} as Record<number, {id: string, p1: string|null, p2: string|null}[]>)
  });
  
  const matchesByRound = useMemo(() => {
    const grouped: Record<number, TournamentMatchType[]> = {};
    matches.forEach(match => {
      if (!grouped[match.round]) {
        grouped[match.round] = [];
      }
      grouped[match.round].push(match);
    });
    Object.keys(grouped).forEach(round => {
      grouped[Number(round)].sort((a, b) => a.matchNumber - b.matchNumber);
    });
    return grouped;
  }, [matches]);
  
  const getRoundName = (round: number) => {
    if (round === totalRounds) return 'Финал';
    if (round === totalRounds - 1 && round >= 2) return 'Полуфинал';
    if (round === totalRounds - 2 && round >= 2) return 'Четвертьфинал';
    // For smaller brackets (like 4 participants with 2 rounds)
    if (totalRounds === 2 && round === 1) return 'Полуфинал';
    if (totalRounds === 3 && round === 1) return 'Четвертьфинал';
    if (totalRounds === 3 && round === 2) return 'Полуфинал';
    return `${round}/${Math.pow(2, round)} финала`;
  };
  
  const getMatchSpacing = (round: number) => {
    return Math.pow(2, round - 1) * 80;
  };
  
  return (
    <div className="w-full overflow-x-auto pb-8">
      {/* Round headers */}
      <div className="flex justify-center gap-6 mb-6 min-w-max px-4">
        {Array.from({ length: totalRounds }, (_, i) => {
          const round = totalRounds - i;
          const roundMatches = matchesByRound[round] || [];
          const completedCount = roundMatches.filter(m => m.winner).length;
          
          return (
            <div key={round} className="text-center min-w-[140px]">
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                round === currentRound && roundStarted ? "bg-primary text-primary-foreground" : 
                round === currentRound ? "bg-yellow-500 text-black font-bold" :
                "bg-muted text-foreground"
              )}>
                {round === totalRounds ? (
                  <Trophy className="w-4 h-4 text-yellow-600" />
                ) : (
                  <Swords className="w-4 h-4" />
                )}
                {getRoundName(round)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {completedCount}/{roundMatches.length}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Bracket visualization */}
      <div className="flex items-center justify-center gap-4 min-w-max px-4">
        {Array.from({ length: totalRounds }, (_, i) => {
          const round = totalRounds - i;
          const roundMatches = matchesByRound[round] || [];
          const isCurrentRound = round === currentRound;
          const isPastRound = round < currentRound;
          
          return (
            <div 
              key={round} 
              className="flex flex-col"
              style={{
                gap: `${getMatchSpacing(round)}px`,
                justifyContent: 'space-around',
                minHeight: round === 1 ? '300px' : `${Math.pow(2, round - 1) * 160}px`,
              }}
            >
              {roundMatches.map((match) => {
                const isPlayable = isCurrentRound && roundStarted && !match.winner && match.participant1 && match.participant2;
                const showMatch = isPastRound || isCurrentRound;
                
                if (!showMatch) {
                  // Future round - show placeholder
                  return (
                    <div 
                      key={match.id}
                      className="w-[140px] h-[70px] bg-muted/30 rounded-lg border-2 border-dashed border-border opacity-50"
                    />
                  );
                }
                
                return (
                  <div 
                    key={match.id}
                    className={cn(
                      "w-[140px] transition-all duration-300",
                      match.winner && "opacity-60",
                      isPlayable && "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg"
                    )}
                  >
                    {match.participant1 && match.participant2 ? (
                      <div className={cn(
                        "bg-card rounded-lg shadow-md overflow-hidden",
                        match.winner && "ring-2 ring-green-500"
                      )}>
                        <MatchSlot participant={match.participant1} isWinner={match.winner?.id === match.participant1.id} />
                        <div className="h-px bg-border" />
                        <MatchSlot participant={match.participant2} isWinner={match.winner?.id === match.participant2.id} />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <MatchSlot participant={match.participant1} isWinner={!!match.winner} />
                        <MatchSlot participant={match.participant2} isWinner={false} />
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

interface MatchSlotProps {
  participant: TournamentMatchType['participant1'];
  isWinner: boolean;
}

function MatchSlot({ participant, isWinner }: MatchSlotProps) {
  if (!participant) {
    return (
      <div className="h-[32px] bg-muted/30 rounded border border-dashed border-border" />
    );
  }
  
  return (
    <div className={cn(
      "h-[32px] flex items-center gap-1.5 px-2 py-1 bg-muted/50",
      isWinner && "bg-green-500/20"
    )}>
      <div className="w-5 h-6 rounded overflow-hidden bg-muted flex-shrink-0">
        {participant.anime.poster && (
          <img src={participant.anime.poster} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <span className="text-xs font-medium truncate flex-1 text-foreground">{participant.anime.title}</span>
      {isWinner && <span className="text-green-500 text-sm">✓</span>}
    </div>
  );
}