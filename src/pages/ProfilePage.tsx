import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser, useUpdateProfile, useUserAnimeList } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getImageUrl } from '@/lib/imageUrl';

export function ProfilePage() {
  const { data: user, isLoading } = useUser();
  const { data: userAnimeList } = useUserAnimeList();
  const { mutate: updateProfile } = useUpdateProfile();

  const [username, setUsername] = useState(user?.username || '');
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return <div className="text-center py-12">Загрузка...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="mb-4">Для просмотра профиля необходимо войти</p>
        <Link to="/login">
          <Button>Войти</Button>
        </Link>
      </div>
    );
  }

  const handleUpdateProfile = () => {
    updateProfile(
      { username },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

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

  const watching = userAnimeList?.filter((a) => a.status === 'watching') || [];
  const completed = userAnimeList?.filter((a) => a.status === 'completed') || [];
  const dropped = userAnimeList?.filter((a) => a.status === 'dropped') || [];
  const planned = userAnimeList?.filter((a) => a.status === 'planned') || [];

  const stats = [
    { label: 'Смотрю', count: watching.length },
    { label: 'Просмотренно', count: completed.length },
    { label: 'Брошено', count: dropped.length },
    { label: 'Запланировано', count: planned.length },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="text-2xl">
                {user.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Имя пользователя"
                  />
                  <Button onClick={handleUpdateProfile}>Сохранить</Button>
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>
                    Отмена
                  </Button>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{user.username}</h1>
                  <p className="text-muted-foreground">{user.email}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="mt-2"
                  >
                    Изменить имя
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{stat.count}</p>
              <p className="text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="watching">
        <TabsList>
          <TabsTrigger value="watching">Смотрю ({watching.length})</TabsTrigger>
          <TabsTrigger value="completed">
            Просмотренно ({completed.length})
          </TabsTrigger>
          <TabsTrigger value="dropped">Брошено ({dropped.length})</TabsTrigger>
          <TabsTrigger value="planned">
            Запланировано ({planned.length})
          </TabsTrigger>
        </TabsList>

        {['watching', 'completed', 'dropped', 'planned'].map((status) => {
          const list = ({
            watching,
            completed,
            dropped,
            planned,
          }[status]) || [];

          return (
            <TabsContent key={status} value={status}>
              {list.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Нет аниме в этом списке
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {list.map((item) => (
                    <Link key={item.anime_id} to={`/anime/${item.anime_id}`}>
                      <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
                        <div className="aspect-[3/4] relative overflow-hidden">
                          <img
                            src={getImageUrl(item.anime.poster)}
                            alt={item.anime.title}
                            className="object-cover w-full h-full"
                            loading="lazy"
                          />
                          <Badge
                            className={`absolute top-2 left-2 ${statusColors[item.status || 'watching']}`}
                          >
                            {statusLabels[item.status || 'watching']}
                          </Badge>
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-semibold text-sm line-clamp-2">
                            {item.anime.title}
                          </h3>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}