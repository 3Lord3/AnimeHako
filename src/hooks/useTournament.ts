import { useState, useCallback } from 'react';
import type { AnimeListItem } from '@/types';

export interface TournamentParticipant {
  id: string;
  anime: AnimeListItem;
  seed: number;
  eliminated: boolean;
  finalPosition: number | null;
}

export interface Pair {
  id: string;
  roundIndex: number;
  pairIndex: number;
  participants: TournamentParticipant[];
  winner: TournamentParticipant | null;
  status: 'pending' | 'bye' | 'playing' | 'completed';
}

// Compatibility alias for TournamentMatch (used by TournamentMatch component)
export interface TournamentMatch extends Pair {}

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
  
  return rounds;
}

export function useTournament() {
  const [tournament, setTournament] = useState<TournamentState | null>(null);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  
  const initializeTournament = useCallback((animeList: AnimeListItem[]) => {
    if (animeList.length < 2) return;
    
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
    
    setTournament(newTournament);
    setCurrentPairIndex(0);
  }, []);
  
  const startRound = useCallback(() => {
    setTournament(prev => {
      if (!prev) return prev;
      
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
    setTournament(prev => {
      if (!prev) return prev;

      const currentRound = prev.rounds[prev.currentRoundIndex];
      const pairIndex = currentRound.pairs.findIndex(p => p.id === pairId);
      if (pairIndex === -1) return prev;

      const pair = currentRound.pairs[pairIndex];
      const winner = pair.participants.find(p => p.id === winnerId);
      if (!winner) return prev;

      const updatedPair = { ...pair, winner, status: 'completed' as const };
      const updatedPairs = [...currentRound.pairs];
      updatedPairs[pairIndex] = updatedPair;

      const allPairsDecided = updatedPairs.every(p =>
        p.status === 'completed' || p.status === 'bye'
      );

      let nextRoundIndex = prev.currentRoundIndex;
      let updatedRounds = [...prev.rounds];
      let isComplete = false;
      let champion = prev.champion;

      updatedRounds[prev.currentRoundIndex] = {
        ...updatedRounds[prev.currentRoundIndex],
        pairs: updatedPairs,
      };

      if (allPairsDecided) {
        updatedRounds[prev.currentRoundIndex].isComplete = true;

        const winners = updatedPairs.map(p => {
          if (p.status === 'bye') return p.participants[0];
          return p.winner;
        }).filter((w): w is TournamentParticipant => w !== null);

        if (winners.length === 1) {
          isComplete = true;
          champion = winners[0];
        } else {
          const nextRoundPairs = createPairsForRound(winners, prev.currentRoundIndex + 1);
          nextRoundIndex = prev.currentRoundIndex + 1;

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

      return {
        ...prev,
        rounds: updatedRounds,
        currentRoundIndex: nextRoundIndex,
        isComplete,
        champion,
        roundStarted: !allPairsDecided,
      };
    });
  }, []);
  
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
  
  const resetRound = useCallback(() => {
    setTournament(prev => {
      if (!prev) return prev;

      // Reset all pairs in the current round to 'pending' status with no winners
      const updatedRounds = prev.rounds.map((round, idx) => {
        if (idx === prev.currentRoundIndex) {
          return {
            ...round,
            pairs: round.pairs.map(pair => ({
              ...pair,
              winner: null,
              status: pair.participants.length === 2 ? 'pending' : pair.status,
            })),
          };
        }
        return round;
      });

      return {
        ...prev,
        rounds: updatedRounds,
        roundStarted: false,
      };
    });
  }, []);

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
    resetRound,
  };
}