import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Swords, ArrowLeft } from 'lucide-react';
import { TournamentCard } from './TournamentCard';
import type { TournamentMatch as TournamentMatchType, TournamentParticipant } from '@/hooks/useTournament';
import { cn } from '@/lib/utils';

interface TournamentMatchProps {
  match: TournamentMatchType;
  roundNumber: number;
  totalRounds: number;
  onSelectWinner: (matchId: string, winnerId: string) => void;
  onBack?: () => void;
  isActive: boolean;
  matchIndex: number;
  totalMatchesInRound: number;
}

export function TournamentMatch({ 
  match, 
  roundNumber, 
  totalRounds,
  onSelectWinner,
  onBack,
  isActive,
  matchIndex,
  totalMatchesInRound,
}: TournamentMatchProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  
  const getRoundName = (round: number, total: number) => {
    // round is 1-based (1 = first round, total = final)
    // displayRound should be 1 for first round, total for final
    if (round === total) return 'Финал';
    if (total === 2 && round === 1) return 'Полуфинал';
    if (total === 3 && round === 1) return 'Четвертьфинал';
    if (total === 3 && round === 2) return 'Полуфинал';
    if (round === total - 1) return 'Полуфинал';
    if (round === total - 2) return 'Четвертьфинал';
    return `${round} раунд`;
  };
  
  const roundName = getRoundName(roundNumber, totalRounds);
  
  useEffect(() => {
    setSelectedId(null);
    setShowResult(false);
    setIsSelecting(false);
  }, [match.id]);
  
  const handleSelect = (participant: TournamentParticipant) => {
    if (!isActive || match.winner || isSelecting || !participant) return;
    
    setIsSelecting(true);
    setSelectedId(participant.id);
    setShowResult(true);
    
    setTimeout(() => {
      onSelectWinner(match.id, participant.id);
    }, 800);
  };
  
  const participant1 = match.participant1;
  const participant2 = match.participant2;
  
  if (!participant1 || !participant2) {
    return null;
  }
  
  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header with back button */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Назад</span>
          </button>
        )}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm font-medium">
          {roundNumber === totalRounds ? (
            <Trophy className="w-4 h-4 text-yellow-500" />
          ) : (
            <Swords className="w-4 h-4" />
          )}
          {roundName}
          <span className="text-muted-foreground">
            ({matchIndex + 1}/{totalMatchesInRound})
          </span>
        </div>
        <div className="w-20" />
      </div>
      
      {/* Match container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className={cn(
          "w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8",
          isActive && "ring-2 ring-primary/20 rounded-2xl p-4"
        )}>
          {/* Participant 1 */}
          <motion.div
            animate={selectedId === participant1.id ? { scale: 1.02 } : { scale: 1 }}
            className="relative"
          >
            <TournamentCard
              anime={participant1.anime}
              isWinner={match.winner?.id === participant1.id}
              isEliminated={match.winner ? match.winner.id !== participant1.id : false}
              onClick={isActive && !match.winner && !isSelecting ? () => handleSelect(participant1) : undefined}
            />
            {selectedId === participant1.id && showResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-green-500/30 rounded-xl"
              >
                <span className="text-white font-bold text-3xl drop-shadow-lg">✓</span>
              </motion.div>
            )}
          </motion.div>
          
          {/* VS indicator */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 md:block hidden">
            <div className="bg-background/90 rounded-full p-4 shadow-lg">
              <span className="text-3xl font-black text-primary">VS</span>
            </div>
          </div>
          
          {/* Participant 2 */}
          <motion.div
            animate={selectedId === participant2.id ? { scale: 1.02 } : { scale: 1 }}
            className="relative"
          >
            <TournamentCard
              anime={participant2.anime}
              isWinner={match.winner?.id === participant2.id}
              isEliminated={match.winner ? match.winner.id !== participant2.id : false}
              onClick={isActive && !match.winner && !isSelecting ? () => handleSelect(participant2) : undefined}
            />
            {selectedId === participant2.id && showResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-green-500/30 rounded-xl"
              >
                <span className="text-white font-bold text-3xl drop-shadow-lg">✓</span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* Mobile VS indicator */}
      <div className="md:hidden flex justify-center py-4">
        <div className="bg-muted rounded-full px-6 py-2">
          <span className="text-xl font-black text-primary">VS</span>
        </div>
      </div>
    </div>
  );
}