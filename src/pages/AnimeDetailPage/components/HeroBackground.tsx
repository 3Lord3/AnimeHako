import { getImageUrl } from '@/lib/imageUrl';

interface HeroBackgroundProps {
  cover: string | null;
}

export function HeroBackground({ cover }: HeroBackgroundProps) {
  if (!cover) return null;

  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 to-background" />
      <img
        src={getImageUrl(cover)}
        alt=""
        className="w-full h-full object-cover blur-xl scale-110"
      />
    </div>
  );
}