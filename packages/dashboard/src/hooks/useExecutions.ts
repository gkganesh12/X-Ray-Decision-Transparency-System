import { useState, useEffect, useCallback } from "react";
import { api, type PaginatedResponse } from "../api/client";
import type { XRayExecution } from "@xray/sdk";

interface UseExecutionsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: "completed" | "in_progress";
  filters?: {
    status?: "all" | "completed" | "in_progress";
    tags?: string[];
    startDate?: number;
    endDate?: number;
    minSteps?: number;
    maxSteps?: number;
    search?: string;
  };
}

export function useExecutions(
  page: number = 1,
  limit: number = 20,
  filters?: UseExecutionsOptions["filters"]
) {
  const [executions, setExecutions] = useState<XRayExecution[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExecutions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getExecutions(page, limit, filters);
      setExecutions(data.executions);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch executions"));
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  return {
    executions,
    pagination,
    loading,
    error,
    refetch: fetchExecutions,
  };
}

export function useExecution(id: string | null) {
  const [execution, setExecution] = useState<XRayExecution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setExecution(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchExecution() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getExecution(id as string);
        if (!cancelled) {
          setExecution(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch execution"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchExecution();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { execution, loading, error };
}
