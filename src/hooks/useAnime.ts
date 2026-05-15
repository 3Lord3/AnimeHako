import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { animeApi, genresApi, tagsApi, userApi } from '@/lib/api';
import { useUser } from './useAuth';
import type {
  UserAnimeCreate,
  UserAnimeUpdate,
} from '@/types';

export function useAnimeList(params?: {
  page?: number;
  limit?: number;
  search?: string;
  genres?: string;
  year?: number;
  min_rating?: number;
  tags?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: ['anime', 'list', params],
    queryFn: async () => {
      const { data } = await animeApi.getList(params);
      return data;
    },
  });
}

export function useAnimeDetail(id: number) {
  return useQuery({
    queryKey: ['anime', 'detail', id],
    queryFn: async () => {
      const { data } = await animeApi.getDetail(id);
      return data;
    },
    enabled: !!id,
  });
}

export function useRandomAnime() {
  return useQuery({
    queryKey: ['anime', 'random'],
    queryFn: async () => {
      const { data } = await animeApi.getRandom();
      return data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useAnimeScreenshots(id: number) {
  return useQuery({
    queryKey: ['anime', 'screenshots', id],
    queryFn: async () => {
      const { data } = await animeApi.getScreenshots(id);
      return data.screenshots;
    },
    enabled: !!id,
  });
}

export function useAnimeReviews(id: number, limit?: number, offset?: number) {
  return useQuery({
    queryKey: ['anime', 'reviews', id, limit, offset],
    queryFn: async () => {
      const { data } = await animeApi.getReviews(id, limit, offset);
      return data;
    },
    enabled: !!id,
  });
}

export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const { data } = await genresApi.getAll();
      return data;
    },
  });
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data } = await tagsApi.getAll();
      return data;
    },
  });
}

export function useUserAnimeList(status?: string, favorites?: boolean) {
  const { data: user } = useUser();
  
  return useQuery({
    queryKey: ['user', 'anime', status, favorites],
    queryFn: async () => {
      try {
        const { data } = await userApi.getAnimeList(status, favorites || undefined);
        return data;
      } catch (error: unknown) {
        // Return empty array on auth errors to prevent redirect on public pages
        if (error && typeof error === 'object' && 'response' in error) {
          const err = error as { response?: { status?: number } };
          if (err.response?.status === 401) {
            return [];
          }
        }
        throw error;
      }
    },
    enabled: !!user,
  });
}

export function useAddToList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserAnimeCreate) => userApi.addToList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'anime'] });
    },
  });
}

export function useUpdateListEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ animeId, data }: { animeId: number; data: UserAnimeUpdate }) =>
      userApi.updateListEntry(animeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'anime'] });
    },
  });
}

export function useRemoveFromList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (animeId: number) => userApi.removeFromList(animeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'anime'] });
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ animeId, isFavorite }: { animeId: number; isFavorite: boolean }) =>
      isFavorite
        ? userApi.removeFromFavorites(animeId)
        : userApi.addToFavorites(animeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'anime'] });
    },
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: ['user', 'anime', 'favorites'],
    queryFn: async () => {
      const { data } = await userApi.getAnimeList();
      return data.filter((item) => item.is_favorite);
    },
  });
}