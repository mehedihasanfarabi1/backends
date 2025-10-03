import { useState, useEffect, useRef } from "react";

const cache = {}; // global cache

export default function useAjaxData   ({ key, apiFn, enabled = true }) {
  const [data, setData] = useState(cache[key] || null);
  const [isLoading, setIsLoading] = useState(!cache[key]);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => (isMounted.current = false);
  }, []);

  const fetchData = async () => {
    if (!enabled) return;
    if (cache[key]) {
      setData(cache[key]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = await apiFn();
      cache[key] = result;
      if (isMounted.current) {
        setData(result);
      }
    } catch (err) {
      if (isMounted.current) setError(err);
      console.error(err);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // Fetch only once on key or enabled change
  useEffect(() => {
    fetchData();
  }, [key, enabled]);

  // Refetch manually
  const refetch = async () => {
    cache[key] = null;
    await fetchData();
  };

  return { data, isLoading, error, refetch };
}
