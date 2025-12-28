/**
 * Step distribution chart showing step name frequency
 */
import type { XRayExecution } from "@xray/sdk";

interface StepDistributionProps {
  executions: XRayExecution[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function StepDistribution({ executions }: StepDistributionProps) {
  const stepCounts = new Map<string, number>();

  if (!executions || !Array.isArray(executions)) {
    return (
      <div className="p-8 text-center text-gray-500">
        No step data available
      </div>
    );
  }

  executions.forEach((exec) => {
    if (!exec.steps || !Array.isArray(exec.steps)) return;
    exec.steps.forEach((step) => {
      stepCounts.set(step.name, (stepCounts.get(step.name) || 0) + 1);
    });
  });

  const data = Array.from(stepCounts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 steps

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No step data available
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full h-64 p-4">
      <div className="grid grid-cols-2 gap-4">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          return (
            <div key={item.name} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600">{item.value} ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

