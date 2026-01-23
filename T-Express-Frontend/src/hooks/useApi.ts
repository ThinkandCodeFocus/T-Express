/**
 * Hooks React personnalisés pour l'API
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiError } from '@/lib/api-client';

// ========== Hook générique pour les appels API ==========

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  immediate?: boolean;
}

export function useApi<T, P extends any[] = []>(
  apiFunction: (...args: P) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Utiliser useRef pour stocker les callbacks et éviter les re-renders
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const execute = useCallback(
    async (...args: P) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(...args);
        setData(result);
        optionsRef.current.onSuccess?.(result);
        return result;
      } catch (err: any) {
        const apiError: ApiError = {
          message: err.message || 'Une erreur est survenue',
          errors: err.errors,
          status: err.status,
        };
        setError(apiError);
        optionsRef.current.onError?.(apiError);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return {
    data,
    loading,
    error,
    execute,
    setData,
    setError,
  };
}

// ========== Hook pour les mutations (POST, PUT, DELETE) ==========

export function useMutation<T, P extends any[] = []>(
  apiFunction: (...args: P) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  return useApi(apiFunction, { ...options, immediate: false });
}

// ========== Hook pour les queries (GET) ==========

interface UseQueryOptions<T> extends UseApiOptions<T> {
  enabled?: boolean;
}

export function useQuery<T, P extends any[] = []>(
  apiFunction: (...args: P) => Promise<T>,
  args: P,
  options: UseQueryOptions<T> = {}
) {
  const { enabled = true, ...apiOptions } = options;
  const api = useApi(apiFunction, apiOptions);

  useEffect(() => {
    if (enabled) {
      api.execute(...args);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...args]);

  return api;
}

// ========== Hook pour la pagination ==========

interface UsePaginationOptions<T> {
  initialPage?: number;
  initialPerPage?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

export function usePagination<T>(
  apiFunction: (page: number, perPage: number) => Promise<T>,
  options: UsePaginationOptions<T> = {}
) {
  const { initialPage = 1, initialPerPage = 20, ...apiOptions } = options;
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);

  const api = useApi(apiFunction, apiOptions);

  const loadPage = useCallback(
    (newPage: number) => {
      setPage(newPage);
      return api.execute(newPage, perPage);
    },
    [api, perPage]
  );

  const nextPage = useCallback(() => {
    return loadPage(page + 1);
  }, [loadPage, page]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      return loadPage(page - 1);
    }
  }, [loadPage, page]);

  const changePerPage = useCallback(
    (newPerPage: number) => {
      setPerPage(newPerPage);
      setPage(1);
      return api.execute(1, newPerPage);
    },
    [api]
  );

  useEffect(() => {
    api.execute(page, perPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...api,
    page,
    perPage,
    loadPage,
    nextPage,
    prevPage,
    changePerPage,
  };
}

// ========== Hook pour le debouncing ==========

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ========== Hook pour le localStorage ==========

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// ========== Hook pour l'intersection observer (infinite scroll) ==========

export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): IntersectionObserverEntry | null {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const node = ref?.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry);
    }, options);

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return entry;
}
