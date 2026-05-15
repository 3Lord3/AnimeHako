import { useState, useEffect } from 'react';
import { useUserAnimeList } from '@/hooks';
import { useTournament, type Pair } from '@/hooks/useTournament';
import type { AnimeListItem } from '@/types';
import { TournamentIntro } from './components/TournamentIntro';
import { TournamentMatch } from './components/TournamentMatch';
import { TournamentResults } from './components/TournamentResults';
import { TournamentBracket } from './components/TournamentBracket';
import { SuspenseFallback } from '@/components/SuspenseFallback';
import { Swords, Target, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AnimeTournamentPage() {
  const [isStarted, setIsStarted] = useState(false);
  const [activePair, setActivePair] = useState<Pair | null>(null);
  const [pairQueue, setPairQueue] = useState<Pair[]>([]);
  const { data: completedList, isLoading } = useUserAnimeList('completed');
  const { 
    tournament, 
    initializeTournament, 
    startRound,
    selectWinner, 
    getResults, 
    resetTournament,
  } = useTournament();
  
  const completedAnime = completedList?.map(item => item.anime) || [];
  
  const handleStart = (selectedAnime: AnimeListItem[]) => {
    if (selectedAnime.length >= 4) {
      initializeTournament(selectedAnime);
      setIsStarted(true);
      setPairQueue([]);
      setActivePair(null);
    }
  };
  
  const handleRestart = () => {
    resetTournament();
    setIsStarted(false);
    setActivePair(null);
    setPairQueue([]);
  };
  
  const handleSelectWinner = (pairId: string, winnerId: string) => {
    selectWinner(pairId, winnerId);
    setActivePair(null);
    
    // After selecting winner, if there are more pairs in queue, open next
    if (pairQueue.length > 0) {
      const nextPair = pairQueue[0];
      setPairQueue(prev => prev.slice(1));
      setActivePair(nextPair);
    }
  };
  
  const handleStartRound = () => {
    if (!tournament) return;
    startRound();
  };
  
  // Effect to handle round started - runs after tournament state updates
  useEffect(() => {
    if (!tournament || !tournament.roundStarted) return;
    
    // Build queue of all pairs in this round that need to be played
    const currentRound = tournament.rounds[tournament.currentRoundIndex];
    console.log('[AnimeTournamentPage] useEffect handleStartRound:', {
      currentRoundIndex: tournament.currentRoundIndex,
      pairsCount: currentRound.pairs.length,
      pairs: currentRound.pairs.map(p => ({
        id: p.id,
        participants: p.participants.map(pp => pp.anime.title),
        status: p.status,
        winner: p.winner?.anime?.title || null,
      })),
    });
    
    const playablePairs = currentRound.pairs.filter(
      p => p.status === 'playing' && !p.winner && p.participants.length === 2
    );
    console.log('[AnimeTournamentPage] playablePairs:', playablePairs.length, playablePairs.map(p => p.id));
    
    if (playablePairs.length > 0) {
      setPairQueue(playablePairs.slice(1)); // All except first
      setActivePair(playablePairs[0]); // Open first immediately
    }
  }, [tournament?.roundStarted, tournament?.currentRoundIndex]);
  
  // Show loading
  if (isLoading) {
    return <SuspenseFallback message="Загрузка списка аниме..." />;
  }
  
  // Not started - show intro
  if (!isStarted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <TournamentIntro 
          completedAnime={completedAnime}
          onStart={handleStart}
        />
      </div>
    );
  }
  
  // Tournament complete - show results
  if (tournament?.isComplete) {
    const results = getResults();
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🏆 Турнир завершён!</h1>
          <p className="text-muted-foreground">Поздравляем с определением победителя</p>
        </div>
        <TournamentResults 
          participants={results}
          champion={tournament.champion}
          onRestart={handleRestart}
        />
      </div>
    );
  }
  
  // Active pair - full screen view
  if (activePair) {
    const currentRound = tournament?.rounds[tournament.currentRoundIndex];
    const currentPairIdx = currentRound?.pairs.findIndex(p => p.id === activePair.id) ?? 0;
    const totalInRound = currentRound?.pairs.filter(p => p.participants.length === 2).length ?? 0;
    const totalRounds = tournament?.rounds.length ?? 1;
    const currentRoundDisplay = tournament?.currentRoundIndex ?? 0;
    
    // Convert Pair to a format TournamentMatch can use
    // TournamentMatch expects participant1 and participant2, we have participants array
    const match = {
      id: activePair.id,
      round: currentRoundDisplay + 1,
      matchNumber: currentPairIdx + 1,
      participant1: activePair.participants[0] || null,
      participant2: activePair.participants[1] || null,
      winner: activePair.winner,
      nextMatchId: null,
    };
    
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <TournamentMatch
          match={match}
          roundNumber={currentRoundDisplay + 1}
          totalRounds={totalRounds}
          onSelectWinner={handleSelectWinner}
          onBack={undefined}
          isActive={true}
          matchIndex={currentPairIdx}
          totalMatchesInRound={totalInRound}
        />
      </div>
    );
  }
  
  // Show bracket with start round button
  const getRoundName = (roundIndex: number, total: number) => {
    // roundIndex is 0-based, convert to 1-based for display
    const displayRound = roundIndex + 1;
    if (displayRound === total) return 'Финал';
    if (total === 2 && displayRound === 1) return 'Полуфинал';
    if (total === 3 && displayRound === 1) return 'Четвертьфинал';
    if (total === 3 && displayRound === 2) return 'Полуфинал';
    if (displayRound === total - 1) return 'Полуфинал';
    if (displayRound === total - 2) return 'Четвертьфинал';
    return `${displayRound} раунд`;
  };
  
  const currentRound = tournament?.rounds[tournament.currentRoundIndex];
  const allRoundPairs = currentRound?.pairs || [];
  const completedPairs = allRoundPairs.filter(p => p.status === 'completed' || p.status === 'bye').length;
  const pendingPairs = allRoundPairs.filter(p => p.status === 'playing' && !p.winner && p.participants.length === 2).length;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2 text-foreground">
          <Swords className="w-8 h-8" />
          Anime Tournament
        </h1>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            {getRoundName(tournament?.currentRoundIndex || 0, tournament?.rounds.length || 1)}
          </span>
          <span>•</span>
          <span>{completedAnime.length} участников</span>
        </div>
      </div>
      
      {/* Tournament bracket */}
      {tournament && (
        <>
          <TournamentBracket
            rounds={tournament.rounds}
            currentRoundIndex={tournament.currentRoundIndex}
            roundStarted={tournament.roundStarted}
          />
          
          {/* Start Round button */}
          {!tournament.roundStarted && (
            <div className="text-center mt-8">
              <Button 
                onClick={handleStartRound}
                size="lg"
                className="gap-2 text-lg px-8 py-6 bg-gradient-to-r from-primary to-yellow-500 hover:from-primary/90 hover:to-yellow-500/90 text-white font-semibold"
              >
                <Play className="w-5 h-5" />
                Начать {getRoundName(tournament.currentRoundIndex, tournament.rounds.length).toLowerCase()}
              </Button>
            </div>
          )}
          
          {/* Round progress */}
          {tournament.roundStarted && allRoundPairs.length > 0 && (
            <div className="text-center mt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
                <span className="text-sm">
                  {completedPairs}/{allRoundPairs.length} пар определено
                </span>
                {pendingPairs > 0 && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm font-medium text-primary">
                      {pendingPairs} в процессе
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}