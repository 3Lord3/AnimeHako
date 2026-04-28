import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn (class name merger)', () => {
  it('merges two class names', () => {
    const result = cn('foo', 'bar');
    expect(result).toBe('foo bar');
  });

  it('merges multiple class names', () => {
    const result = cn('foo', 'bar', 'baz');
    expect(result).toBe('foo bar baz');
  });

  it('handles conditional classes', () => {
    const result = cn('foo', undefined, 'baz');
    expect(result).toBe('foo baz');
  });

  it('handles undefined values', () => {
    const result = cn('foo', undefined, 'bar');
    expect(result).toBe('foo bar');
  });

  it('handles null values', () => {
    const result = cn('foo', null, 'bar');
    expect(result).toBe('foo bar');
  });

  it('handles empty string', () => {
    const result = cn('', 'bar');
    expect(result).toBe('bar');
  });

  it('handles object with boolean values', () => {
    const result = cn('foo', { bar: true, baz: false });
    expect(result).toBe('foo bar');
  });

  it('handles mixed inputs', () => {
    const result = cn('foo', 'bar', { baz: true }, undefined);
    expect(result).toBe('foo bar baz');
  });
});