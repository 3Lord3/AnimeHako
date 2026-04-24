import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchSection({ value, onChange }: SearchSectionProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder="Поиск аниме..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}