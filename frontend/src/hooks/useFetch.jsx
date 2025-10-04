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
export default function useFastData({ key, apiFn, enabled = true, staleTime = 1000 * 60 * 5 }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: apiFn,
    enabled,
    staleTime, // cache থেকে instant data দেবে ৫ মিনিট পর্যন্ত
    refetchOnWindowFocus: true, // window এলে refresh করবে
    refetchOnReconnect: true,
    refetchInterval: false, // চাইলে auto polling দিতে পারো
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
