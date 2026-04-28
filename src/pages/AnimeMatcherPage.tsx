import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRandomAnime, useAddToList, useUser } from '@/hooks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Star, Calendar, CalendarClock, Clock, Film, X, Loader2, Info, Home, ExternalLink } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUrl';
import { cn } from '@/lib/utils';
import type { AnimeDetail } from '@/types';

const SWIPE_THRESHOLD = 100;

interface SwipeCardProps {
  anime: AnimeDetail;
  onSwipe: (direction: 'left' | 'right') => void;
  isActive: boolean;
}

function SwipeCard({ anime, onSwipe, isActive }: SwipeCardProps) {
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isActive) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startX.current = clientX;
    startY.current = clientY;
    // Prevent default to avoid scrolling while swiping
    if ('preventDefault' in e) {
      e.preventDefault();
    }
    // Capture mouse for drag tracking
    if (cardRef.current && 'setCapture' in cardRef.current) {
      (cardRef.current as unknown as { setCapture: () => void }).setCapture();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isActive) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    const deltaX = clientX - startX.current;
    const deltaY = clientY - startY.current;
    setTranslateX(deltaX);
    setTranslateY(deltaY * 0.3);
    setRotation(deltaX / 20);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isActive) return;
    if ('preventDefault' in e) {
      e.preventDefault();
    }
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - startX.current;
    const deltaY = clientY - startY.current;
    setTranslateX(deltaX);
    setTranslateY(deltaY * 0.3);
    setRotation(deltaX / 20);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // Release mouse capture
    if (cardRef.current && 'releaseCapture' in cardRef.current) {
      (cardRef.current as unknown as { releaseCapture: () => void }).releaseCapture();
    }
    if (Math.abs(translateX) > SWIPE_THRESHOLD) {
      onSwipe(translateX > 0 ? 'right' : 'left');
    } else {
      setTranslateX(0);
      setTranslateY(0);
      setRotation(0);
    }
  };

  const swipeDirection = translateX > 50 ? 'right' : translateX < -50 ? 'left' : null;
  const swipeOpacity = Math.min(Math.abs(translateX) / SWIPE_THRESHOLD, 1);

  return (
    <div
      ref={cardRef}
      className={cn(
        "w-full max-w-[360px] mx-auto touch-none select-text rounded-xl overflow-hidden shadow-2xl relative",
        isActive ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      )}
      style={{
        transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        touchAction: 'none',
      }}
      onMouseDown={handleTouchStart}
      onMouseMove={handleMouseMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Poster only - full coverage */}
      <div className="relative bg-muted aspect-[2/3]">
        {anime.poster ? (
          <img
            src={getImageUrl(anime.poster)}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Film className="w-20 h-20 text-muted-foreground" />
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Swipe overlay indicator - centered */}
        {swipeDirection && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center z-20",
              swipeDirection === 'right' ? "bg-green-500/60" : "bg-red-500/60"
            )}
            style={{ opacity: swipeOpacity }}
          >
            <span className="text-white text-2xl font-bold text-center px-4">
              {swipeDirection === 'right' ? 'В ЗАПЛАНИРОВАННОЕ' : 'ПРОПУСК'}
            </span>
          </div>
        )}
        
        {/* Genres in top-left corner - larger */}
        {anime.genres && anime.genres.length > 0 && (
          <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2 z-10">
            {anime.genres.slice(0, 3).map((genre) => (
              <Badge 
                key={genre} 
                variant="secondary" 
                className="text-sm px-2 py-1 bg-black/60 backdrop-blur-sm text-white border-0 font-medium"
              >
                {genre}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Title and rating at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white select-text">
          <h2 className="text-2xl font-bold mb-1">{anime.title}</h2>
          {anime.title_en && (
            <p className="text-sm text-gray-200 mb-3">{anime.title_en}</p>
          )}
          <div className="flex items-center gap-4 text-sm">
            {anime.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{Number(anime.rating).toFixed(1)}</span>
              </div>
            )}
            {anime.year && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{anime.year}</span>
              </div>
            )}
            {anime.episodes && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{anime.episodes} эп.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnimeMatcherPage() {
  const navigate = useNavigate();
  const { data: user } = useUser();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  
  const { data: anime, isLoading, refetch } = useRandomAnime();
  const { mutate: addToList, isPending: isAdding } = useAddToList();

  // Use anime directly as currentAnime - no need for separate state
  const currentAnime = anime ?? null;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setShowDescriptionModal(false);
    
    if (direction === 'right' && currentAnime) {
      addToList(
        { anime_id: currentAnime.id, status: 'planned' },
        {
          onSuccess: () => {
            loadNextAnime();
          },
          onError: () => {
            setIsTransitioning(false);
          }
        }
      );
    } else {
      loadNextAnime();
    }
  };

  const loadNextAnime = () => {
    setIsTransitioning(true);
    refetch().then(() => {
      setIsTransitioning(false);
    });
  };

  const handleActionButton = (direction: 'left' | 'right') => {
    if (isTransitioning || isAdding) return;
    handleSwipe(direction);
  };

  if (isLoading && !currentAnime) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentAnime && !isLoading) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">Аниме не найдено</p>
        <Button onClick={() => refetch()}>Попробовать снова</Button>
      </div>
    );
  }

  return (
    <div className="md:space-y-6">
      {/* Header - desktop only */}
      <div className="hidden md:block text-center md:space-y-2">
        <h1 className="text-4xl font-bold select-text">AniMatch</h1>
        <p className="text-muted-foreground select-text">
          Свайпайте влево чтобы пропустить, вправо чтобы добавить в запланированное
        </p>
      </div>

      {/* Mobile: show description only */}
      <div className="md:hidden text-center">
        <p className="text-sm text-muted-foreground select-text">
          Свайпайте влево чтобы пропустить, вправо чтобы добавить в запланированное
        </p>
      </div>

      {/* Desktop layout - buttons on sides */}
      <div className="hidden md:flex items-center justify-center gap-6">
        {/* Left side buttons */}
        <div className="flex flex-col items-center gap-6">
          <Button
            variant="outline"
            size="lg"
            className="h-16 w-16 rounded-full border-2 border-red-500 hover:bg-red-500/10 hover:text-red-500"
            onClick={() => handleActionButton('left')}
            disabled={isTransitioning || isAdding}
            title="Пропустить"
          >
            <X className="w-8 h-8 text-red-500" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-14 w-14 rounded-full border-2 border-muted-foreground/30 hover:bg-muted"
            onClick={() => navigate('/')}
            title="На главную"
          >
            <Home className="w-6 h-6" />
          </Button>
        </div>

        {/* Swipe card */}
        <div className="w-[360px]">
          {currentAnime && (
            <SwipeCard
              key={currentAnime.id}
              anime={currentAnime}
              onSwipe={handleSwipe}
              isActive={!isTransitioning}
            />
          )}
        </div>

        {/* Right side buttons */}
        <div className="flex flex-col items-center gap-6">
          <Button
            variant="outline"
            size="lg"
            className="h-16 w-16 rounded-full border-2 border-green-500 hover:bg-green-500/10 hover:text-green-500"
            onClick={() => handleActionButton('right')}
            disabled={isTransitioning || isAdding}
            title="В запланированное"
          >
            {isAdding ? (
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            ) : (
              <CalendarClock className="w-8 h-8 text-green-500" />
            )}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-14 w-14 rounded-full border-2 border-muted-foreground/30 hover:bg-muted"
            onClick={() => currentAnime && navigate(`/anime/${currentAnime.id}`)}
            title="Открыть страницу аниме"
          >
            <ExternalLink className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex flex-col h-[calc(100vh-150px)]">
        {/* Swipe card area */}
        <div className="relative flex-grow flex items-center justify-center">
          {currentAnime && (
            <SwipeCard
              key={currentAnime.id}
              anime={currentAnime}
              onSwipe={handleSwipe}
              isActive={!isTransitioning}
            />
          )}
        </div>

        {/* Action buttons - pinned at bottom */}
        <div className="flex flex-col items-center gap-4 pb-4">
          {/* Main action buttons */}
          <div className="flex justify-center gap-8">
            <Button
              variant="outline"
              size="lg"
              className="h-16 w-16 rounded-full border-2 border-red-500 hover:bg-red-500/10 hover:text-red-500"
              onClick={() => handleActionButton('left')}
              disabled={isTransitioning || isAdding}
              title="Пропустить"
            >
              <X className="w-8 h-8 text-red-500" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="h-16 w-16 rounded-full border-2 border-green-500 hover:bg-green-500/10 hover:text-green-500"
              onClick={() => handleActionButton('right')}
              disabled={isTransitioning || isAdding}
              title="В запланированное"
            >
              {isAdding ? (
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
              ) : (
                <CalendarClock className="w-8 h-8 text-green-500" />
              )}
            </Button>
          </div>

          {/* Secondary buttons */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              className="h-14 w-14 rounded-full border-2 border-muted-foreground/30 hover:bg-muted"
              onClick={() => navigate('/')}
              title="На главную"
            >
              <Home className="w-6 h-6" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="h-14 w-14 rounded-full border-2 border-muted-foreground/30 hover:bg-muted"
              onClick={() => currentAnime && navigate(`/anime/${currentAnime.id}`)}
              title="Страница аниме"
            >
              <ExternalLink className="w-6 h-6" />
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              className="h-14 w-14 rounded-full border-2 border-muted-foreground/30 hover:bg-muted"
              onClick={() => setShowDescriptionModal(true)}
              title="Описание"
            >
              <Info className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Description panel - desktop only */}
      <div className="hidden md:block w-full select-text">
        <Card className="py-0">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-2">Описание</h3>
            {currentAnime?.description ? (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {currentAnime.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Описание отсутствует</p>
            )}
            
            {/* Tags */}
            {currentAnime?.tags && currentAnime.tags.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-medium">Теги</h4>
                <div className="flex flex-wrap gap-1.5">
                  {currentAnime.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description modal for mobile */}
      <Dialog open={showDescriptionModal} onOpenChange={setShowDescriptionModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{currentAnime?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {currentAnime?.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {currentAnime.description}
              </p>
            )}
            {currentAnime?.tags && currentAnime.tags.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Теги</h4>
                <div className="flex flex-wrap gap-1.5">
                  {currentAnime.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
