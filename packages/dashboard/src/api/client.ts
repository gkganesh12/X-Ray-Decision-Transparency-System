import axios from "axios";
import type { XRayExecution, XRayStep } from "@xray/sdk";
import { retry } from "./retry";

// Remove trailing slash to prevent double slashes when axios appends paths
const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");
const REQUEST_TIMEOUT = 30000; // 30 seconds

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("xray_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("xray_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export interface PaginatedResponse<T> {
  executions: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Helper to wrap API calls with retry logic
async function apiCall<T>(fn: () => Promise<T>): Promise<T> {
  return retry(fn, {
    maxAttempts: 3,
    initialDelay: 1000,
  });
}

export const api = {
  async getExecutions(
    page?: number,
    limit?: number,
    filters?: {
      status?: "all" | "completed" | "in_progress";
      tags?: string[];
      startDate?: number;
      endDate?: number;
      minSteps?: number;
      maxSteps?: number;
      search?: string;
    }
  ): Promise<PaginatedResponse<XRayExecution>> {
    const params: any = {};
    if (page !== undefined) params.page = page;
    if (limit !== undefined) params.limit = limit;
    if (filters) {
      if (filters.status) params.status = filters.status;
      if (filters.tags && filters.tags.length > 0) params.tags = filters.tags.join(",");
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.minSteps !== undefined) params.minSteps = filters.minSteps;
      if (filters.maxSteps !== undefined) params.maxSteps = filters.maxSteps;
      if (filters.search) params.search = filters.search;
    }

    return apiCall(async () => {
      const response = await client.get<PaginatedResponse<XRayExecution>>("/api/executions", {
        params,
      });
      return response.data;
    });
  },

  async getExecution(id: string): Promise<XRayExecution> {
    return apiCall(async () => {
      const response = await client.get<XRayExecution>(`/api/executions/${id}`);
      return response.data;
    });
  },

  async getSteps(executionId: string): Promise<{ steps: XRayStep[] }> {
    return apiCall(async () => {
      const response = await client.get<{ steps: XRayStep[] }>(
        `/api/executions/${executionId}/steps`
      );
      return response.data;
    });
  },

  async updateExecutionMetadata(
    id: string,
    metadata: { tags?: string[]; notes?: string }
  ): Promise<XRayExecution> {
    return apiCall(async () => {
      const response = await client.patch<XRayExecution>(`/api/executions/${id}`, metadata);
      return response.data;
    });
  },

  async bulkDeleteExecutions(ids: string[]): Promise<{ deleted: number; ids: string[] }> {
    return apiCall(async () => {
      const response = await client.delete<{ deleted: number; ids: string[] }>("/api/executions", {
        data: { ids },
      });
      return response.data;
    });
  },

  async runDemo(count: number = 3): Promise<{ success: boolean; executionIds: string[]; message: string }> {
    return apiCall(async () => {
      const response = await client.post<{ success: boolean; executionIds: string[]; message: string }>(
        "/api/demo/run",
        { count }
      );
      return response.data;
    });
  },
};

