import { AnimeCard } from './AnimeCard';
import type { AnimeListItem, UserAnimeResponse } from '@/types';

interface AnimeGridProps {
  anime: AnimeListItem[];
  userAnimeList?: UserAnimeResponse[];
  isLoading?: boolean;
}

export function AnimeGrid({ anime, userAnimeList, isLoading }: AnimeGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!anime.length) {
    return null;
  }

  const userAnimeMap = userAnimeList ? new Map(userAnimeList.map(ua => [ua.anime_id, ua])) : new Map();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {anime.map((item) => {
        const userAnime = userAnimeMap.get(item.id);
        return (
          <AnimeCard 
            key={item.id} 
            anime={item} 
            userStatus={userAnime?.status}
            isFavorite={userAnime?.is_favorite}
          />
        );
      })}
    </div>
  );
}
