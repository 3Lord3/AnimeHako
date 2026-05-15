import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TournamentParticipantSelector } from './TournamentParticipantSelector';
import type { AnimeListItem } from '@/types';

interface TournamentIntroProps {
  completedAnime: AnimeListItem[];
  onStart: (selectedAnime: AnimeListItem[]) => void;
}

export function TournamentIntro({ completedAnime, onStart }: TournamentIntroProps) {
  const [selectedAnime, setSelectedAnime] = useState<AnimeListItem[]>([]);
  
  const hasEnoughAnime = selectedAnime.length >= 4;
  
  const handleStart = () => {
    if (hasEnoughAnime) {
      onStart(selectedAnime);
    }
  };
  
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
      
      {/* Participant Selector */}
      <div className="w-full max-w-2xl mb-8">
        <TournamentParticipantSelector
          completedAnime={completedAnime}
          selectedAnime={selectedAnime}
          onSelectionChange={setSelectedAnime}
        />
      </div>
      
      {/* Button or message */}
      {hasEnoughAnime ? (
        <Button 
          onClick={handleStart}
          size="lg"
          className="gap-2 text-lg px-8 py-6 bg-gradient-to-r from-primary to-yellow-500 hover:from-primary/90 hover:to-yellow-500/90 text-white font-semibold"
        >
          <Play className="w-5 h-5" />
          Начать турнир
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 px-4 py-3 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span className="font-medium text-amber-800 dark:text-amber-300">
              Выберите минимум 4 аниме для участия в турнире
            </span>
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