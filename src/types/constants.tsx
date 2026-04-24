import { Eye, CheckCircle, XCircle, CalendarClock, Heart } from 'lucide-react';

export type StatusType = 'watching' | 'completed' | 'dropped' | 'planned';

export const STATUS_ICONS: Record<StatusType, React.ReactNode> = {
  watching: <Eye size={24} strokeWidth={2.5} />,
  completed: <CheckCircle size={24} strokeWidth={2.5} />,
  dropped: <XCircle size={24} strokeWidth={2.5} />,
  planned: <CalendarClock size={24} strokeWidth={2.5} />,
};

export const STATUS_COLORS: Record<StatusType, string> = {
  watching: 'bg-blue-500',
  completed: 'bg-green-500',
  dropped: 'bg-red-500',
  planned: 'bg-yellow-500',
};

export const STATUS_LABELS: Record<StatusType, string> = {
  watching: 'Смотрю',
  completed: 'Просмотрено',
  dropped: 'Брошено',
  planned: 'Запланировано',
};

export const ALL_STATUSES: StatusType[] = ['watching', 'completed', 'dropped', 'planned'];

export const FAVORITE_ICON = <Heart size={24} strokeWidth={2.5} />;

export const SEASON_LABELS: Record<string, string> = {
  winter: 'Зима',
  spring: 'Весна',
  summer: 'Лето',
  autumn: 'Осень',
};

export function getRatingColor(rating: number | string): string {
  const r = typeof rating === 'number' ? rating : Number(rating);
  if (r >= 8) return 'bg-green-500';
  if (r >= 6) return 'bg-yellow-500';
  return 'bg-red-500';
}