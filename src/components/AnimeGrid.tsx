import { AnimeCard } from './AnimeCard';
import type { AnimeListItem } from '@/types';

interface AnimeGridProps {
  anime: AnimeListItem[];
}

export function AnimeGrid({ anime }: AnimeGridProps) {
  if (!anime.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {anime.map((item) => (
        <AnimeCard key={item.id} anime={item} />
      ))}
    </div>
  );
}
