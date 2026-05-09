import { Link } from 'react-router-dom';
import { Play, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TournamentIntroProps {
  animeCount: number;
  onStart: () => void;
}

export function TournamentIntro({ animeCount, onStart }: TournamentIntroProps) {
  const hasEnoughAnime = animeCount >= 4;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Trophy icon */}
      <div className="mb-8">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
          <span className="text-6xl">🏆</span>
        </div>
      </div>
      
      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
        Anime Tournament
      </h1>
      
      {/* Description */}
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        Выбери лучшее аниме из своего списка! Смотри, как твои фавориты сражаются друг с другом 
        в напряжённой турнирной сетке.
      </p>
      
      {/* Stats */}
      <div className="mb-8 flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Участников:</span>
        <span className={`font-bold ${hasEnoughAnime ? 'text-green-500' : 'text-red-500'}`}>
          {animeCount}
        </span>
        <span className="text-muted-foreground">/ минимум 4</span>
      </div>
      
      {/* Button or message */}
      {hasEnoughAnime ? (
        <Button 
          onClick={onStart}
          size="lg"
          className="gap-2 text-lg px-8 py-6 bg-gradient-to-r from-primary to-yellow-500 hover:from-primary/90 hover:to-yellow-500/90 text-white font-semibold"
        >
          <Play className="w-5 h-5" />
          Начать турнир
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-400 bg-red-950/30 border border-red-500/30 px-4 py-3 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="font-medium text-red-300">Добавьте несколько аниме в список просмотренного</span>
          </div>
          <Link to="/profile/anime">
            <Button variant="outline" size="lg" className="gap-2 text-foreground border-2 hover:bg-accent">
              В каталог
            </Button>
          </Link>
        </div>
      )}
      
      {/* How it works */}
      <div className="mt-12 max-w-lg">
        <h3 className="font-semibold mb-4 text-foreground">Как это работает?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-muted/50 border border-border rounded-lg">
            <div className="text-2xl mb-2">🎯</div>
            <p className="text-foreground">Выбирай победителя в каждой паре</p>
          </div>
          <div className="p-4 bg-muted/50 border border-border rounded-lg">
            <div className="text-2xl mb-2">⚔️</div>
            <p className="text-foreground">Аниме проходят через раунды</p>
          </div>
          <div className="p-4 bg-muted/50 border border-border rounded-lg">
            <div className="text-2xl mb-2">👑</div>
            <p className="text-foreground">Определяем абсолютного победителя</p>
          </div>
        </div>
      </div>
    </div>
  );
}