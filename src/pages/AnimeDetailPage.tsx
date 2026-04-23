import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAnimeDetail, useAnimeReviews, useAddToList, useUserAnimeList, useToggleFavorite, useUpdateListEntry } from '@/hooks';
import { useUser } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Calendar, Clock, Film, Heart, Eye, CheckCircle, XCircle, CalendarClock } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUrl';
import { cn } from '@/lib/utils';

export function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const animeId = parseInt(id || '0');
  const navigate = useNavigate();
  const { data: user } = useUser();

  const { data: anime, isLoading } = useAnimeDetail(animeId);
  const { data: reviews } = useAnimeReviews(animeId, 5);
  const { data: userAnimeList } = useUserAnimeList();
  const { mutate: addToList } = useAddToList();
  const { mutate: toggleFavorite } = useToggleFavorite();


  const { mutate: updateListEntry } = useUpdateListEntry();

  const userAnime = userAnimeList?.find((item) => item.anime_id === animeId);

  const handleAddToList = (status: StatusType) => {
    if (!user) {
      navigate('/login');
      return;
    }
    // If already in list, update status instead of adding new
    if (userAnime) {
      updateListEntry(
        { animeId, data: { status } },
        { onError: () => {} }
      );
    } else {
      addToList(
        { anime_id: animeId, status },
        { onError: () => {} }
      );
    }
  };

  const handleToggleFavorite = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    toggleFavorite({ animeId, isFavorite: userAnime?.is_favorite || false });
  };

  const statusLabels = {
    watching: 'Смотрю',
    completed: 'Просмотрено',
    dropped: 'Брошено',
    planned: 'Запланировано',
  } as const;

  type StatusType = keyof typeof statusLabels;

  const statusIcons: Record<StatusType, React.ReactNode> = {
    watching: <Eye className="w-5 h-5" />,
    completed: <CheckCircle className="w-5 h-5" />,
    dropped: <XCircle className="w-5 h-5" />,
    planned: <CalendarClock className="w-5 h-5" />,
  };

  const seasonLabels: Record<string, string> = {
    winter: 'Зима',
    spring: 'Весна',
    summer: 'Лето',
    autumn: 'Осень',
  };

  const statusOptions: StatusType[] = ['watching', 'completed', 'dropped', 'planned'];

  if (isLoading) {
    return <div className="text-center py-12">Загрузка...</div>;
  }

  if (!anime) {
    return <div className="text-center py-12">Аниме не найдено</div>;
  }

  return (
    <div className="space-y-8">
      {/* Hero with blurred background */}
      {anime.cover && (
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 to-background" />
          <img
            src={getImageUrl(anime.cover)}
            alt=""
            className="w-full h-full object-cover blur-xl scale-110"
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Poster column with buttons below */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <img
            src={getImageUrl(anime.poster)}
            alt={anime.title}
            className="w-64 rounded-lg shadow-lg"
          />
          {user && (
            <div className="flex gap-2 mt-4">
              <Button
                variant={userAnime?.is_favorite ? 'default' : 'outline'}
                size="icon"
                onClick={handleToggleFavorite}
                className="relative group"
              >
                <Heart
                  className={cn(
                    'w-5 h-5',
                    userAnime?.is_favorite ? 'fill-current' : ''
                  )}
                />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background border rounded px-2 py-1 text-xs text-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {userAnime?.is_favorite ? 'В любимом' : 'В любимое'}
                </span>
              </Button>
              {statusOptions.map((status) => (
                <Button
                  key={status}
                  variant={userAnime?.status === status ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => handleAddToList(status)}
                  className="relative group"
                >
                  {statusIcons[status]}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background border rounded px-2 py-1 text-xs text-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {statusLabels[status]}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold">{anime.title}</h1>
          {anime.title_en && (
            <p className="text-xl text-muted-foreground">{anime.title_en}</p>
          )}
          {anime.title_jp && (
            <p className="text-lg text-muted-foreground">{anime.title_jp}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {anime.rating && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {typeof anime.rating === 'number' ? anime.rating.toFixed(1) : Number(anime.rating).toFixed(1)}
              </Badge>
            )}
            {anime.year && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {anime.year}
              </Badge>
            )}
            {anime.season && (
              <Badge variant="outline">
                {seasonLabels[anime.season] || anime.season}
              </Badge>
            )}
            {anime.status && (
              <Badge variant={anime.status === 'ongoing' ? 'default' : 'secondary'}>
                {anime.status === 'ongoing' ? 'Онгоинг' : 'Завершено'}
              </Badge>
            )}
            {anime.episodes && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Film className="w-4 h-4" />
                {anime.episodes} эп.
              </Badge>
            )}
            {anime.duration && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {anime.duration} мин.
              </Badge>
            )}
          </div>

          {anime.studio && (
            <p>
              <strong>Студия:</strong> {anime.studio}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {anime.genres.map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {anime.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {anime.description && (
        <Card>
          <CardHeader>
            <CardTitle>Описание</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{anime.description}</p>
          </CardContent>
        </Card>
      )}

      {reviews && reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Обзоры</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <strong>{review.author_name}</strong>
                  {review.score && (
                    <Badge variant="outline">{review.score}/10</Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <h4 className="font-medium">{review.title}</h4>
                <p className="text-muted-foreground">{review.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}