import axios from 'axios';
import type {
  Token,
  User,
  AnimeListResponse,
  AnimeDetail,
  UserAnimeCreate,
  UserAnimeUpdate,
  UserAnimeResponse,
  ReviewResponse,
  GenreResponse,
  TagResponse,
  ScreenshotsResponse,
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (email: string, username: string, password: string) =>
    api.post<Token>('/api/v1/auth/register', { email, username, password }),
  
  login: (email: string, password: string) =>
    api.post<Token>('/api/v1/auth/login', { email, password }),
};

export const animeApi = {
  getList: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    genres?: string;
    year?: number;
    rating?: number;
    tags?: string;
    sort?: string;
  }) =>
    api.get<AnimeListResponse>('/api/v1/anime', { params }),
  
  getDetail: (id: number) =>
    api.get<AnimeDetail>(`/api/v1/anime/${id}`),
  
  getScreenshots: (id: number) =>
    api.get<ScreenshotsResponse>(`/api/v1/anime/${id}/screenshots`),
  
  getReviews: (id: number, limit?: number, offset?: number) =>
    api.get<ReviewResponse[]>(`/api/v1/anime/${id}/reviews`, {
      params: { limit, offset },
    }),
};

export const genresApi = {
  getAll: () => api.get<GenreResponse[]>('/api/v1/genres'),
};

export const tagsApi = {
  getAll: () => api.get<TagResponse[]>('/api/v1/tags'),
};

export const userApi = {
  getProfile: () => api.get<User>('/api/v1/user/me'),
  
  updateProfile: (data: { username?: string; avatar?: string }) =>
    api.patch<User>('/api/v1/user/me', data),
  
  getAnimeList: (status?: string) =>
    api.get<UserAnimeResponse[]>('/api/v1/user/anime', { params: { status } }),
  
  addToList: (data: UserAnimeCreate) =>
    api.post<UserAnimeResponse>('/api/v1/user/anime', data),
  
  updateListEntry: (animeId: number, data: UserAnimeUpdate) =>
    api.patch(`/api/v1/user/anime/${animeId}`, data),
  
  removeFromList: (animeId: number) =>
    api.delete(`/api/v1/user/anime/${animeId}`),
  
  addToFavorites: (animeId: number) =>
    api.post(`/api/v1/user/favorites/${animeId}`),
  
  removeFromFavorites: (animeId: number) =>
    api.delete(`/api/v1/user/favorites/${animeId}`),
};

export const reviewsApi = {
  getById: (id: number) => api.get<ReviewResponse>(`/api/v1/reviews/${id}`),
};