/**
 * Analytics calculations
 */
import type { XRayExecution } from "@xray/sdk";

export interface ExecutionTrend {
  date: string;
  count: number;
  avgDuration: number;
  successRate: number;
}

export interface StepPerformance {
  stepName: string;
  avgDuration: number;
  count: number;
  successRate: number;
}

export interface FilterEffectiveness {
  filterName: string;
  usageCount: number;
  passRate: number;
}

/**
 * Calculate execution trends over time
 */
export function calculateExecutionTrends(
  executions: XRayExecution[]
): ExecutionTrend[] {
  if (!executions || !Array.isArray(executions)) return [];
  
  const trends = new Map<string, { count: number; durations: number[]; completed: number }>();

  executions.forEach((exec) => {
    const date = new Date(exec.startedAt).toISOString().split("T")[0];
    const existing = trends.get(date) || { count: 0, durations: [], completed: 0 };

    existing.count++;
    if (exec.completedAt) {
      existing.durations.push(exec.completedAt - exec.startedAt);
      existing.completed++;
    }

    trends.set(date, existing);
  });

  return Array.from(trends.entries())
    .map(([date, data]) => ({
      date,
      count: data.count,
      avgDuration:
        data.durations.length > 0
          ? data.durations.reduce((a, b) => a + b, 0) / data.durations.length
          : 0,
      successRate: data.count > 0 ? data.completed / data.count : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate step performance metrics
 */
export function calculateStepPerformance(
  executions: XRayExecution[]
): StepPerformance[] {
  if (!executions || !Array.isArray(executions)) return [];
  
  const stepData = new Map<
    string,
    { durations: number[]; count: number; successCount: number }
  >();

  executions.forEach((exec) => {
    if (!exec.steps || !Array.isArray(exec.steps)) return;
    exec.steps.forEach((step) => {
      const existing = stepData.get(step.name) || {
        durations: [],
        count: 0,
        successCount: 0,
      };

      existing.count++;
      if (step.selection || (step.evaluations && step.evaluations.length > 0)) {
        existing.successCount++;
      }

      stepData.set(step.name, existing);
    });
  });

  return Array.from(stepData.entries())
    .map(([stepName, data]) => ({
      stepName,
      avgDuration: 0, // Would need step timing data
      count: data.count,
      successRate: data.count > 0 ? data.successCount / data.count : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculate filter effectiveness
 */
export function calculateFilterEffectiveness(
  executions: XRayExecution[]
): FilterEffectiveness[] {
  if (!executions || !Array.isArray(executions)) return [];
  
  const filterData = new Map<string, { usageCount: number; passCount: number }>();

  executions.forEach((exec) => {
    if (!exec.steps || !Array.isArray(exec.steps)) return;
    exec.steps.forEach((step) => {
      if (step.filters) {
        Object.keys(step.filters).forEach((filterName) => {
          const existing = filterData.get(filterName) || {
            usageCount: 0,
            passCount: 0,
          };

          existing.usageCount++;
          if (step.evaluations) {
            const passed = step.evaluations.filter((e) => e.qualified).length;
            existing.passCount += passed;
          }

          filterData.set(filterName, existing);
        });
      }
    });
  });

  return Array.from(filterData.entries())
    .map(([filterName, data]) => ({
      filterName,
      usageCount: data.usageCount,
      passRate: data.usageCount > 0 ? data.passCount / data.usageCount : 0,
    }))
    .sort((a, b) => b.usageCount - a.usageCount);
}

/**
 * Detect anomalies in executions
 */
export function detectAnomalies(executions: XRayExecution[]): XRayExecution[] {
  if (!executions || !Array.isArray(executions) || executions.length === 0) return [];

  // Calculate average duration
  const completed = executions.filter((e) => e.completedAt);
  if (completed.length === 0) return [];

  const avgDuration =
    completed.reduce((sum, e) => sum + (e.completedAt! - e.startedAt), 0) /
    completed.length;

  const stdDev = Math.sqrt(
    completed.reduce(
      (sum, e) => sum + Math.pow(e.completedAt! - e.startedAt - avgDuration, 2),
      0
    ) / completed.length
  );

  // Find executions with unusual duration (more than 2 standard deviations)
  return executions.filter((exec) => {
    if (!exec.completedAt) return false;
    const duration = exec.completedAt - exec.startedAt;
    return Math.abs(duration - avgDuration) > 2 * stdDev;
  });
}

