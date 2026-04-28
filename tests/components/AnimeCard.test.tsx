import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AnimeCard } from '@/components/AnimeCard';
import type { AnimeListItem } from '@/types';

const mockAnime: AnimeListItem = {
  id: 1,
  title: 'Test Anime Title',
  title_en: 'Test Anime English',
  poster: '/posters/test.jpg',
  rating: 8.5,
  year: 2024,
  episodes: 12,
  genres: ['Action', 'Adventure'],
};

const renderComponent = (props: Partial<React.ComponentProps<typeof AnimeCard>> = {}) => {
  return render(
    <BrowserRouter>
      <AnimeCard anime={mockAnime} {...props} />
    </BrowserRouter>
  );
};

describe('AnimeCard', () => {
  it('renders anime title', () => {
    renderComponent();
    expect(screen.getByText('Test Anime Title')).toBeInTheDocument();
  });

  it('renders anime poster image', () => {
    renderComponent();
    const img = screen.getByAltText('Test Anime Title') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('/posters/test.jpg');
  });

  it('renders rating badge when showRating is true', () => {
    renderComponent({ showRating: true });
    expect(screen.getByText('8.5')).toBeInTheDocument();
  });

  it('does not render rating when showRating is false', () => {
    renderComponent({ showRating: false });
    expect(screen.queryByText('8.5')).not.toBeInTheDocument();
  });

  it('does not render rating when rating is null', () => {
    renderComponent({ anime: { ...mockAnime, rating: null } });
    expect(screen.queryByText('8.5')).not.toBeInTheDocument();
  });

  it('renders user status badge when provided', () => {
    renderComponent({ userStatus: 'watching' });
    expect(screen.getByTitle('Смотрю')).toBeInTheDocument();
  });

  it('renders completed status badge', () => {
    renderComponent({ userStatus: 'completed' });
    expect(screen.getByTitle('Просмотрено')).toBeInTheDocument();
  });

  it('renders favorite badge when isFavorite is true', () => {
    renderComponent({ isFavorite: true });
    expect(screen.getByTitle('Избранное')).toBeInTheDocument();
  });

  it('does not render favorite badge when isFavorite is false', () => {
    renderComponent({ isFavorite: false });
    expect(screen.queryByTitle('Избранное')).not.toBeInTheDocument();
  });

  it('renders link to anime detail page', () => {
    renderComponent();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/anime/1');
  });

  it('handles anime without poster', () => {
    renderComponent({ anime: { ...mockAnime, poster: null } });
    const img = screen.getByAltText('Test Anime Title') as HTMLImageElement;
    expect(img.src).not.toContain('null');
  });

  it('handles anime without year', () => {
    renderComponent({ anime: { ...mockAnime, year: null } });
    expect(screen.getByText('Test Anime Title')).toBeInTheDocument();
  });
});