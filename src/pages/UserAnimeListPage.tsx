import { Link, useSearchParams } from 'react-router-dom';
import { useUserAnimeList } from '@/hooks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/lib/imageUrl';

export function UserAnimeListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || undefined;
  const isFavorites = searchParams.get('favorites') === 'true';
  const { data: userAnimeList, isLoading } = useUserAnimeList(status, isFavorites);

  const statusLabels: Record<string, string> = {
    watching: 'Смотрю',
    completed: 'Просмотрено',
    dropped: 'Брошено',
    planned: 'Запланировано',
    favorites: 'Любимое',
  };

  const statuses = ['watching', 'completed', 'dropped', 'planned', 'favorites'];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <Button
            key={s}
            variant={status === s || (s === 'favorites' && isFavorites) ? 'default' : 'outline'}
            onClick={() =>
              s === 'favorites' 
                ? setSearchParams({ favorites: 'true' })
                : setSearchParams(status === s ? {} : { status: s })
            }
          >
            {statusLabels[s]}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12">Загрузка...</div>
      ) : userAnimeList?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Список пуст
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {userAnimeList?.map((item) => (
            <Link key={item.anime_id} to={`/anime/${item.anime_id}`} className="group block relative rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(item.anime.poster)}
                  alt={item.anime.title}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <Badge
                  className={`absolute top-2 left-2 ${
                    isFavorites ? 'bg-pink-500' : 'bg-blue-500'
                  }`}
                >
                  {isFavorites ? '♥' : statusLabels[item.status || 'watching']}
                </Badge>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-12">
                  <h3 className="font-semibold text-sm text-white line-clamp-2">
                    {item.anime.title}
                  </h3>
                </div>
              </Link>
          ))}
        </div>
      )}
    </div>
  );
}