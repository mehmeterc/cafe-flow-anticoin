import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

/**
 * Custom hook for optimized data fetching with improved caching and request deduplication
 */
export function useOptimizedQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends unknown[] = unknown[]
>(
  queryKey: TQueryKey,
  queryFn: () => Promise<TQueryFnData>,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData, TError> & { isStale: boolean } {
  const [isStale, setIsStale] = useState(false);
  
  // Use the base React Query hook
  const queryResult = useQuery({
    queryKey,
    queryFn,
    ...options,
  });

  // Track when data becomes stale
  useEffect(() => {
    if (queryResult.isSuccess && !queryResult.isFetching) {
      // Set stale flag after data has loaded and after the staleTime has passed
      const staleTime = typeof options?.staleTime === 'function' ? 10 * 60 * 1000 : (options?.staleTime || 10 * 60 * 1000);
      
      const staleTimer = setTimeout(() => {
        setIsStale(true);
      }, staleTime); // Default to 10 minutes
      
      return () => clearTimeout(staleTimer);
    }
    
    if (queryResult.isFetching) {
      setIsStale(false);
    }
  }, [queryResult.isSuccess, queryResult.isFetching, options?.staleTime]);

  return {
    ...queryResult,
    isStale,
  };
}
