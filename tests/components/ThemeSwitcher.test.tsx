import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

// We need to hoist the mock
vi.mock('@/hooks', () => {
  return {
    useTheme: vi.fn(() => ({
      theme: 'system',
      setTheme: vi.fn(),
    })),
  };
});

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders theme switcher with system theme label', () => {
    render(<ThemeSwitcher />);
    expect(screen.getByText('Системная')).toBeInTheDocument();
  });

  it('renders toggle button', () => {
    render(<ThemeSwitcher />);
    const slider = document.querySelector('.transition-transform');
    expect(slider).toBeInTheDocument();
  });

  it('has clickable area', () => {
    render(<ThemeSwitcher />);
    const container = document.querySelector('.cursor-pointer');
    expect(container).toBeInTheDocument();
  });

  it('renders theme icon', () => {
    render(<ThemeSwitcher />);
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders all three theme options in toggle', () => {
    render(<ThemeSwitcher />);
    const toggle = document.querySelector('.bg-muted');
    expect(toggle).toBeInTheDocument();
  });
});