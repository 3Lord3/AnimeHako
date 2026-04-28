import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getImageUrl } from '@/lib/imageUrl';

describe('getImageUrl', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://127.0.0.1:8000');
  });

  it('returns full URL when input is already a full URL', () => {
    const fullUrl = 'http://example.com/image.jpg';
    const result = getImageUrl(fullUrl);
    expect(result).toBe(fullUrl);
  });

  it('returns full URL with https', () => {
    const fullUrl = 'https://example.com/image.jpg';
    const result = getImageUrl(fullUrl);
    expect(result).toBe(fullUrl);
  });

  it('prepends API URL for paths starting with /', () => {
    const relativePath = '/media/posters/123.jpg';
    const result = getImageUrl(relativePath);
    expect(result).toBe('http://127.0.0.1:8000/media/posters/123.jpg');
  });

  it('prepends API URL for paths starting with static/', () => {
    const path = 'static/screenshots/1_01.png';
    const result = getImageUrl(path);
    expect(result).toBe('http://127.0.0.1:8000static/screenshots/1_01.png');
  });

  it('returns empty string for null input', () => {
    const result = getImageUrl(null);
    expect(result).toBe('');
  });

  it('returns empty string for undefined input', () => {
    const result = getImageUrl(undefined);
    expect(result).toBe('');
  });

  it('returns empty string for empty string input', () => {
    const result = getImageUrl('');
    expect(result).toBe('');
  });

  it('prepends API URL for paths without leading slash', () => {
    const path = 'posters/123.jpg';
    const result = getImageUrl(path);
    expect(result).toBe('http://127.0.0.1:8000posters/123.jpg');
  });
});