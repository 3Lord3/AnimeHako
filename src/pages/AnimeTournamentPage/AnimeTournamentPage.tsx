import { useState, useEffect } from 'react';
import { useUserAnimeList } from '@/hooks';
import { useTournament } from '@/hooks/useTournament';
import { TournamentIntro } from './components/TournamentIntro';
import { TournamentMatch } from './components/TournamentMatch';
import { TournamentResults } from './components/TournamentResults';
import { TournamentBracket } from './components/TournamentBracket';
import { SuspenseFallback } from '@/components/SuspenseFallback';
import { Swords, Target, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TournamentMatch as TournamentMatchType } from '@/hooks/useTournament';

export function AnimeTournamentPage() {
  const [isStarted, setIsStarted] = useState(false);
  const [activeMatch, setActiveMatch] = useState<TournamentMatchType | null>(null);
  const [matchQueue, setMatchQueue] = useState<TournamentMatchType[]>([]);
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
  
  const handleStart = () => {
    if (completedAnime.length >= 4) {
      initializeTournament(completedAnime);
      setIsStarted(true);
      setMatchQueue([]);
      setActiveMatch(null);
    }
  };
  
  const handleRestart = () => {
    resetTournament();
    setIsStarted(false);
    setActiveMatch(null);
    setMatchQueue([]);
  };
  
  const handleSelectWinner = (matchId: string, winnerId: string) => {
    selectWinner(matchId, winnerId);
    setActiveMatch(null);
    
    // After selecting winner, if there are more matches in queue, open next
    if (matchQueue.length > 0) {
      const nextMatch = matchQueue[0];
      setMatchQueue(prev => prev.slice(1));
      setActiveMatch(nextMatch);
    }
  };
  
  const handleStartRound = () => {
    if (!tournament) return;
    
    startRound();
    
    // Build queue of all matches in this round that need to be played
    const roundMatches = tournament.matches.filter(m => m.round === tournament.currentRound);
    const playableMatches = roundMatches.filter(m => m.participant1 && m.participant2 && !m.winner);
    
    if (playableMatches.length > 0) {
      setMatchQueue(playableMatches.slice(1)); // All except first
      setActiveMatch(playableMatches[0]); // Open first immediately
    }
  };
  
  // Show loading
  if (isLoading) {
    return <SuspenseFallback message="Загрузка списка аниме..." />;
  }
  
  // Not started - show intro
  if (!isStarted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <TournamentIntro 
          animeCount={completedAnime.length}
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
  
  // Active match - full screen view
  if (activeMatch) {
    const roundMatches = tournament?.matches.filter(m => m.round === tournament.currentRound) || [];
    const currentMatchIdx = roundMatches.findIndex(m => m.id === activeMatch.id);
    const totalInRound = roundMatches.length;
    
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <TournamentMatch
          match={activeMatch}
          roundNumber={tournament?.currentRound || 1}
          totalRounds={tournament?.totalRounds || 1}
          onSelectWinner={handleSelectWinner}
          onBack={undefined}
          isActive={true}
          matchIndex={currentMatchIdx >= 0 ? currentMatchIdx : 0}
          totalMatchesInRound={totalInRound}
        />
      </div>
    );
  }
  
  // Show bracket with start round button
  const getRoundName = (round: number, total: number) => {
    if (round === total) return 'Финал';
    if (total === 2 && round === 1) return 'Полуфинал';
    if (total === 3 && round === 1) return 'Четвертьфинал';
    if (total === 3 && round === 2) return 'Полуфинал';
    if (round === total - 1) return 'Полуфинал';
    if (round === total - 2) return 'Четвертьфинал';
    return `${round}/${Math.pow(2, round)} финала`;
  };
  
  const allRoundMatches = tournament?.matches.filter(m => m.round === tournament.currentRound) || [];
  const completedMatches = allRoundMatches.filter(m => m.winner).length;
  const pendingMatches = allRoundMatches.filter(m => !m.winner && m.participant1 && m.participant2).length;
  
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
            {getRoundName(tournament?.currentRound || 1, tournament?.totalRounds || 1)}
          </span>
          <span>•</span>
          <span>{completedAnime.length} участников</span>
        </div>
      </div>
      
      {/* Tournament bracket */}
      {tournament && (
        <>
          <TournamentBracket
            matches={tournament.matches}
            currentRound={tournament.currentRound}
            totalRounds={tournament.totalRounds}
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
                Начать {getRoundName(tournament.currentRound, tournament.totalRounds).toLowerCase()}
              </Button>
            </div>
          )}
          
          {/* Round progress */}
          {tournament.roundStarted && allRoundMatches.length > 0 && (
            <div className="text-center mt-4 text-muted-foreground">
              {completedMatches} из {allRoundMatches.length} матчей завершено
            </div>
          )}
        </>
      )}
    </div>
  );
}