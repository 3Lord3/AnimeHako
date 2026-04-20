import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAnimeList, useGenres } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AnimeGrid } from '@/components/AnimeGrid';
import { Search, Filter, Star, Calendar } from 'lucide-react';

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const genres = searchParams.get('genres') || '';
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
  const sort = searchParams.get('sort') || '';

  const [searchInput, setSearchInput] = useState(search);

  // Load all anime (limit=100) for virtual scrolling
  const { data: animeData, isLoading } = useAnimeList({
    page: 1,
    limit: 100,
    search: search || undefined,
    genres: genres || undefined,
    year,
    sort: sort || undefined,
  });
  const { data: genresData } = useGenres();

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams('search', searchInput);
  };

  const toggleGenre = (genre: string) => {
    const currentGenres = genres ? genres.split(',') : [];
    const newGenres = currentGenres.includes(genre)
      ? currentGenres.filter((g) => g !== genre)
      : [...currentGenres, genre];
    updateParams('genres', newGenres.join(','));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск аниме..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="secondary">
            Найти
          </Button>
        </form>

        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {genresData?.map((genre) => (
            <Badge
              key={genre.id}
              variant={genres.split(',').includes(genre.name) ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => toggleGenre(genre.name)}
            >
              {genre.name}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={sort === 'rating' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateParams('sort', sort === 'rating' ? '' : 'rating')}
          >
            <Star className="w-4 h-4 mr-1" />
            По рейтингу
          </Button>
          <Button
            variant={sort === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateParams('sort', sort === 'year' ? '' : 'year')}
          >
            <Calendar className="w-4 h-4 mr-1" />
            По году
          </Button>
          {year && (
            <Button variant="ghost" size="sm" onClick={() => updateParams('year', '')}>
              Год: {year} ✕
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Загрузка...</div>
      ) : animeData?.data.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Аниме не найдены
        </div>
      ) : (
        <AnimeGrid anime={animeData?.data || []} />
      )}
    </div>
  );
}