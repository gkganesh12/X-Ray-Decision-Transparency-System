/**
 * Timeline chart showing execution distribution over time
 */
import type { XRayExecution } from "@xray/sdk";

interface ExecutionTimelineProps {
  executions: XRayExecution[];
}

export function ExecutionTimeline({ executions }: ExecutionTimelineProps) {
  // Group executions by date
  const dataMap = new Map<string, { date: string; count: number; completed: number }>();

  if (!executions || !Array.isArray(executions)) {
    return (
      <div className="p-8 text-center text-gray-500">
        No execution data available for timeline
      </div>
    );
  }

  executions.forEach((exec) => {
    const date = new Date(exec.startedAt).toLocaleDateString();
    const existing = dataMap.get(date) || { date, count: 0, completed: 0 };
    existing.count++;
    if (exec.completedAt) {
      existing.completed++;
    }
    dataMap.set(date, existing);
  });

  const data = Array.from(dataMap.values()).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No execution data available for timeline
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => Math.max(d.count, d.completed)), 1);

  return (
    <div className="w-full h-64 p-4">
      <div className="h-full flex flex-col">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <div className="w-24 text-xs text-gray-600">{item.date}</div>
            <div className="flex-1 flex gap-1">
              <div
                className="bg-blue-500 h-6 rounded"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
                title={`Total: ${item.count}`}
              />
              <div
                className="bg-green-500 h-6 rounded"
                style={{ width: `${(item.completed / maxCount) * 100}%` }}
                title={`Completed: ${item.completed}`}
              />
            </div>
            <div className="w-20 text-xs text-gray-600 text-right">
              {item.count} total, {item.completed} done
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Total Executions</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
}

