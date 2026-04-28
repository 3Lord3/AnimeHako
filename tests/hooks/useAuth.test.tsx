import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useAuth, useUser } from '@/hooks/useAuth';
import * as apiModule from '@/lib/api';

// Mock the API module
vi.mock('@/lib/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
  userApi: {
    getProfile: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
};

// Helper to set localStorage mock values
const setLocalStorageMock = (storage: Record<string, string>) => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => storage[key] || null),
      setItem: vi.fn((key: string, value: string) => { storage[key] = value; }),
      removeItem: vi.fn((key: string) => { delete storage[key]; }),
      clear: vi.fn(() => { Object.keys(storage).forEach(k => delete storage[k]); }),
    },
    writable: true,
  });
};

describe('useAuth', () => {
  let storage: Record<string, string> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    storage = {};
    setLocalStorageMock(storage);
  });

  describe('login', () => {
    it('calls login API with correct credentials', async () => {
      const mockResponse = { token: 'test-token', user: { id: 1, email: 'test@test.com', username: 'testuser' } };
      vi.mocked(apiModule.authApi.login).mockResolvedValueOnce({ data: mockResponse });

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.login({ email: 'test@test.com', password: 'password123' });

      await waitFor(() => expect(result.current.isLoggingIn).toBe(false));
      expect(apiModule.authApi.login).toHaveBeenCalledWith('test@test.com', 'password123');
    });

    it('stores token in localStorage on successful login', async () => {
      const mockResponse = { token: 'test-token', user: { id: 1, email: 'test@test.com', username: 'testuser' } };
      vi.mocked(apiModule.authApi.login).mockResolvedValueOnce({ data: mockResponse });

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.login({ email: 'test@test.com', password: 'password123' });

      await waitFor(() => expect(result.current.isLoggingIn).toBe(false));
      expect(storage['token']).toBe('test-token');
      expect(storage['user']).toBeDefined();
    });

    it('sets error state on failed login', async () => {
      vi.mocked(apiModule.authApi.login).mockRejectedValueOnce(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.login({ email: 'test@test.com', password: 'wrong' });

      await waitFor(() => expect(result.current.loginError).toBeDefined());
    });
  });

  describe('register', () => {
    it('calls register API with correct data', async () => {
      const mockResponse = { token: 'test-token', user: { id: 1, email: 'test@test.com', username: 'testuser' } };
      vi.mocked(apiModule.authApi.register).mockResolvedValueOnce({ data: mockResponse });

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.register({ email: 'test@test.com', username: 'testuser', password: 'password123' });

      await waitFor(() => expect(result.current.isRegistering).toBe(false));
      expect(apiModule.authApi.register).toHaveBeenCalledWith('test@test.com', 'testuser', 'password123');
    });

    it('stores token in localStorage on successful register', async () => {
      const mockResponse = { token: 'test-token', user: { id: 1, email: 'test@test.com', username: 'testuser' } };
      vi.mocked(apiModule.authApi.register).mockResolvedValueOnce({ data: mockResponse });

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.register({ email: 'test@test.com', username: 'testuser', password: 'password123' });

      await waitFor(() => expect(result.current.isRegistering).toBe(false));
      expect(storage['token']).toBe('test-token');
      expect(storage['user']).toBeDefined();
    });
  });

  describe('logout', () => {
    it('clears localStorage on logout', () => {
      storage['token'] = 'test-token';
      storage['user'] = JSON.stringify({ id: 1 });

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.logout();

      expect(storage['token']).toBeUndefined();
      expect(storage['user']).toBeUndefined();
    });
  });
});

describe('useUser', () => {
  let storage: Record<string, string> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    storage = {};
    setLocalStorageMock(storage);
  });

  it('returns null when no token in localStorage', async () => {
    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('returns user from localStorage when available', async () => {
    const mockUser = { id: 1, email: 'test@test.com', username: 'testuser' };
    storage['token'] = 'test-token';
    storage['user'] = JSON.stringify(mockUser);

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockUser);
  });

  it('fetches profile when token exists but no user in localStorage', async () => {
    const mockUser = { id: 1, email: 'test@test.com', username: 'testuser' };
    storage['token'] = 'test-token';
    vi.mocked(apiModule.userApi.getProfile).mockResolvedValueOnce({ data: mockUser });

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockUser);
    expect(storage['user']).toBe(JSON.stringify(mockUser));
  });
});