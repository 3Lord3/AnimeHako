import { useState, useCallback } from 'react';
import type { AnimeListItem } from '@/types';

export interface TournamentParticipant {
  id: string;
  anime: AnimeListItem;
  seed: number;
  eliminated: boolean;
  finalPosition: number | null;
}

// Compatibility alias for Pair (used by TournamentMatch component)
export interface TournamentMatch {
  id: string;
  round: number;
  matchNumber: number;
  participant1: TournamentParticipant | null;
  participant2: TournamentParticipant | null;
  winner: TournamentParticipant | null;
  nextMatchId: string | null;
}

export interface Pair {
  id: string;
  roundIndex: number;
  pairIndex: number;
  participants: TournamentParticipant[];
  winner: TournamentParticipant | null;
  status: 'pending' | 'bye' | 'playing' | 'completed';
}

export interface Round {
  index: number;
  pairs: Pair[];
  isComplete: boolean;
}

export interface TournamentState {
  allParticipants: TournamentParticipant[];
  rounds: Round[];
  currentRoundIndex: number;
  champion: TournamentParticipant | null;
  isComplete: boolean;
  roundStarted: boolean;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generatePairId(roundIndex: number, pairIndex: number): string {
  return `round-${roundIndex}-pair-${pairIndex}`;
}

/**
 * Create pairs for a round from a list of participants.
 * If odd number of participants, the last one gets a bye.
 */
function createPairsForRound(
  participants: TournamentParticipant[],
  roundIndex: number
): Pair[] {
  const pairs: Pair[] = [];
  
  for (let i = 0; i < participants.length; i += 2) {
    const pairIndex = pairs.length;
    const pair: Pair = {
      id: generatePairId(roundIndex, pairIndex),
      roundIndex,
      pairIndex,
      participants: [participants[i]],
      winner: null,
      status: 'pending',
    };
    
    if (i + 1 < participants.length) {
      pair.participants.push(participants[i + 1]);
    } else {
      // Odd number - this participant gets a bye
      pair.status = 'bye';
      pair.winner = participants[i];
    }
    
    pairs.push(pair);
  }
  
  return pairs;
}

/**
 * Build tournament with dynamic pairs.
 * Each round has pairs, winner of each pair goes to next round at the same index.
 * We create all rounds upfront with structure, but winners are determined dynamically.
 */
function buildTournamentRounds(animeList: AnimeListItem[]): Round[] {
  const shuffled = shuffleArray(animeList);
  console.log('[buildTournamentRounds] Starting with', shuffled.length, 'anime');
  
  const participants: TournamentParticipant[] = shuffled.map((anime, index) => ({
    id: `participant-${anime.id}`,
    anime,
    seed: index + 1,
    eliminated: false,
    finalPosition: null,
  }));
  
  const rounds: Round[] = [];
  let currentParticipants = [...participants];
  let roundIndex = 0;
  
  while (currentParticipants.length > 1) {
    const pairs = createPairsForRound(currentParticipants, roundIndex);
    
    console.log(`[buildTournamentRounds] Round ${roundIndex}:`, {
      participantsCount: currentParticipants.length,
      pairsCount: pairs.length,
      pairs: pairs.map(p => ({
        id: p.id,
        participants: p.participants.map(pp => pp.anime.title),
        status: p.status,
      })),
    });
    
    rounds.push({
      index: roundIndex,
      pairs,
      isComplete: false,
    });
    
    // For next round, we just need the structure - we'll fill in actual winners later
    // Use placeholder participants to determine round structure
    const nextRoundSize = Math.ceil(currentParticipants.length / 2);
    const nextParticipants: TournamentParticipant[] = [];
    for (let i = 0; i < nextRoundSize; i++) {
      nextParticipants.push({
        id: `placeholder-${roundIndex + 1}-${i}`,
        anime: { id: -1, title: 'TBD' } as any,
        seed: i + 1,
        eliminated: false,
        finalPosition: null,
      });
    }
    
    currentParticipants = nextParticipants;
    roundIndex++;
  }
  
  console.log('[buildTournamentRounds] Final structure:', rounds.map(r => ({
    index: r.index,
    pairsCount: r.pairs.length
  })));
  
  return rounds;
}

export function useTournament() {
  const [tournament, setTournament] = useState<TournamentState | null>(null);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  
  const initializeTournament = useCallback((animeList: AnimeListItem[]) => {
    console.log('[useTournament] initializeTournament called with', animeList.length, 'anime');
    
    if (animeList.length < 2) {
      console.warn('[useTournament] Need at least 2 participants');
      return;
    }
    
    const rounds = buildTournamentRounds(animeList);
    
    // Only add participants from first round since that's where actual participants are
    // Subsequent rounds have placeholder participants
    const allParticipants: TournamentParticipant[] = [];
    rounds[0].pairs.forEach(pair => {
      pair.participants.forEach(p => {
        if (!allParticipants.find(ap => ap.id === p.id)) {
          allParticipants.push(p);
        }
      });
    });
    
    const newTournament: TournamentState = {
      allParticipants,
      rounds,
      currentRoundIndex: 0,
      champion: null,
      isComplete: false,
      roundStarted: false,
    };
    
    console.log('[useTournament] Created tournament:', {
      participantsCount: allParticipants.length,
      roundsCount: rounds.length,
      rounds: rounds.map(r => ({
        index: r.index,
        pairsCount: r.pairs.length,
        pairs: r.pairs.map(p => ({
          id: p.id,
          participants: p.participants.map(pp => pp.anime.title),
          status: p.status,
        })),
      })),
    });
    
    setTournament(newTournament);
    setCurrentPairIndex(0);
  }, []);
  
  const startRound = useCallback(() => {
    console.log('[useTournament] startRound called');
    
    setTournament(prev => {
      if (!prev) {
        console.log('[useTournament] startRound: no tournament yet');
        return prev;
      }
      
      console.log('[useTournament] startRound: updating tournament state');
      
      // Mark pairs with two participants as 'playing'
      const updatedPairs = prev.rounds[prev.currentRoundIndex].pairs.map(pair => {
        if (pair.status === 'pending' && pair.participants.length === 2) {
          return { ...pair, status: 'playing' as const };
        }
        return pair;
      });
      
      const updatedRounds = [...prev.rounds];
      updatedRounds[prev.currentRoundIndex] = {
        ...updatedRounds[prev.currentRoundIndex],
        pairs: updatedPairs,
      };
      
      return { ...prev, rounds: updatedRounds, roundStarted: true };
    });
    
    setCurrentPairIndex(0);
  }, []);
  
  const selectWinner = useCallback((pairId: string, winnerId: string) => {
    console.log('[useTournament] selectWinner:', { pairId, winnerId });
    
    setTournament(prev => {
      if (!prev) {
        console.warn('[useTournament] selectWinner: no tournament');
        return prev;
      }
      
      const currentRound = prev.rounds[prev.currentRoundIndex];
      const pairIndex = currentRound.pairs.findIndex(p => p.id === pairId);
      
      if (pairIndex === -1) {
        console.warn('[useTournament] Pair not found:', pairId);
        return prev;
      }
      
      const pair = currentRound.pairs[pairIndex];
      console.log('[useTournament] Found pair:', {
        id: pair.id,
        participants: pair.participants.map(p => p.anime.title),
        status: pair.status,
      });
      
      // Find winner participant
      const winner = pair.participants.find(p => p.id === winnerId);
      if (!winner) {
        console.warn('[useTournament] Winner not found in pair participants');
        return prev;
      }
      
      // Update the pair with winner
      const updatedPair = { ...pair, winner, status: 'completed' as const };
      
      // Create updated pairs array
      const updatedPairs = [...currentRound.pairs];
      updatedPairs[pairIndex] = updatedPair;
      
      // Check if round is complete
      const allPairsDecided = updatedPairs.every(p => 
        p.status === 'completed' || p.status === 'bye'
      );
      
      console.log('[useTournament] After selecting winner:', {
        pairId,
        winner: winner.anime.title,
        allPairsDecided,
        pairs: updatedPairs.map(p => ({
          id: p.id,
          status: p.status,
          winner: p.winner?.anime?.title || null,
        })),
      });
      
      // If round is complete, create next round with winners
      let nextRoundIndex = prev.currentRoundIndex;
      let updatedRounds = [...prev.rounds];
      let isComplete = false;
      let champion = prev.champion;
      
      // Always update the current round's pairs
      updatedRounds[prev.currentRoundIndex] = {
        ...updatedRounds[prev.currentRoundIndex],
        pairs: updatedPairs,
      };
      
      if (allPairsDecided) {
        console.log('[useTournament] Round complete, processing winners');
        
        // Mark current round as complete
        updatedRounds[prev.currentRoundIndex].isComplete = true;
        
        // Collect winners for next round
        const winners = updatedPairs.map(p => {
          if (p.status === 'bye') {
            return p.participants[0];
          }
          if (!p.winner) {
            console.warn('[useTournament] Pair has no winner despite allPairsDecided:', p.id);
            return null;
          }
          return p.winner;
        }).filter((w): w is TournamentParticipant => w !== null);
        
        console.log('[useTournament] Winners for next round:', winners.map(w => w.anime.title));
        
        if (winners.length === 1) {
          // Tournament complete!
          console.log('[useTournament] Tournament complete! Champion:', winners[0].anime.title);
          isComplete = true;
          champion = winners[0];
        } else {
          // Create next round
          const nextRoundPairs = createPairsForRound(winners, prev.currentRoundIndex + 1);
          nextRoundIndex = prev.currentRoundIndex + 1;
          
          console.log('[useTournament] Creating next round:', {
            roundIndex: nextRoundIndex,
            pairsCount: nextRoundPairs.length,
            pairs: nextRoundPairs.map(p => ({
              participants: p.participants.map(pp => pp.anime.title),
              status: p.status,
            })),
          });
          
          // Ensure we have enough rounds array slots
          while (updatedRounds.length <= nextRoundIndex) {
            updatedRounds.push({
              index: updatedRounds.length,
              pairs: [],
              isComplete: false,
            });
          }
          
          updatedRounds[nextRoundIndex] = {
            index: nextRoundIndex,
            pairs: nextRoundPairs,
            isComplete: false,
          };
        }
      }
      
      const result: TournamentState = {
        ...prev,
        rounds: updatedRounds,
        currentRoundIndex: nextRoundIndex,
        isComplete,
        champion,
        roundStarted: !allPairsDecided,
      };
      
      console.log('[useTournament] New state:', {
        currentRoundIndex: result.currentRoundIndex,
        isComplete: result.isComplete,
        roundStarted: result.roundStarted,
        champion: result.champion?.anime?.title || null,
        rounds: result.rounds.map(r => ({
          index: r.index,
          pairsCount: r.pairs.length,
          isComplete: r.isComplete,
        })),
      });
      
      return result;
    });
    
    // Move to next pair if available
    setCurrentPairIndex(prev => {
      if (!tournament) return prev;
      const currentRound = tournament.rounds[tournament.currentRoundIndex];
      const pendingPairs = currentRound.pairs.filter(
        p => p.status === 'playing' && !p.winner
      );
      const currentIdx = pendingPairs.findIndex(p => p.id === pairId);
      const nextIdx = currentIdx + 1;
      return nextIdx < pendingPairs.length ? nextIdx : prev;
    });
  }, [tournament, currentPairIndex]);
  
  const getNextAvailablePair = useCallback(() => {
    if (!tournament || !tournament.roundStarted) return null;
    
    const currentRound = tournament.rounds[tournament.currentRoundIndex];
    const pendingPairs = currentRound.pairs.filter(
      p => p.status === 'playing' && !p.winner
    );
    
    if (currentPairIndex < pendingPairs.length) {
      return pendingPairs[currentPairIndex];
    }
    return null;
  }, [tournament, currentPairIndex]);
  
  const getResults = useCallback(() => {
    if (!tournament) return [];
    
    const sorted = [...tournament.allParticipants].sort((a, b) => {
      if (tournament.champion && a.id === tournament.champion.id) return -1;
      if (tournament.champion && b.id === tournament.champion.id) return 1;
      return a.seed - b.seed;
    });
    
    return sorted.map((p, index) => ({
      ...p,
      position: index + 1,
    }));
  }, [tournament]);
  
  const resetTournament = useCallback(() => {
    setTournament(null);
    setCurrentPairIndex(0);
  }, []);
  
  return {
    tournament,
    currentPairIndex,
    initializeTournament,
    startRound,
    selectWinner,
    getNextAvailablePair,
    getResults,
    resetTournament,
  };
}