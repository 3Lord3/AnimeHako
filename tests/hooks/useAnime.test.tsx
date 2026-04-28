import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAnimeList, useAnimeDetail, useRandomAnime, useGenres, useTags } from '@/hooks/useAnime';
import * as apiModule from '@/lib/api';

// Mock the API module
vi.mock('@/lib/api', () => ({
  animeApi: {
    getList: vi.fn(),
    getDetail: vi.fn(),
    getRandom: vi.fn(),
    getScreenshots: vi.fn(),
    getReviews: vi.fn(),
  },
  genresApi: {
    getAll: vi.fn(),
  },
  tagsApi: {
    getAll: vi.fn(),
  },
  userApi: {
    getAnimeList: vi.fn(),
    updateAnime: vi.fn(),
    deleteAnime: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAnime hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAnimeList', () => {
    it('fetches anime list successfully', async () => {
      const mockResponse: import('@/types').AnimeListResponse = {
        data: [
          { id: 1, title: 'Anime 1', title_en: 'Anime 1 EN', poster: '/posters/1.jpg', rating: 8.5, year: 2024, episodes: 12, genres: ['Action'] },
          { id: 2, title: 'Anime 2', title_en: 'Anime 2 EN', poster: '/posters/2.jpg', rating: 7.0, year: 2023, episodes: 24, genres: ['Comedy'] },
        ],
        page: 1,
        total_pages: 10,
        total: 100,
      };

      vi.mocked(apiModule.animeApi.getList).mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const { result } = renderHook(() => useAnimeList({ page: 1 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse);
      expect(apiModule.animeApi.getList).toHaveBeenCalledWith({ page: 1 });
    });

    it('handles error state', async () => {
      vi.mocked(apiModule.animeApi.getList).mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useAnimeList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });

    it('fetches with search params', async () => {
      const mockData: import('@/types').AnimeListResponse = { data: [], page: 1, total_pages: 0, total: 0 };
      vi.mocked(apiModule.animeApi.getList).mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const { result } = renderHook(() => useAnimeList({ search: 'test', genres: 'action', year: 2024 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiModule.animeApi.getList).toHaveBeenCalledWith({
        search: 'test',
        genres: 'action',
        year: 2024,
      });
    });
  });

  describe('useAnimeDetail', () => {
    it('fetches anime detail successfully', async () => {
      const mockData: import('@/types').AnimeDetail = {
        id: 1,
        title: 'Detailed Anime',
        title_en: 'Detailed Anime EN',
        title_jp: '詳細なアニメ',
        poster: '/posters/1.jpg',
        cover: '/covers/1.jpg',
        description: 'Full description',
        rating: 9.0,
        year: 2024,
        season: 'Spring',
        status: 'Completed',
        episodes: 12,
        duration: 24,
        studio: 'Studio X',
        genres: ['Action'],
        tags: ['Mecha'],
      };

      vi.mocked(apiModule.animeApi.getDetail).mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const { result } = renderHook(() => useAnimeDetail(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
      expect(apiModule.animeApi.getDetail).toHaveBeenCalledWith(1);
    });

    it('does not fetch when id is falsy', () => {
      renderHook(() => useAnimeDetail(0), {
        wrapper: createWrapper(),
      });

      expect(apiModule.animeApi.getDetail).not.toHaveBeenCalled();
    });
  });

  describe('useRandomAnime', () => {
    it('fetches random anime successfully', async () => {
      const mockData: import('@/types').AnimeDetail = {
        id: 42,
        title: 'Random Anime',
        title_en: null,
        title_jp: null,
        poster: '/posters/42.jpg',
        cover: null,
        description: null,
        rating: 8.0,
        year: 2024,
        season: null,
        status: null,
        episodes: 1,
        duration: null,
        studio: null,
        genres: [],
        tags: [],
      };
      vi.mocked(apiModule.animeApi.getRandom).mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const { result } = renderHook(() => useRandomAnime(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useGenres', () => {
    it('fetches genres successfully', async () => {
      const mockData: import('@/types').GenreResponse[] = [
        { id: 1, name: 'Action', slug: 'action' },
        { id: 2, name: 'Comedy', slug: 'comedy' },
      ];
      vi.mocked(apiModule.genresApi.getAll).mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const { result } = renderHook(() => useGenres(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useTags', () => {
    it('fetches tags successfully', async () => {
      const mockData: import('@/types').TagResponse[] = [
        { id: 1, name: 'Mecha', slug: 'mecha' },
        { id: 2, name: 'School', slug: 'school' },
      ];
      vi.mocked(apiModule.tagsApi.getAll).mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
    });
  });
});