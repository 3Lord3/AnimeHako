import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AnimeGrid } from '@/components/AnimeGrid';
import type { AnimeListItem } from '@/types';

const mockAnimeList: AnimeListItem[] = [
  { id: 1, title: 'Anime 1', title_en: 'Anime 1 EN', poster: '/posters/1.jpg', rating: 8.0, year: 2024, episodes: 12, genres: ['Action'] },
  { id: 2, title: 'Anime 2', title_en: 'Anime 2 EN', poster: '/posters/2.jpg', rating: 7.5, year: 2023, episodes: 24, genres: ['Comedy'] },
  { id: 3, title: 'Anime 3', title_en: 'Anime 3 EN', poster: '/posters/3.jpg', rating: 9.0, year: 2024, episodes: 13, genres: ['Drama'] },
];

describe('AnimeGrid', () => {
  it('renders anime list', () => {
    render(
      <BrowserRouter>
        <AnimeGrid anime={mockAnimeList} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Anime 1')).toBeInTheDocument();
    expect(screen.getByText('Anime 2')).toBeInTheDocument();
    expect(screen.getByText('Anime 3')).toBeInTheDocument();
  });

  it('renders correct number of cards', () => {
    render(
      <BrowserRouter>
        <AnimeGrid anime={mockAnimeList} />
      </BrowserRouter>
    );
    
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(3);
  });

  it('renders empty state when no anime', () => {
    render(
      <BrowserRouter>
        <AnimeGrid anime={[]} />
      </BrowserRouter>
    );
    
    expect(screen.queryByText('Anime 1')).not.toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading is true', () => {
    render(
      <BrowserRouter>
        <AnimeGrid anime={[]} isLoading={true} />
      </BrowserRouter>
    );
    
    // Check for skeleton elements
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders loading skeleton with skeletonCount', () => {
    render(
      <BrowserRouter>
        <AnimeGrid anime={[]} isLoading={true} skeletonCount={6} />
      </BrowserRouter>
    );
    
    // 6 skeleton cards should be rendered
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(6);
  });

  it('renders single anime', () => {
    render(
      <BrowserRouter>
        <AnimeGrid anime={[mockAnimeList[0]]} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Anime 1')).toBeInTheDocument();
    expect(screen.queryByText('Anime 2')).not.toBeInTheDocument();
  });

  it('renders anime without rating', () => {
    const noRatingAnime = [{ ...mockAnimeList[0], rating: null }];
    render(
      <BrowserRouter>
        <AnimeGrid anime={noRatingAnime} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Anime 1')).toBeInTheDocument();
  });

  it('renders anime without poster', () => {
    const noPosterAnime = [{ ...mockAnimeList[0], poster: null }];
    render(
      <BrowserRouter>
        <AnimeGrid anime={noPosterAnime} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Anime 1')).toBeInTheDocument();
  });
});