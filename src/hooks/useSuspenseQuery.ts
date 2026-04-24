import { useQuery, useSuspenseQuery as useSuspenseQueryBase } from '@tanstack/react-query';

interface UseSuspenseQueryOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    refetchOnWindowFocus?: boolean;
  };
}

// Wrapper hook that provides Suspense integration
// Usage: const { data } = useSuspenseQuery({ queryKey: ['anime', id], queryFn: () => api.getAnime(id) })
export function useSuspenseQuery<T>({
  queryKey,
  queryFn,
  options,
}: UseSuspenseQueryOptions<T>) {
  return useSuspenseQueryBase({
    queryKey,
    queryFn,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes default
    gcTime: options?.gcTime ?? 10 * 60 * 1000, // 10 minutes default
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
}

// Alternative: wrapper around useQuery with isPending check
// This provides similar functionality to Suspense but without throwing promises
export function usePendingQuery<T>({
  queryKey,
  queryFn,
  options,
}: UseSuspenseQueryOptions<T>) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    gcTime: options?.gcTime ?? 10 * 60 * 1000,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    enabled: options?.enabled ?? true,
    placeholderData: options?.enabled === false ? undefined : (previousData) => previousData,
  });
}