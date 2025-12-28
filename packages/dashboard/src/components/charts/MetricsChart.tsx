/**
 * Metrics visualization chart
 */
import type { XRayExecution } from "@xray/sdk";

interface MetricsChartProps {
  executions: XRayExecution[];
}

export function MetricsChart({ executions }: MetricsChartProps) {
  if (!executions || !Array.isArray(executions)) {
    return (
      <div className="p-8 text-center text-gray-500">
        No metrics data available
      </div>
    );
  }

  const completed = executions.filter((e) => e.completedAt);
  const inProgress = executions.filter((e) => !e.completedAt);

  const avgDuration = completed.length > 0
    ? completed.reduce((sum, e) => sum + ((e.completedAt || 0) - e.startedAt), 0) / completed.length
    : 0;

  const avgSteps = executions.length > 0
    ? executions.reduce((sum, e) => sum + e.steps.length, 0) / executions.length
    : 0;

  const data = [
    {
      name: "Metrics",
      "Completed Executions": completed.length,
      "In Progress": inProgress.length,
      "Avg Duration (ms)": Math.round(avgDuration),
      "Avg Steps": Math.round(avgSteps * 10) / 10,
    },
  ];

  const maxValue = Math.max(
    data[0]["Completed Executions"],
    data[0]["In Progress"],
    data[0]["Avg Duration (ms)"],
    data[0]["Avg Steps"]
  );

  return (
    <div className="w-full h-64 p-4">
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Completed Executions</span>
            <span className="font-semibold">{data[0]["Completed Executions"]}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full"
              style={{ width: `${(data[0]["Completed Executions"] / maxValue) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>In Progress</span>
            <span className="font-semibold">{data[0]["In Progress"]}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-yellow-500 h-4 rounded-full"
              style={{ width: `${(data[0]["In Progress"] / maxValue) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Avg Duration (ms)</span>
            <span className="font-semibold">{data[0]["Avg Duration (ms)"]}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-500 h-4 rounded-full"
              style={{ width: `${(data[0]["Avg Duration (ms)"] / maxValue) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Avg Steps</span>
            <span className="font-semibold">{data[0]["Avg Steps"]}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-purple-500 h-4 rounded-full"
              style={{ width: `${(data[0]["Avg Steps"] / maxValue) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

