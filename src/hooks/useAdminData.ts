import { useState, useEffect } from 'react';

/**
 * Custom hook for loading data in admin pages
 * Ensures proper loading state management
 */
export function useAdminData<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn();
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, dependencies);

  return { data, loading, error, setData };
}

/**
 * Custom hook for loading multiple data sources in admin pages
 * Ensures all data loads before clearing loading state
 */
export function useAdminMultiData(
  fetchFns: Array<() => Promise<any>>,
  dependencies: any[] = []
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all(fetchFns.map(fn => fn()));
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          console.error('Error loading admin data:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAllData();

    return () => {
      mounted = false;
    };
  }, dependencies);

  return { loading, error };
}
