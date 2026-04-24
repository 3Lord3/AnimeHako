import { Loader2 } from 'lucide-react';

interface SuspenseFallbackProps {
  message?: string;
}

export function SuspenseFallback({ message = 'Загрузка...' }: SuspenseFallbackProps) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}