import { useState } from 'react';
import { Search, X, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAnimeList } from '@/hooks';
import { useDebounce } from '@/hooks/useDebounce';
import type { AnimeListItem } from '@/types';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/imageUrl';

interface TournamentParticipantSelectorProps {
  completedAnime: AnimeListItem[];
  selectedAnime: AnimeListItem[];
  onSelectionChange: (anime: AnimeListItem[]) => void;
}

export function TournamentParticipantSelector({
  completedAnime,
  selectedAnime,
  onSelectionChange,
}: TournamentParticipantSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Search for anime in global catalog
  const { data: searchResults, isLoading: isSearching } = useAnimeList({
    search: debouncedSearch,
    limit: 10,
  });

  // Filter out already selected or completed anime
  const availableResults = (searchResults?.data || []).filter(
    (anime) =>
      !selectedAnime.some((a) => a.id === anime.id) &&
      !completedAnime.some((a) => a.id === anime.id)
  );

  const handleAddAllCompleted = () => {
    const remaining = completedAnime.filter(
      (anime) => !selectedAnime.some((a) => a.id === anime.id)
    );
    onSelectionChange([...selectedAnime, ...remaining]);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleAddFromSearch = (anime: AnimeListItem) => {
    onSelectionChange([...selectedAnime, anime]);
    setSearchQuery('');
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const handleRemove = (animeId: number) => {
    onSelectionChange(selectedAnime.filter((a) => a.id !== animeId));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
    setHighlightedIndex(-1);
  };

  const remaining = completedAnime.filter(
    (anime) => !selectedAnime.some((a) => a.id === anime.id)
  );

  return (
    <div className="w-full space-y-4">
      {/* Search Section */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Поиск аниме..."
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => searchQuery.trim() && setShowDropdown(true)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowDropdown(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden max-h-48 sm:max-h-64 overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="text-sm">Поиск...</span>
              </div>
            ) : availableResults.length > 0 ? (
              <ul className="py-1">
                {availableResults.map((anime, index) => (
                  <li key={anime.id}>
                    <button
                      onClick={() => handleAddFromSearch(anime)}
                      className={cn(
                        "w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2 hover:bg-accent transition-colors text-left active:bg-accent/80",
                        index === highlightedIndex ? 'bg-accent' : ''
                      )}
                    >
                      <img
                        src={getImageUrl(anime.poster)}
                        alt={anime.title}
                        className="w-8 h-11 sm:w-10 sm:h-14 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-sm text-foreground truncate">
                          {anime.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {anime.year || '—'} • {anime.genres?.slice(0, 2).join(', ') || '—'}
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : debouncedSearch ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Ничего не найдено
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Введите название аниме
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full">
        <div className="flex flex-wrap items-center gap-2">
          {remaining.length > 0 && (
            <button
              onClick={handleAddAllCompleted}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-input bg-background hover:bg-accent rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Добавить все ({remaining.length})
            </button>
          )}
          {selectedAnime.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            >
              Очистить
            </button>
          )}
        </div>
        {selectedAnime.length > 0 && (
          <span className="text-sm text-muted-foreground">
            Выбрано: {selectedAnime.length}
          </span>
        )}
      </div>

      {/* Selected Anime Grid */}
      {selectedAnime.length > 0 && (
        <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
          {selectedAnime.map((anime) => (
            <div
              key={anime.id}
              onClick={() => handleRemove(anime.id)}
              className="relative group aspect-[2/3] rounded-lg overflow-hidden cursor-pointer"
            >
              <img
                src={getImageUrl(anime.poster)}
                alt={anime.title}
                className="object-cover w-full h-full transition-all duration-200 group-hover:brightness-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-8 h-8 bg-red-500/90 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-1.5 sm:p-2">
                <p className="text-[10px] sm:text-xs font-medium text-white truncate leading-tight">
                  {anime.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {selectedAnime.length === 0 && completedAnime.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">У вас пока нет просмотренных аниме</p>
        </div>
      )}
    </div>
  );
}