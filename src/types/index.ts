export interface User {
  id: number;
  email: string;
  username: string;
  avatar: string | null;
  created_at?: string;
}

export interface Token {
  token: string;
  user: User;
}

export interface AnimeListItem {
  id: number;
  title: string;
  title_en: string | null;
  poster: string | null;
  rating: number | null;
  year: number | null;
  episodes: number | null;
  genres: string[];
}

export interface AnimeListResponse {
  data: AnimeListItem[];
  page: number;
  total_pages: number;
  total: number;
}

export interface AnimeDetail {
  id: number;
  title: string;
  title_en: string | null;
  title_jp: string | null;
  poster: string | null;
  cover: string | null;
  description: string | null;
  rating: number | null;
  year: number | null;
  season: string | null;
  status: string | null;
  episodes: number | null;
  duration: number | null;
  studio: string | null;
  genres: string[];
  tags: string[];
}

export interface UserAnimeCreate {
  anime_id: number;
  status: 'watching' | 'completed' | 'dropped' | 'planned';
  score?: number;
  episodes_watched?: number;
}

export interface UserAnimeUpdate {
  status?: 'watching' | 'completed' | 'dropped' | 'planned' | null;
  score?: number;
  episodes_watched?: number;
}

export interface UserAnimeResponse {
  anime_id: number;
  status: string | null;
  score: number | null;
  episodes_watched: number;
  is_favorite: boolean;
  anime: AnimeListItem;
}

export interface ReviewResponse {
  id: number;
  anime_id: number;
  author_name: string;
  title: string;
  content: string;
  score: number | null;
  created_at: string;
}

export interface GenreResponse {
  id: number;
  name: string;
  slug: string;
}

export interface TagResponse {
  id: number;
  name: string;
  slug: string;
}

export interface ScreenshotsResponse {
  screenshots: string[];
}
