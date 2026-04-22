import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAnimeList, useGenres, useTags, useDebounce } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AnimeGrid } from '@/components/AnimeGrid';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Filter, Star, Calendar, X } from 'lucide-react';

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const genres = searchParams.get('genres') || '';
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
  const sort = searchParams.get('sort') || '';
  const rating = searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined;
  const tags = searchParams.get('tags') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [tagSearchInput, setTagSearchInput] = useState('');
  const [genreSearchInput, setGenreSearchInput] = useState('');
  const yearParam = year ? String(year) : '';


  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update URL when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== search) {
      const params = new URLSearchParams(searchParams);
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      } else {
        params.delete('search');
      }
      setSearchParams(params);
    }
  }, [debouncedSearch, search, searchParams, setSearchParams]);

  // Load all anime (limit=100) for virtual scrolling
  const { data: animeData, isLoading } = useAnimeList({
    page: 1,
    limit: 100,
    search: search || undefined,
    genres: genres || undefined,
    year,
    sort: sort || undefined,
    rating,
    tags,
  });
  const { data: genresData } = useGenres();
  const { data: tagsData } = useTags();

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const toggleGenre = (genre: string) => {
    const currentGenres = genres ? genres.split(',') : [];
    const newGenres = currentGenres.includes(genre)
      ? currentGenres.filter((g) => g !== genre)
      : [...currentGenres, genre];
    updateParams('genres', newGenres.join(','));
  };

  const toggleYear = (yearValue: number) => {
    const currentYears = year ? String(year).split(',') : [];
    const yearStr = String(yearValue);
    const newYears = currentYears.includes(yearStr)
      ? currentYears.filter((y) => y !== yearStr)
      : [...currentYears, yearStr];
    updateParams('year', newYears.join(','));
  };

  const toggleTag = (tag: string) => {
    const currentTags = tags ? tags.split(',') : [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    updateParams('tags', newTags.join(','));
  };

  // Filter tags by search
  const filteredTags = useMemo(() => {
    if (!tagsData) return [];
    if (!tagSearchInput) return tagsData;
    const searchLower = tagSearchInput.toLowerCase();
    return tagsData.filter((tag) => tag.name.toLowerCase().includes(searchLower));
  }, [tagsData, tagSearchInput]);

  // Get years range (2010-2025)
  const allYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010];

  // Rating filter options
  const ratingOptions = [9, 8, 7, 6];

  // Clear all filters
  const clearFilters = () => {
    updateParams('genres', '');
    updateParams('year', '');
    updateParams('rating', '');
    updateParams('tags', '');
    updateParams('sort', '');
  };

  const hasActiveFilters = genres || year || rating || tags || sort;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Search row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск аниме..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
            <Button
              variant="outline"
              className="relative cursor-pointer"
              onClick={() => setFiltersOpen(true)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Фильтры
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </Button>
            <DialogContent 
              className="w-[95vw] max-w-3xl max-h-[85vh] overflow-y-auto"
              style={{ maxWidth: '42rem' }}
              showCloseButton={false}
            >
              <div className="flex justify-between items-center">
                <DialogTitle className="text-lg font-semibold">Фильтры</DialogTitle>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer"
                  onClick={() => setFiltersOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Rating filter */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Минимальный рейтинг</h4>
                  <div className="flex flex-wrap gap-2">
                    {ratingOptions.map((r) => (
                      <Badge
                        key={r}
                        variant={rating === r ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => updateParams('rating', rating === r ? '' : String(r))}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        {r}+
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Year filter */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Год выпуска</h4>
                  <div className="flex flex-wrap gap-2">
                    {allYears.map((y) => (
                      <Badge
                        key={y}
                        variant={yearParam.split(',').includes(String(y)) ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => toggleYear(y)}
                      >
                        {y}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Genres filter with search */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Жанры</h4>
                  <Input
                    placeholder="Поиск жанров..."
                    value={genreSearchInput}
                    onChange={(e) => setGenreSearchInput(e.target.value)}
                    className="mb-2"
                  />
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
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
                </div>

                {/* Tags filter with search */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Теги</h4>
                  <Input
                    placeholder="Поиск тегов..."
                    value={tagSearchInput}
                    onChange={(e) => setTagSearchInput(e.target.value)}
                    className="mb-2"
                  />
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {filteredTags.slice(0, 50).map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={tags.split(',').includes(tag.name) ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag.name)}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Clear and apply buttons */}
                <div className="flex gap-2 pt-4 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={clearFilters}
                  >
                    Очистить
                  </Button>
                  <Button
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => setFiltersOpen(false)}
                  >
                    Применить
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick filters row */}
        <div className="flex gap-2 flex-wrap items-center">
          <Button
            variant={sort === 'rating' ? 'default' : 'outline'}
            size="sm"
            className="cursor-pointer"
            onClick={() => updateParams('sort', sort === 'rating' ? '' : 'rating')}
          >
            <Star className="w-4 h-4 mr-1" />
            По рейтингу
          </Button>
          <Button
            variant={sort === 'year' ? 'default' : 'outline'}
            size="sm"
            className="cursor-pointer"
            onClick={() => updateParams('sort', sort === 'year' ? '' : 'year')}
          >
            <Calendar className="w-4 h-4 mr-1" />
            По году
          </Button>

          {/* Active filters badges */}
          {year && (
            <Button variant="secondary" size="sm" onClick={() => updateParams('year', '')}>
              Год: {yearParam.split(',').length > 1 ? `${yearParam.split(',').length} годов` : yearParam}
              <X className="w-3 h-3 ml-1" />
            </Button>
          )}
          {rating && (
            <Button variant="secondary" size="sm" onClick={() => updateParams('rating', '')}>
              Рейтинг: {rating}+
              <X className="w-3 h-3 ml-1" />
            </Button>
          )}
          {genres && (
            <Button variant="secondary" size="sm" onClick={() => updateParams('genres', '')}>
              Жанры: {genres.split(',').length}
              <X className="w-3 h-3 ml-1" />
            </Button>
          )}
          {tags && (
            <Button variant="secondary" size="sm" onClick={() => updateParams('tags', '')}>
              Теги: {tags.split(',').length}
              <X className="w-3 h-3 ml-1" />
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