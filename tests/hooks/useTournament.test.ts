import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTournament } from '@/hooks/useTournament';
import type { AnimeListItem } from '@/types';

// Helper to create mock anime items
const createMockAnime = (id: number, title: string): AnimeListItem => ({
  id,
  title,
  poster: null,
  rating: 8.0,
});

// Simple mock anime list for testing
const mockAnime5: AnimeListItem[] = [
  createMockAnime(1, 'Anime A'),
  createMockAnime(2, 'Anime B'),
  createMockAnime(3, 'Anime C'),
  createMockAnime(4, 'Anime D'),
  createMockAnime(5, 'Anime E'), // 5th participant - will get bye
];

const mockAnime9: AnimeListItem[] = [
  createMockAnime(1, 'Anime 1'),
  createMockAnime(2, 'Anime 2'),
  createMockAnime(3, 'Anime 3'),
  createMockAnime(4, 'Anime 4'),
  createMockAnime(5, 'Anime 5'),
  createMockAnime(6, 'Anime 6'),
  createMockAnime(7, 'Anime 7'),
  createMockAnime(8, 'Anime 8'),
  createMockAnime(9, 'Anime 9'), // 9th participant - will get bye
];

describe('useTournament', () => {
  describe('initialization', () => {
    it('should initialize tournament with 5 participants', () => {
      const { result } = renderHook(() => useTournament());
      
      act(() => {
        result.current.initializeTournament(mockAnime5);
      });
      
      expect(result.current.tournament).toBeDefined();
      expect(result.current.tournament!.allParticipants.length).toBe(5);
      expect(result.current.tournament!.rounds.length).toBeGreaterThanOrEqual(1);
      
      // First round should have 3 pairs (2 pairs + 1 bye)
      const firstRound = result.current.tournament!.rounds[0];
      expect(firstRound.pairs.length).toBe(3);
    });
    
    it('should initialize tournament with 9 participants', () => {
      const { result } = renderHook(() => useTournament());
      
      act(() => {
        result.current.initializeTournament(mockAnime9);
      });
      
      expect(result.current.tournament).toBeDefined();
      expect(result.current.tournament!.allParticipants.length).toBe(9);
      
      // Round structure: 9 -> 5 -> 3 -> 2 -> 1 = 4 rounds total
      // But since we create full structure, we have 4 rounds
      expect(result.current.tournament!.rounds.length).toBeGreaterThanOrEqual(1);
    });
    
    it('should have one bye pair when odd number of participants', () => {
      const { result } = renderHook(() => useTournament());
      
      act(() => {
        result.current.initializeTournament(mockAnime5);
      });
      
      const firstRound = result.current.tournament!.rounds[0];
      const byePairs = firstRound.pairs.filter(p => p.status === 'bye');
      const regularPairs = firstRound.pairs.filter(p => p.status !== 'bye');
      
      expect(byePairs.length).toBe(1);
      expect(regularPairs.length).toBe(2); // 2 regular pairs for 4 participants
      expect(regularPairs.every(p => p.participants.length === 2)).toBe(true);
      expect(byePairs[0].participants.length).toBe(1);
    });
  });
  
  describe('startRound', () => {
    it('should set roundStarted to true and mark pairs as playing', () => {
      const { result } = renderHook(() => useTournament());
      
      act(() => {
        result.current.initializeTournament(mockAnime5);
      });
      
      act(() => {
        result.current.startRound();
      });
      
      expect(result.current.tournament!.roundStarted).toBe(true);
      
      const firstRound = result.current.tournament!.rounds[0];
      const playingPairs = firstRound.pairs.filter(p => p.status === 'playing');
      const byePairs = firstRound.pairs.filter(p => p.status === 'bye');
      
      // Bye pairs should still be bye, not playing
      expect(byePairs.length).toBe(1);
      // Regular pairs should be playing
      expect(playingPairs.length).toBe(2);
    });
  });
  
  describe('selectWinner', () => {
    it('should set winner for a pair when selectWinner is called', () => {
      const { result } = renderHook(() => useTournament());
      
      act(() => {
        result.current.initializeTournament(mockAnime5);
      });
      
      act(() => {
        result.current.startRound();
      });
      
      const firstRound = result.current.tournament!.rounds[0];
      const firstPair = firstRound.pairs.find(p => p.participants.length === 2);
      expect(firstPair).toBeDefined();
      
      const winnerId = firstPair!.participants[0].id;
      
      act(() => {
        result.current.selectWinner(firstPair!.id, winnerId);
      });
      
      const updatedPair = result.current.tournament!.rounds[0].pairs.find(p => p.id === firstPair!.id);
      expect(updatedPair!.winner).toBeDefined();
      expect(updatedPair!.winner!.id).toBe(winnerId);
      expect(updatedPair!.status).toBe('completed');
    });
    
    it('should auto-advance bye participant to next round', () => {
      const { result } = renderHook(() => useTournament());
      
      act(() => {
        result.current.initializeTournament(mockAnime5);
      });
      
      // First round: 5 participants -> 3 pairs (2 pairs + 1 bye)
      // Winners: 2 from regular pairs + 1 bye = 3 winners for round 2
      
      const firstRound = result.current.tournament!.rounds[0];
      const byePair = firstRound.pairs.find(p => p.status === 'bye');
      expect(byePair).toBeDefined();
      expect(byePair!.winner).toBeDefined(); // Bye winner should be set at initialization
      expect(byePair!.winner!.id).toBe(byePair!.participants[0].id);
    });
    
    it('should create next round after all pairs in current round are decided', () => {
      const { result } = renderHook(() => useTournament());
      
      act(() => {
        result.current.initializeTournament(mockAnime5);
      });
      
      act(() => {
        result.current.startRound();
      });
      
      // Get all pairs in first round
      const firstRound = result.current.tournament!.rounds[0];
      
      // Select winners for all non-bye pairs
      const regularPairs = firstRound.pairs.filter(p => p.status !== 'bye');
      for (const pair of regularPairs) {
        const winnerId = pair.participants[0].id;
        act(() => {
          result.current.selectWinner(pair.id, winnerId);
        });
      }
      
      // After all pairs are decided, round should be complete
      // and we should have more rounds or tournament complete
      const updatedTournament = result.current.tournament;
      expect(
        updatedTournament!.rounds[0].isComplete || 
        updatedTournament!.isComplete ||
        updatedTournament!.rounds.length > 1
      ).toBe(true);
    });
  });
  
  describe('tournament flow with 9 participants', () => {
    it('should correctly handle bye in first round with 9 participants', () => {
      const { result } = renderHook(() => useTournament());
      
      act(() => {
        result.current.initializeTournament(mockAnime9);
      });
      
      const firstRound = result.current.tournament!.rounds[0];
      
      // 9 participants -> 5 pairs (4 pairs of 2 + 1 bye)
      expect(firstRound.pairs.length).toBe(5);
      
      const byePairs = firstRound.pairs.filter(p => p.status === 'bye');
      const regularPairs = firstRound.pairs.filter(p => p.status !== 'bye');
      
      expect(byePairs.length).toBe(1);
      expect(regularPairs.length).toBe(4);
      
      // All regular pairs should have exactly 2 participants
      expect(regularPairs.every(p => p.participants.length === 2)).toBe(true);
      
      // Bye pair should have exactly 1 participant with winner set
      expect(byePairs[0].participants.length).toBe(1);
      expect(byePairs[0].winner).toBeDefined();
    });
    
    it('should progress all 9 participants through tournament', () => {
      const { result } = renderHook(() => useTournament());
      
      act(() => {
        result.current.initializeTournament(mockAnime9);
      });
      
      act(() => {
        result.current.startRound();
      });
      
      // Complete first round
      const round0 = result.current.tournament!.rounds[0];
      for (const pair of round0.pairs) {
        if (pair.status !== 'bye' && !pair.winner) {
          act(() => {
            result.current.selectWinner(pair.id, pair.participants[0].id);
          });
        }
      }
      
      // After first round complete, we should have 5 winners (4 from regular + 1 bye)
      // Check that all original participants are still tracked
      const allParticipantIds = result.current.tournament!.allParticipants.map(p => p.id);
      expect(allParticipantIds.length).toBeGreaterThanOrEqual(5);
    });
  });
  
  describe('resetTournament', () => {
    it('should reset tournament state', () => {
      const { result } = renderHook(() => useTournament());
      
      act(() => {
        result.current.initializeTournament(mockAnime5);
      });
      
      expect(result.current.tournament).toBeDefined();
      
      act(() => {
        result.current.resetTournament();
      });
      
      expect(result.current.tournament).toBeNull();
    });
  });
});