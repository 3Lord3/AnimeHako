import { useState, useCallback, useRef, useEffect } from 'react';
import type { AnimeListItem } from '@/types';

export interface TournamentParticipant {
  id: string;
  anime: AnimeListItem;
  seed: number;
  eliminated: boolean;
  finalPosition: number | null;
  advancedFromRound?: number; // Track which round they auto-advanced from
}

export interface TournamentMatch {
  id: string;
  round: number;
  matchNumber: number;
  participant1: TournamentParticipant | null;
  participant2: TournamentParticipant | null;
  winner: TournamentParticipant | null;
  nextMatchId: string | null;
}

export interface TournamentState {
  participants: TournamentParticipant[];
  matches: TournamentMatch[];
  currentRound: number;
  totalRounds: number;
  isComplete: boolean;
  champion: TournamentParticipant | null;
  roundStarted: boolean;
  byeParticipants: TournamentParticipant[]; // Participants who auto-advance after round completes
  roundComplete: boolean; // True when all matches in round are decided
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateMatchId(round: number, matchNumber: number): string {
  return `round-${round}-match-${matchNumber}`;
}

// Build bracket where all participants start in round 1
// BYE handling: participants without opponents stay in round 1 visually
// but auto-advance after round completes
function createTournamentBracket(animeList: AnimeListItem[]): TournamentState {
  const shuffled = shuffleArray(animeList);
  const count = shuffled.length;
  
  const participants: TournamentParticipant[] = shuffled.map((anime, index) => ({
    id: `participant-${anime.id}`,
    anime,
    seed: index + 1,
    eliminated: false,
    finalPosition: null,
  }));
  
  const matches: TournamentMatch[] = [];
  
  if (count <= 4) {
    // 4 participants -> 2 rounds (semifinals + final)
    // Round 1: 2 matches (semifinals)
    matches.push({
      id: generateMatchId(1, 1),
      round: 1,
      matchNumber: 1,
      participant1: participants[0],
      participant2: participants[1],
      winner: null,
      nextMatchId: generateMatchId(2, 1),
    });
    matches.push({
      id: generateMatchId(1, 2),
      round: 1,
      matchNumber: 2,
      participant1: participants[2],
      participant2: participants[3],
      winner: null,
      nextMatchId: generateMatchId(2, 1),
    });
    // Round 2: Final (empty until semifinals complete)
    matches.push({
      id: generateMatchId(2, 1),
      round: 2,
      matchNumber: 1,
      participant1: null,
      participant2: null,
      winner: null,
      nextMatchId: null,
    });
    
    return {
      participants,
      matches,
      currentRound: 1,
      totalRounds: 2,
      isComplete: false,
      champion: null,
      roundStarted: false,
      byeParticipants: [],
      roundComplete: false,
    };
  } else {
    // For 5-8 participants -> 3 rounds (QF + SF + F)
    // Round 1: QF - create matches only for paired participants
    // Participants without opponents are "bye" - they'll be shown as bye match in round 1
    
    const pairedCount = Math.floor(count / 2) * 2; // 4 for 5 participants
    const byeCount = count - pairedCount; // 1 for 5 participants
    
    // Create QF matches for paired participants
    // For 5-8 participants, QF winners go to SF:
    // - QF1, QF2 -> SF1
    // - QF3, QF4 -> SF2
    // For 6 participants (3 QF): QF1->SF1(p1), QF2->SF1(p2), QF3->SF2(p1)
    // For 7 participants (3 QF): same as 6 + bye to SF2(p2)
    // For 8 participants (4 QF): QF1->SF1, QF2->SF1, QF3->SF2, QF4->SF2
    for (let i = 0; i < pairedCount / 2; i++) {
      const p1 = participants[i * 2];
      const p2 = participants[i * 2 + 1];
      
      // Determine which SF this QF match feeds into
      // QF matches 0,1 -> SF1 (when 4 or more QF matches)
      // QF matches 2,3 -> SF2
      const qfCount = pairedCount / 2;
      let sfNumber = 1;
      if (qfCount >= 4) {
        // 8 participants (4 QF): first half to SF1, second half to SF2
        sfNumber = i < qfCount / 2 ? 1 : 2;
      } else if (qfCount === 3) {
        // 6 or 7 participants (3 QF): first 2 to SF1, third to SF2
        sfNumber = i < 2 ? 1 : 2;
      }
      
      matches.push({
        id: generateMatchId(1, i + 1),
        round: 1,
        matchNumber: i + 1,
        participant1: p1,
        participant2: p2,
        winner: null,
        nextMatchId: generateMatchId(2, sfNumber),
      });
    }
    
    // Create bye match for unpaired participant (shows them in bracket with no opponent)
    // The bye match auto-wins and advances to next round
    const byeParticipants = participants.slice(pairedCount);
    
    if (byeParticipants.length > 0) {
      const byeParticipant = byeParticipants[0];
      console.log('[createTournamentBracket] Creating bye match for:', byeParticipant.anime.title);
      
      // Create bye match in round 1
      matches.push({
        id: generateMatchId(1, pairedCount / 2 + 1),
        round: 1,
        matchNumber: pairedCount / 2 + 1,
        participant1: byeParticipant,
        participant2: null,
        winner: byeParticipant, // Auto winner since no opponent
        nextMatchId: generateMatchId(2, 2), // Bye goes to SF2 (match 2)
      });
      
      // Immediately populate round 2 match 2 with the bye participant
      // because there's no actual match to determine this winner
      const sf2MatchIndex = matches.findIndex(m => m.id === generateMatchId(2, 2));
      if (sf2MatchIndex >= 0) {
        console.log('[createTournamentBracket] Pre-populating SF2 with bye participant');
        matches[sf2MatchIndex] = {
          ...matches[sf2MatchIndex],
          participant1: { ...byeParticipant, advancedFromRound: 1 },
        };
      }
    }
    
    // Round 2: Semifinals - will be populated after QF
    // SF1: Winner QF1 + Winner QF2
    // SF2: Bye participant + Winner QF3 (or auto if no QF3)
    matches.push({
      id: generateMatchId(2, 1),
      round: 2,
      matchNumber: 1,
      participant1: null, // Will be filled with Winner QF1
      participant2: null, // Will be filled with Winner QF2
      winner: null,
      nextMatchId: generateMatchId(3, 1),
    });
    matches.push({
      id: generateMatchId(2, 2),
      round: 2,
      matchNumber: 2,
      participant1: null, // Will be bye participant
      participant2: null, // Will be Winner QF3 (if exists)
      winner: null,
      nextMatchId: generateMatchId(3, 1),
    });
    
    // Now populate round 2 match 2 with the bye winner (if any)
    // BUT only after round 1 is complete (we'll do this in selectWinner when round ends)
    // For now, just track bye participants in the state
    // We don't auto-populate SF2 here - instead we handle it when round 1 completes
    
    // Round 3: Final
    matches.push({
      id: generateMatchId(3, 1),
      round: 3,
      matchNumber: 1,
      participant1: null,
      participant2: null,
      winner: null,
      nextMatchId: null,
    });
    
    return {
      participants,
      matches,
      currentRound: 1,
      totalRounds: 3,
      isComplete: false,
      champion: null,
      roundStarted: false,
      byeParticipants, // Track bye participants for next round
      roundComplete: false,
    };
  }
}

export function useTournament() {
  const [tournament, setTournament] = useState<TournamentState | null>(null);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  
  const initializeTournament = useCallback((animeList: AnimeListItem[]) => {
    console.log('[useTournament] initializeTournament called with', animeList.length, 'anime');
    const newTournament = createTournamentBracket(animeList);
    console.log('[useTournament] Created tournament:', {
      participantsCount: newTournament.participants.length,
      matchesCount: newTournament.matches.length,
      byeParticipantsCount: newTournament.byeParticipants.length,
      byeParticipants: newTournament.byeParticipants.map(p => p.anime.title),
      totalRounds: newTournament.totalRounds,
      matches: newTournament.matches.map(m => ({
        id: m.id,
        round: m.round,
        matchNumber: m.matchNumber,
        p1: m.participant1?.anime?.title || null,
        p2: m.participant2?.anime?.title || null,
        nextMatchId: m.nextMatchId
      }))
    });
    setTournament(newTournament);
    setCurrentMatchIndex(0);
  }, []);
  
  const startRound = useCallback(() => {
    console.log('[useTournament] startRound called, tournament:', tournament ? {
      currentRound: tournament.currentRound,
      totalRounds: tournament.totalRounds,
      roundStarted: tournament.roundStarted,
      participantsCount: tournament.participants.length,
      byeParticipantsCount: tournament.byeParticipants.length
    } : null);
    if (!tournament) return;

    // When starting a round, if there are bye participants and this is round 1,
    // propagate the bye winner to the next round (SF2)
    // This is needed because bye participants are pre-populated at initialization
    // but the winner needs to be propagated to next round when round starts
    if (tournament.byeParticipants.length > 0 && tournament.currentRound === 1) {
      console.log('[useTournament] Round 1 starting with bye participants, propagating bye winner');
      setTournament(prev => {
        if (!prev) return prev;
        // Find the bye match (round 1 match with only participant1, no participant2)
        const byeMatch = prev.matches.find(m => 
          m.round === 1 && m.participant1 && !m.participant2 && m.winner
        );
        if (!byeMatch) return prev;
        
        console.log('[useTournament] Found bye match:', byeMatch.id, 'winner:', byeMatch.winner?.anime?.title);
        
        // Propagate bye winner to SF2 (round 2, match 2)
        const sf2MatchId = generateMatchId(2, 2);
        const updatedMatches = [...prev.matches];
        const sf2Index = updatedMatches.findIndex(m => m.id === sf2MatchId);
        
        if (sf2Index >= 0) {
          console.log('[useTournament] Propagating bye winner to SF2');
          updatedMatches[sf2Index] = {
            ...updatedMatches[sf2Index],
            participant1: byeMatch.winner,
          };
          console.log('[useTournament] SF2 after bye propagation:', {
            p1: updatedMatches[sf2Index].participant1?.anime?.title,
            p2: updatedMatches[sf2Index].participant2?.anime?.title
          });
          return { ...prev, matches: updatedMatches, roundStarted: true };
        }
        return { ...prev, roundStarted: true };
      });
    } else {
      setTournament(prev => prev ? { ...prev, roundStarted: true } : prev);
    }
    setCurrentMatchIndex(0);
  }, [tournament]);
  
  const selectWinner = useCallback((matchId: string, winnerId: string) => {
    console.log('[useTournament] selectWinner called:', { matchId, winnerId, currentMatchIndex });
    if (!tournament) return;
    
    setTournament(prev => {
      if (!prev) return prev;
      
      const updatedMatches = [...prev.matches];
      const matchIndex = updatedMatches.findIndex(m => m.id === matchId);
      const match = updatedMatches[matchIndex];
      
      console.log('[useTournament] selectWinner match found:', match ? {
        id: match.id,
        round: match.round,
        matchNumber: match.matchNumber,
        p1: match.participant1?.anime?.title,
        p2: match.participant2?.anime?.title,
        hasWinner: !!match.winner
      } : null);
      
      if (!match) return prev;
      
      // Check if this is a bye match (one participant only)
      const isByeMatch = match.participant1 && !match.participant2;
      
      // For bye matches, if winner already set, propagate to next match and return updated state
      if (isByeMatch && match.winner) {
        console.log('[useTournament] Bye match already has winner, propagating to next match');
        const nextMatchId = match.nextMatchId;
        if (nextMatchId) {
          const nextMatchIndex = updatedMatches.findIndex(m => m.id === nextMatchId);
          const nextMatch = updatedMatches[nextMatchIndex];
          if (nextMatch && !nextMatch.winner) {
            const winner = match.winner;
            if (match.round === 2) {
              // SF -> Final routing
              console.log('[useTournament] Processing SF->F routing for winner:', winner?.anime?.title);
              if (match.matchNumber === 1) {
                updatedMatches[nextMatchIndex] = { ...nextMatch, participant1: winner };
                console.log('[useTournament] SF1 winner -> Final participant1');
              } else if (match.matchNumber === 2) {
                updatedMatches[nextMatchIndex] = { ...nextMatch, participant2: winner };
                console.log('[useTournament] SF2 winner -> Final participant2');
              }
            }
            console.log('[useTournament] Updated next match:', {
              id: updatedMatches[nextMatchIndex].id,
              p1: updatedMatches[nextMatchIndex].participant1?.anime?.title || null,
              p2: updatedMatches[nextMatchIndex].participant2?.anime?.title || null
            });
          }
        }
        
        // Check if round is complete
        const roundMatches = updatedMatches.filter(m => m.round === prev.currentRound);
        const allMatchesComplete = roundMatches.every(m => 
          m.winner !== null || (m.participant1 && !m.participant2)
        );
        
        if (allMatchesComplete && prev.currentRound < prev.totalRounds) {
          console.log('[useTournament] Round complete (bye match), moving to next round');
          return {
            ...prev,
            matches: updatedMatches,
            currentRound: prev.currentRound + 1,
            roundStarted: false,
          };
        }
        
        return { ...prev, matches: updatedMatches };
      }
      
      if (match.winner) return prev;
      
      const winner = match.participant1?.id === winnerId ? match.participant1 : 
                     match.participant2?.id === winnerId ? match.participant2 : null;
      
      console.log('[useTournament] winner:', winner?.anime?.title);
      
      if (!winner) return prev;
      
      const updatedParticipants = prev.participants.map(p => {
        if (p.id === winnerId) return { ...p, eliminated: false };
        if ((match.participant1?.id === winnerId && p.id === match.participant2?.id) ||
            (match.participant2?.id === winnerId && p.id === match.participant1?.id)) {
          return { ...p, eliminated: true };
        }
        return p;
      });
      
      updatedMatches[matchIndex] = { ...match, winner };
      
      // Populate next match with winner
      const nextMatchId = match.nextMatchId;
      console.log('[useTournament] nextMatchId:', nextMatchId);
      
      // Skip routing if nextMatchId doesn't exist
      if (!nextMatchId) {
        console.log('[useTournament] No nextMatchId, skipping routing');
      } else {
        const nextMatchIndex = updatedMatches.findIndex(m => m.id === nextMatchId);
        const nextMatch = updatedMatches[nextMatchIndex];
        
        console.log('[useTournament] nextMatch before update:', nextMatch ? {
          id: nextMatch.id,
          round: nextMatch.round,
          p1: nextMatch.participant1?.anime?.title || null,
          p2: nextMatch.participant2?.anime?.title || null,
          hasWinner: !!nextMatch.winner
        } : null);
        
        if (nextMatch && !nextMatch.winner) {
          const matchNumberInRound = match.matchNumber;
          
          // Determine which slot to fill in next match
          // Routing depends on the current round:
          // - Round 1 (QF): 
          //   For 5 participants: QF1->SF1(p1), QF2->SF2(p2), bye->SF2(p1)
          //   For 6-8 participants: QF1->SF1(p1), QF2->SF1(p2), QF3->SF2(p2), QF4->SF2(p1)
          // - Round 2 (SF): SF1->F(p1), SF2->F(p2)
          if (match.round === 1) {
            // QF routing
            // Check if this is the bye participant case (odd number of participants)
            const isByeParticipant = match.participant1 && !match.participant2;
            
            if (isByeParticipant) {
              // Bye match - participant already pre-populated to SF2 at initialization
              // Don't route here, routing is handled at initialization
              console.log('[useTournament] Bye match, skipping QF routing');
            } else if (nextMatch.matchNumber === 1) {
              // Standard routing: winners go to SF1
              if (matchNumberInRound === 1) {
                updatedMatches[nextMatchIndex] = { ...nextMatch, participant1: winner };
                console.log('[useTournament] QF1 winner -> SF1 participant1');
              } else if (matchNumberInRound === 2) {
                // For 5 participants (2 QF matches), QF2 winner goes to SF2 participant2
                // For 6-8 participants (3-4 QF matches), QF2 winner goes to SF1 participant2
                const totalParticipants = prev.participants.length;
                if (totalParticipants === 5) {
                  // With 5 participants, QF2 winner should go to SF2 participant2
                  const sf2MatchId = generateMatchId(2, 2);
                  const sf2Index = updatedMatches.findIndex(m => m.id === sf2MatchId);
                  if (sf2Index >= 0) {
                    updatedMatches[sf2Index] = { ...updatedMatches[sf2Index], participant2: winner };
                    console.log('[useTournament] QF2 winner -> SF2 participant2 (5 participants)');
                  }
                } else {
                  updatedMatches[nextMatchIndex] = { ...nextMatch, participant2: winner };
                  console.log('[useTournament] QF2 winner -> SF1 participant2');
                }
              }
            } else if (nextMatch.matchNumber === 2) {
              // QF3/QF4 -> SF2 routing
              // For 8 participants (4 QF): QF3->SF2(p2), QF4->SF2(p1)
              // For 6 participants (3 QF): QF3->SF2(p1), bye->SF2(p2) handled separately
              if (matchNumberInRound === 3) {
                // QF3 winner -> SF2 participant2
                updatedMatches[nextMatchIndex] = { ...nextMatch, participant2: winner };
                console.log('[useTournament] QF3 winner -> SF2 participant2');
              } else if (matchNumberInRound === 4) {
                // QF4 winner -> SF2 participant1 (reversed for proper bracket structure)
                updatedMatches[nextMatchIndex] = { ...nextMatch, participant1: winner };
                console.log('[useTournament] QF4 winner -> SF2 participant1');
              }
            }
          } else if (match.round === 2) {
            // SF routing to Final
            console.log('[useTournament] SF->Final routing for winner:', winner?.anime?.title);
            if (matchNumberInRound === 1) {
              updatedMatches[nextMatchIndex] = { ...nextMatch, participant1: winner };
              console.log('[useTournament] SF1 winner -> Final participant1');
            } else if (matchNumberInRound === 2) {
              updatedMatches[nextMatchIndex] = { ...nextMatch, participant2: winner };
              console.log('[useTournament] SF2 winner -> Final participant2');
            }
          }
          
          console.log('[useTournament] nextMatch after update:', {
            id: updatedMatches[nextMatchIndex].id,
            p1: updatedMatches[nextMatchIndex].participant1?.anime?.title || null,
            p2: updatedMatches[nextMatchIndex].participant2?.anime?.title || null
          });
        }
      }
      
      // Check if round is complete
      const roundMatches = updatedMatches.filter(m => m.round === prev.currentRound);
      console.log('[useTournament] round check:', {
        currentRound: prev.currentRound,
        roundMatchesCount: roundMatches.length,
        roundMatches: roundMatches.map(m => ({ 
          id: m.id, 
          hasWinner: !!m.winner, 
          p1: !!m.participant1, 
          p2: !!m.participant2,
          p1Title: m.participant1?.anime?.title,
          p2Title: m.participant2?.anime?.title
        }))
      });
      
      // A match is pending if it needs to be played (both participants exist and no winner yet)
      // Or if it's a bye match (one participant, no winner) - but since bye matches have winner pre-set,
      // they don't count as pending
      const pendingMatches = roundMatches.filter(m => 
        m.winner === null && m.participant1 && m.participant2
      );
      
      // Check if round is complete - all matches either have winners or are bye matches
      const allMatchesComplete = roundMatches.every(m => 
        m.winner !== null || (m.participant1 && !m.participant2) // has winner OR is bye (one participant)
      );
      
      // Find any matches with only one participant (bye) and set the winner automatically
      // This should happen when the round is complete but the bye hasn't been processed
      if (allMatchesComplete) {
        roundMatches.forEach(m => {
          if (m.participant1 && !m.participant2 && !m.winner) {
            console.log('[useTournament] Auto-setting winner for bye match:', m.id, m.participant1.anime.title);
            const matchIndex = updatedMatches.findIndex(cm => cm.id === m.id);
            if (matchIndex >= 0) {
              updatedMatches[matchIndex] = { ...m, winner: m.participant1 };
              
              // Propagate bye winner to next round
              const nextMatchId = m.nextMatchId;
              if (nextMatchId) {
                const nextMatchIndex = updatedMatches.findIndex(cm => cm.id === nextMatchId);
                const nextMatch = updatedMatches[nextMatchIndex];
                if (nextMatch && !nextMatch.winner) {
                  // Determine which slot to fill based on match number in this round
                  if (m.round === 2) {
                    // SF -> Final routing
                    console.log('[useTournament] Auto-propagating SF2 bye winner to Final');
                    if (m.matchNumber === 1) {
                      updatedMatches[nextMatchIndex] = { ...nextMatch, participant1: m.participant1 };
                    } else if (m.matchNumber === 2) {
                      updatedMatches[nextMatchIndex] = { ...nextMatch, participant2: m.participant1 };
                    }
                  }
                }
              }
            }
          }
        });
      }
      
      console.log('[useTournament] pendingMatches count:', pendingMatches.length, 'allMatchesComplete:', allMatchesComplete);
      
      let nextRound = prev.currentRound;
      let isComplete = false;
      let champion = prev.champion;
      let byeParticipants = prev.byeParticipants;
      let roundComplete = false;
      
      // Round is complete when all contested matches are decided AND all bye matches are resolved
      if (allMatchesComplete) {
        console.log('[useTournament] Round complete, checking bye participants:', {
          byeParticipantsCount: prev.byeParticipants.length,
          currentRound: prev.currentRound,
          totalRounds: prev.totalRounds
        });
        roundComplete = true;
        
        // Handle bye participants - they should auto-advance when round completes
        // Only do this if there are still bye participants to process
        // Also skip if the target slot is already filled (pre-populated at initialization)
        if (prev.byeParticipants.length > 0 && prev.currentRound < prev.totalRounds) {
          const bye = prev.byeParticipants[0];
          console.log('[useTournament] Processing bye participant:', bye.anime.title);
          
          // Find the match in next round where bye should be placed
          // For QF (round 1) -> SF (round 2), bye goes to SF2
          const nextRoundMatchId = prev.currentRound === 1 ? generateMatchId(2, 2) : null;
          console.log('[useTournament] bye target matchId:', nextRoundMatchId);
          
          if (nextRoundMatchId) {
            const nextMatchIndex = updatedMatches.findIndex(m => m.id === nextRoundMatchId);
            if (nextMatchIndex >= 0) {
              // Check if participant1 is already filled (pre-populated at initialization)
              if (updatedMatches[nextMatchIndex].participant1) {
                console.log('[useTournament] participant1 already filled, skipping bye addition for:', bye.anime.title);
              } else {
                updatedMatches[nextMatchIndex] = {
                  ...updatedMatches[nextMatchIndex],
                  participant1: { ...bye, advancedFromRound: prev.currentRound },
                };
                console.log('[useTournament] Added bye to match, updated match:', {
                  id: updatedMatches[nextMatchIndex].id,
                  p1: updatedMatches[nextMatchIndex].participant1?.anime?.title,
                  p2: updatedMatches[nextMatchIndex].participant2?.anime?.title
                });
              }
            }
          }
          byeParticipants = byeParticipants.slice(1);
        }
        
        if (prev.currentRound >= prev.totalRounds) {
          console.log('[useTournament] Tournament complete!');
          isComplete = true;
          champion = winner;
        } else {
          console.log('[useTournament] Moving to next round:', nextRound + 1);
          nextRound = prev.currentRound + 1;
        }
      }
      
      const nextRoundMatches = updatedMatches.filter(m => m.round === nextRound);
        const nextRoundPending = nextRoundMatches.filter(m => 
          m.winner === null && m.participant1 && m.participant2
        );
        
        // When transitioning to a new round, roundStarted should be false 
        // (waiting for user to click "Start Round")
        const isTransitioningToNextRound = pendingMatches.length === 0 && nextRound > prev.currentRound;
        
        console.log('[useTournament] Returning new state:', {
          currentRound: nextRound,
          isComplete,
          roundComplete,
          byeParticipantsCount: byeParticipants.length,
          roundStarted: isTransitioningToNextRound ? false : (nextRoundPending.length > 0),
          isTransitioningToNextRound,
          nextRoundPendingCount: nextRoundPending.length
        });
        
        return {
          ...prev,
          participants: updatedParticipants,
          matches: updatedMatches,
          currentRound: nextRound,
          isComplete,
          champion,
          roundStarted: isTransitioningToNextRound ? false : (nextRoundPending.length > 0),
          byeParticipants,
          roundComplete,
      };
    });
    
    // Move to next match
    setCurrentMatchIndex(prev => {
      if (!tournament) return prev;
      const roundMatches = tournament.matches.filter(m => m.round === tournament.currentRound);
      const pendingCount = roundMatches.filter(m => m.participant1 && m.participant2 && !m.winner).length;
      const nextIdx = prev + 1;
      return nextIdx < pendingCount ? nextIdx : prev;
    });
  }, [tournament, currentMatchIndex]);
  
  const getNextAvailableMatch = useCallback(() => {
    if (!tournament || !tournament.roundStarted) return null;
    
    const roundMatches = tournament.matches
      .filter(m => m.round === tournament.currentRound)
      .filter(m => m.participant1 && m.participant2 && !m.winner);
    
    if (currentMatchIndex < roundMatches.length) {
      return { match: roundMatches[currentMatchIndex], index: currentMatchIndex };
    }
    return null;
  }, [tournament, currentMatchIndex]);
  
  const getResults = useCallback(() => {
    if (!tournament) return [];
    
    const sorted = [...tournament.participants].sort((a, b) => {
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
    setCurrentMatchIndex(0);
  }, []);
  
  return {
    tournament,
    currentMatchIndex,
    initializeTournament,
    startRound,
    selectWinner,
    getNextAvailableMatch,
    getResults,
    resetTournament,
  };
}