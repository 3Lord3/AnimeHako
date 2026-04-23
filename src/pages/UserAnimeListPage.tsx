import { Link, useSearchParams } from 'react-router-dom';
import { useUserAnimeList } from '@/hooks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, CheckCircle, XCircle, CalendarClock, Heart } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUrl';

export function UserAnimeListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || undefined;
  const isFavorites = searchParams.get('favorites') === 'true';
  const { data: userAnimeList, isLoading } = useUserAnimeList(statusParam, isFavorites);
  const { data: allLists } = useUserAnimeList();

  const statusIcons: Record<string, React.ReactNode> = {
    watching: <Eye size={24} strokeWidth={2.5} />,
    completed: <CheckCircle size={24} strokeWidth={2.5} />,
    dropped: <XCircle size={24} strokeWidth={2.5} />,
    planned: <CalendarClock size={24} strokeWidth={2.5} />,
    favorites: <Heart size={24} strokeWidth={2.5} />,
  };

  const statusLabels: Record<string, string> = {
    watching: 'Смотрю',
    completed: 'Просмотрено',
    dropped: 'Брошено',
    planned: 'Запланировано',
    favorites: 'Любимое',
  };

  const statuses = ['watching', 'completed', 'dropped', 'planned', 'favorites'];

  const [watching, completed, dropped, planned, favorites] = [
    allLists?.filter((a) => a.status === 'watching') || [],
    allLists?.filter((a) => a.status === 'completed') || [],
    allLists?.filter((a) => a.status === 'dropped') || [],
    allLists?.filter((a) => a.status === 'planned') || [],
    allLists?.filter((a) => a.is_favorite) || [],
  ];

  const stats = [
    { label: 'Смотрю', count: watching.length },
    { label: 'Просмотренно', count: completed.length },
    { label: 'Брошено', count: dropped.length },
    { label: 'Запланировано', count: planned.length },
    { label: 'Любимое', count: favorites.length },
  ];

  const displayList = !statusParam && !isFavorites 
    ? allLists || [] 
    : userAnimeList || [];

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="text-center">
              <p className="text-3xl font-bold">{stat.count}</p>
              <p className="text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <Button
            key={s}
            variant={statusParam === s || (s === 'favorites' && isFavorites) ? 'default' : 'outline'}
            onClick={() =>
              s === 'favorites' 
                ? setSearchParams({ favorites: 'true' })
                : setSearchParams(statusParam === s ? {} : { status: s })
            }
          >
            {statusLabels[s]}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12">Загрузка...</div>
      ) : displayList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Список пуст
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayList.map((item) => (
            <Link key={item.anime_id} to={`/anime/${item.anime_id}`} className="group block relative rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(item.anime.poster)}
                  alt={item.anime.title}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 right-2 flex justify-between items-start gap-1">
                  <Badge className="bg-blue-500 h-9 w-9 p-0 rounded-full">
                    <span className="flex items-center justify-center w-full h-full">
                      {statusIcons[item.status || 'watching']}
                    </span>
                  </Badge>
                  {item.is_favorite && (
                    <Badge className="bg-pink-500 h-9 w-9 p-0 rounded-full">
                      <span className="flex items-center justify-center w-full h-full text-lg">
                        ♥
                      </span>
                    </Badge>
                  )}
                </div>
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