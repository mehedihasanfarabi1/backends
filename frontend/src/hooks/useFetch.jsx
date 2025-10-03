// src/hooks/useFastData.jsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

/**
 * options:
 * - apiFn: async function to fetch data (Promise)
 * - enabledQuery: true/false → React Query use করবো কিনা
 */
export default function useFetch({ apiFn, enabledQuery = false }) {
  const [stateData, setStateData] = useState([]);
  const [loadingState, setLoadingState] = useState(true);
  const [errorState, setErrorState] = useState(null);

  // =====================
  // 1️⃣ State-based fetch
  // =====================
  const fetchStateData = async () => {
    setLoadingState(true);
    try {
      const data = await apiFn();
      setStateData(data);
      setErrorState(null);
    } catch (err) {
      setErrorState(err);
    } finally {
      setLoadingState(false);
    }
  };

  useEffect(() => {
    if (!enabledQuery) fetchStateData();
  }, [enabledQuery, apiFn]);

  // =========================
  // 2️⃣ React Query-based fetch
  // =========================
  const queryResult = useQuery(
    enabledQuery ? [apiFn.name] : [],
    enabledQuery
      ? async () => {
          const data = await apiFn();
          return data;
        }
      : null,
    {
      enabled: enabledQuery,
    }
  );

  return {
    data: enabledQuery ? queryResult.data || [] : stateData,
    loading: enabledQuery ? queryResult.isLoading : loadingState,
    error: enabledQuery ? queryResult.error : errorState,
    refetch: enabledQuery ? queryResult.refetch : fetchStateData,
  };
}
