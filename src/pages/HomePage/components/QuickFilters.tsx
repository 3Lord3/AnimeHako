import { Button } from '@/components/ui/button';
import { Star, Calendar, X } from 'lucide-react';

interface QuickFiltersProps {
  sort: string;
  year: number | undefined;
  rating: number | undefined;
  genres: string;
  tags: string;
  yearParam: string;
  onUpdateSort: (sort: string) => void;
  onUpdateYear: (year: string) => void;
  onUpdateRating: (rating: string) => void;
  onUpdateGenres: (genres: string) => void;
  onUpdateTags: (tags: string) => void;
}

export function QuickFilters({
  sort,
  year,
  rating,
  genres,
  tags,
  yearParam,
  onUpdateSort,
  onUpdateYear,
  onUpdateRating,
  onUpdateGenres,
  onUpdateTags,
}: QuickFiltersProps) {
  return (
    <div className="flex gap-2 flex-wrap items-center">
      <Button
        variant={sort === 'rating' ? 'default' : 'outline'}
        size="sm"
        className="cursor-pointer"
        onClick={() => onUpdateSort(sort === 'rating' ? '' : 'rating')}
      >
        <Star className="w-4 h-4 mr-1" />
        По рейтингу
      </Button>
      <Button
        variant={sort === 'year' ? 'default' : 'outline'}
        size="sm"
        className="cursor-pointer"
        onClick={() => onUpdateSort(sort === 'year' ? '' : 'year')}
      >
        <Calendar className="w-4 h-4 mr-1" />
        По году
      </Button>

      {year && (
        <Button variant="secondary" size="sm" onClick={() => onUpdateYear('')}>
          Год: {yearParam.split(',').length > 1 ? `${yearParam.split(',').length} годов` : yearParam}
          <X className="w-3 h-3 ml-1" />
        </Button>
      )}
      {rating && (
        <Button variant="secondary" size="sm" onClick={() => onUpdateRating('')}>
          Рейтинг: {rating}+
          <X className="w-3 h-3 ml-1" />
        </Button>
      )}
      {genres && (
        <Button variant="secondary" size="sm" onClick={() => onUpdateGenres('')}>
          Жанры: {genres.split(',').length}
          <X className="w-3 h-3 ml-1" />
        </Button>
      )}
      {tags && (
        <Button variant="secondary" size="sm" onClick={() => onUpdateTags('')}>
          Теги: {tags.split(',').length}
          <X className="w-3 h-3 ml-1" />
        </Button>
      )}
    </div>
  );
}