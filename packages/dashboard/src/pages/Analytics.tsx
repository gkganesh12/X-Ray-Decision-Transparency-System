/**
 * Analytics page with visualizations
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { ExecutionTimeline } from "../components/charts/ExecutionTimeline";
import { MetricsChart } from "../components/charts/MetricsChart";
import { StepDistribution } from "../components/charts/StepDistribution";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import {
  calculateExecutionTrends,
  calculateStepPerformance,
  calculateFilterEffectiveness,
  detectAnomalies,
} from "../utils/analytics";
import type { XRayExecution } from "@xray/sdk";

export function Analytics() {
  const [executions, setExecutions] = useState<XRayExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Calculate analytics data
  const anomalies = executions.length > 0 ? detectAnomalies(executions) : [];
  const stepPerformance = executions.length > 0 ? calculateStepPerformance(executions) : [];
  const filterEffectiveness = executions.length > 0 ? calculateFilterEffectiveness(executions) : [];

  useEffect(() => {
    async function fetchAllExecutions() {
      try {
        setLoading(true);
        setError(null);
        // Fetch a large number of executions for analytics
        const data = await api.getExecutions(1, 1000);
        setExecutions(data?.executions || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch executions"));
        setExecutions([]); // Ensure executions is always an array
      } finally {
        setLoading(false);
      }
    }

    fetchAllExecutions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" message="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen px-4">
        <EmptyState
          title="Error Loading Analytics"
          message={error.message}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="mt-2 text-gray-600">
                Visual insights into execution patterns and metrics
              </p>
            </div>
            <Link
              to="/"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Back to Executions
            </Link>
          </div>
        </div>

        {anomalies.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              Anomalies Detected ({anomalies.length})
            </h3>
            <p className="text-sm text-yellow-700">
              {anomalies.length} execution{anomalies.length !== 1 ? "s have" : " has"} unusual patterns
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Step Performance</h3>
            <div className="space-y-3">
              {stepPerformance.slice(0, 5).map((step) => (
                <div key={step.stepName} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{step.stepName}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">{step.count} uses</span>
                    <span className="text-xs font-medium text-green-600">
                      {Math.round(step.successRate * 100)}% success
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Effectiveness</h3>
            <div className="space-y-3">
              {filterEffectiveness.slice(0, 5).map((filter) => (
                <div key={filter.filterName} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{filter.filterName}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">{filter.usageCount} uses</span>
                    <span className="text-xs font-medium text-blue-600">
                      {Math.round(filter.passRate * 100)}% pass rate
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Execution Timeline</h2>
            <ExecutionTimeline executions={executions} />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Metrics Overview</h2>
            <MetricsChart executions={executions} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Step Distribution</h2>
          <StepDistribution executions={executions} />
        </div>
      </div>
    </div>
  );
}

