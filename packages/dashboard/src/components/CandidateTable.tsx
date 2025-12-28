import type { CandidateEvaluation } from "@xray/sdk";

interface CandidateTableProps {
  evaluations: CandidateEvaluation[];
}

export function CandidateTable({ evaluations }: CandidateTableProps) {
  const passedCount = evaluations.filter((e) => e.qualified).length;
  const failedCount = evaluations.length - passedCount;

  return (
    <div className="overflow-x-auto">
      <div className="mb-2 text-sm text-gray-600">
        <span className="font-medium text-green-700">{passedCount} passed</span>
        {" / "}
        <span className="font-medium text-red-700">{failedCount} failed</span>
      </div>
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Candidate
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Metrics
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Filter Results
            </th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {evaluations.map((evaluation) => (
            <tr
              key={evaluation.id}
              className={evaluation.qualified ? "bg-green-50" : "bg-red-50"}
            >
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {evaluation.label}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {evaluation.metrics ? (
                  <div className="space-y-1">
                    {Object.entries(evaluation.metrics).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="space-y-1">
                  {Object.entries(evaluation.results).map(([filterName, result]) => {
                    const filterResult = result as { passed: boolean; detail: string };
                    return (
                      <div key={filterName} className="flex items-center gap-2">
                        {filterResult.passed ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                        <span className="font-medium">{filterName}:</span>
                        <span className="text-gray-600">{filterResult.detail}</span>
                      </div>
                    );
                  })}
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                {evaluation.qualified ? (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                    PASSED
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                    FAILED
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

