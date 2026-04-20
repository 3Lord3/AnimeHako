import { Link, useSearchParams } from 'react-router-dom';
import { useUserAnimeList, useUpdateListEntry, useRemoveFromList } from '@/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function UserAnimeListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || undefined;
  const { data: userAnimeList, isLoading } = useUserAnimeList(status);
  const { mutate: updateEntry } = useUpdateListEntry();
  const { mutate: removeFromList } = useRemoveFromList();

  const statusLabels: Record<string, string> = {
    watching: 'Смотрю',
    completed: 'Просмотренно',
    dropped: 'Брошено',
    planned: 'Запланировано',
  };

  const statusColors: Record<string, string> = {
    watching: 'bg-blue-500',
    completed: 'bg-green-500',
    dropped: 'bg-red-500',
    planned: 'bg-yellow-500',
  };

  const handleStatusChange = (animeId: number, newStatus: string) => {
    updateEntry({ animeId, data: { status: newStatus as 'watching' | 'completed' | 'dropped' | 'planned' } });
  };

  const handleRemove = (animeId: number) => {
    if (confirm('Удалить из списка?')) {
      removeFromList(animeId);
    }
  };

  const statuses = ['watching', 'completed', 'dropped', 'planned'];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <Button
            key={s}
            variant={status === s ? 'default' : 'outline'}
            onClick={() =>
              setSearchParams(status === s ? {} : { status: s })
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
            <Card key={item.anime_id} className="overflow-hidden relative group">
              <Link to={`/anime/${item.anime_id}`}>
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img
                    src={item.anime.poster || '/placeholder-poster.jpg'}
                    alt={item.anime.title}
                    className="object-cover w-full h-full"
                    loading="lazy"
                  />
                  <Badge
                    className={`absolute top-2 left-2 ${
                      statusColors[item.status || 'watching']
                    }`}
                  >
                    {statusLabels[item.status || 'watching']}
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-2">
                    {item.anime.title}
                  </h3>
                </CardContent>
              </Link>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <select
                  value={item.status || 'watching'}
                  onChange={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleStatusChange(item.anime_id, e.target.value);
                  }}
                  onClick={(e) => e.preventDefault()}
                  className="bg-background border rounded px-1 py-0.5 text-xs"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {statusLabels[s]}
                    </option>
                  ))}
                </select>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(item.anime_id);
                  }}
                >
                  ✕
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}