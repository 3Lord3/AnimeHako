/**
 * Transform backend image URL to absolute URL (like AnimeHakoMobile)
 * Backend returns relative URLs like: /static/screenshots/1_01.png
 * Convert to absolute URL like Mobile: http://127.0.0.1:8000/static/screenshots/1_01.png
 */
const STATIC_BASE_URL = 'http://127.0.0.1:8000';

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${STATIC_BASE_URL}${path}`;
}