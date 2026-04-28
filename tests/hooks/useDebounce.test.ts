import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('returns debounced value after delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial');

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('resets timer when value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated1', delay: 500 });
    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    rerender({ value: 'updated2', delay: 500 });
    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current).toBe('initial');

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe('updated2');
  });

  it('uses custom delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 1000 } }
    );

    rerender({ value: 'updated', delay: 1000 });
    
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('initial');

    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });

  it('handles numbers', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 500 } }
    );

    expect(result.current).toBe(0);

    rerender({ value: 42, delay: 500 });
    
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe(42);
  });

  it('handles objects', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: { id: 1 }, delay: 500 } }
    );

    expect(result.current).toEqual({ id: 1 });

    rerender({ value: { id: 2 }, delay: 500 });
    
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toEqual({ id: 2 });
  });
});