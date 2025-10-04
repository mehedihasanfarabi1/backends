// src/hooks/useFastData.jsx
import { useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Custom fast data hook
 * @param {Object} options
 * - key: unique query key
 * - apiFn: async fetch function
 * - enabled: boolean → run query or not
 * - staleTime: কতক্ষণ data fresh ধরা হবে (default: 5 min)
 */
export default function useFastData({ key, apiFn, enabled = true, staleTime = 1 }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: apiFn,
    enabled,
    staleTime, 
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: false, 
  });
  

  return {
    ...query,
    // extra helper → manually cache update করার জন্য
    setCacheData: (updater) =>
      queryClient.setQueryData(Array.isArray(key) ? key : [key], updater),
    invalidate: () =>
    queryClient.invalidateQueries(Array.isArray(key) ? key : [key]),
  };
}
