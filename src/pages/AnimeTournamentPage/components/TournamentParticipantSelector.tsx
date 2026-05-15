import { useState, useRef, useEffect } from 'react';
import { Search, X, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAnimeList } from '@/hooks';
import { useDebounce } from '@/hooks/useDebounce';
import { getImageUrl } from '@/lib/imageUrl';
import type { AnimeListItem } from '@/types';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  // Search for anime in global catalog (excluding already selected)
  const { data: searchResults, isLoading: isSearching } = useAnimeList({
    search: debouncedSearch,
    limit: 10,
  });
  
  // Filter out already selected or completed anime from search results
  const availableResults = (searchResults?.data || []).filter(
    (anime) =>
      !selectedAnime.some((a) => a.id === anime.id) &&
      !completedAnime.some((a) => a.id === anime.id)
  );
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
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
    inputRef.current?.focus();
  };
  
  const handleRemove = (animeId: number) => {
    onSelectionChange(selectedAnime.filter((a) => a.id !== animeId));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || availableResults.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < availableResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < availableResults.length) {
          handleAddFromSearch(availableResults[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
    setHighlightedIndex(-1);
  };
  
  const handleInputFocus = () => {
    if (searchQuery.trim()) {
      setShowDropdown(true);
    }
  };
  
  return (
    <div className="w-full space-y-4">
      {/* Search Section */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Поиск аниме..."
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowDropdown(false);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Search Results Dropdown */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto"
          >
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
                      className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors text-left ${
                        index === highlightedIndex ? 'bg-accent' : ''
                      }`}
                    >
                      <img
                        src={getImageUrl(anime.poster)}
                        alt={anime.title}
                        className="w-10 h-14 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[var(--color-foreground)] dark:text-[var(--color-foreground)] truncate">{anime.title}</p>
                        <p className="text-xs text-muted-foreground">
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
      
      {/* Add All Button */}
      <div className="flex items-center justify-between">
        {selectedAnime.length < completedAnime.length ? (
          <Button
            variant="outline"
            onClick={handleAddAllCompleted}
            className="gap-2 text-foreground dark:text-foreground"
          >
            <Plus className="w-4 h-4" />
            Добавить все просмотренные ({completedAnime.length - selectedAnime.length})
          </Button>
        ) : null}
        
        {selectedAnime.length > 0 && (
          <span className="text-sm text-muted-foreground">
            Выбрано: {selectedAnime.length}
          </span>
        )}
      </div>
      
      {/* Selected Anime Grid */}
      {selectedAnime.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {selectedAnime.map((anime) => (
            <div
              key={anime.id}
              className="relative group aspect-[3/4] rounded-lg overflow-hidden"
            >
              <img
                src={getImageUrl(anime.poster)}
                alt={anime.title}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-2">
                <p className="text-xs font-medium text-white truncate">
                  {anime.title}
                </p>
              </div>
              <button
                onClick={() => handleRemove(anime.id)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                title="Удалить из участников"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Empty State */}
      {selectedAnime.length === 0 && completedAnime.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">У вас пока нет просмотренных аниме</p>
        </div>
      )}
    </div>
  );
}