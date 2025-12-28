/**
 * Summary card component for execution overview
 */
import type { XRayExecution } from "@xray/sdk";

interface ExecutionSummaryProps {
  execution: XRayExecution;
}

export function ExecutionSummary({ execution }: ExecutionSummaryProps) {
  const duration = execution.completedAt
    ? execution.completedAt - execution.startedAt
    : Date.now() - execution.startedAt;

  const completedSteps = execution.steps.filter((s) => s.selection || s.evaluations);
  const avgStepDuration = execution.steps.length > 0
    ? duration / execution.steps.length
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm text-gray-600">Status</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">
          {execution.completedAt ? (
            <span className="text-green-600">Completed</span>
          ) : (
            <span className="text-yellow-600">In Progress</span>
          )}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm text-gray-600">Duration</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">
          {duration}ms
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm text-gray-600">Steps</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">
          {execution.steps.length}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm text-gray-600">Avg Step Time</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">
          {Math.round(avgStepDuration)}ms
        </p>
      </div>
    </div>
  );
}

