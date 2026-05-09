import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Clock, Film, Building2, Tag } from 'lucide-react';
import { SEASON_LABELS } from '@/types/constants';

interface CharacteristicItemProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

function CharacteristicItem({ label, value, icon }: CharacteristicItemProps) {
  if (!value) return null;

  return (
    <div className="flex flex-col gap-1 py-2 px-2 rounded-md hover:bg-muted/50 transition-colors min-w-0">
      <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium select-text">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-foreground select-text font-medium">
        {value}
      </div>
    </div>
  );
}

interface AnimeCharacteristicsProps {
  anime: {
    rating: number | null;
    year: number | null;
    season: string | null;
    status: string | null;
    episodes: number | null;
    duration: number | null;
    studio: string | null;
    genres: string[];
    tags: string[];
  };
  className?: string;
}

export function AnimeCharacteristics({ anime, className }: AnimeCharacteristicsProps) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-1 ${className || ''}`}>
      <CharacteristicItem
        label="Рейтинг"
        icon={<Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />}
        value={
          anime.rating !== null && anime.rating !== undefined && !isNaN(Number(anime.rating)) ? (
            <span className="font-medium text-foreground">{typeof anime.rating === 'number' ? anime.rating.toFixed(1) : Number(anime.rating).toFixed(1)}</span>
          ) : null
        }
      />
      <CharacteristicItem
        label="Год"
        icon={<Calendar className="w-3.5 h-3.5" />}
        value={anime.year && anime.year > 0 ? <span className="text-foreground">{anime.year}</span> : null}
      />
      <CharacteristicItem
        label="Сезон"
        icon={<Calendar className="w-3.5 h-3.5" />}
        value={anime.season ? <span className="text-foreground">{SEASON_LABELS[anime.season] || anime.season}</span> : null}
      />
      <CharacteristicItem
        label="Статус"
        value={
          anime.status ? (
            <Badge variant={anime.status === 'ongoing' ? 'default' : 'secondary'}>
              {anime.status === 'ongoing' ? 'Онгоинг' : 'Завершено'}
            </Badge>
          ) : null
        }
      />
      <CharacteristicItem
        label="Эпизоды"
        icon={<Film className="w-3.5 h-3.5" />}
        value={anime.episodes && anime.episodes > 0 ? <span className="text-foreground">{anime.episodes} эп.</span> : null}
      />
      <CharacteristicItem
        label="Длительность"
        icon={<Clock className="w-3.5 h-3.5" />}
        value={anime.duration && anime.duration > 0 ? <span className="text-foreground">{anime.duration} мин.</span> : null}
      />
      <CharacteristicItem
        label="Студия"
        icon={<Building2 className="w-3.5 h-3.5" />}
        value={anime.studio ? <span className="text-foreground">{anime.studio}</span> : null}
      />
      <CharacteristicItem
        label="Жанры"
        icon={<Tag className="w-3.5 h-3.5" />}
        value={
          anime.genres.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {anime.genres.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>
          ) : null
        }
      />
      <CharacteristicItem
        label="Теги"
        icon={<Tag className="w-3.5 h-3.5" />}
        value={
          anime.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {anime.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null
        }
      />
    </div>
  );
}
