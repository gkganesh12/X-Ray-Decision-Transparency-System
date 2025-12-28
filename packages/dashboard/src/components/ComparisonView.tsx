import type { ExecutionComparison } from "../utils/comparison";

interface ComparisonViewProps {
  comparison: ExecutionComparison;
}

export function ComparisonView({ comparison }: ComparisonViewProps) {
  const { execution1, execution2, stepDifferences, filterDifferences, selectionDifferences } =
    comparison;

  return (
    <div className="space-y-6">
      {/* Execution Headers */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {execution1.name}
          </h3>
          <p className="text-sm text-gray-500">ID: {execution1.id}</p>
          <p className="text-sm text-gray-500">
            Started: {new Date(execution1.startedAt).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">Steps: {execution1.steps.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {execution2.name}
          </h3>
          <p className="text-sm text-gray-500">ID: {execution2.id}</p>
          <p className="text-sm text-gray-500">
            Started: {new Date(execution2.startedAt).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">Steps: {execution2.steps.length}</p>
        </div>
      </div>

      {/* Step Differences */}
      {stepDifferences.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Step Differences</h3>
          <div className="space-y-4">
            {stepDifferences.map((diff, idx) => (
              <div key={idx} className="border-l-4 border-yellow-400 pl-4">
                <h4 className="font-medium text-gray-900">{diff.stepName}</h4>
                <div className="mt-2 space-y-1">
                  {diff.differences.map((d, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-medium">{d.field}:</span>
                      <span className="ml-2 text-red-600">{JSON.stringify(d.left)}</span>
                      <span className="mx-2">→</span>
                      <span className="text-green-600">{JSON.stringify(d.right)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Differences */}
      {filterDifferences.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Differences</h3>
          <div className="space-y-4">
            {filterDifferences.map((diff, idx) => (
              <div key={idx} className="border-l-4 border-blue-400 pl-4">
                <h4 className="font-medium text-gray-900">{diff.stepName}</h4>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Execution 1:</p>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                      {JSON.stringify(diff.filters1, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Execution 2:</p>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                      {JSON.stringify(diff.filters2, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selection Differences */}
      {selectionDifferences.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Selection Differences</h3>
          <div className="space-y-4">
            {selectionDifferences.map((diff, idx) => (
              <div key={idx} className="border-l-4 border-purple-400 pl-4">
                <h4 className="font-medium text-gray-900">{diff.stepName}</h4>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Execution 1:</p>
                    {diff.selection1 ? (
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-sm">
                          <span className="font-medium">ID:</span> {diff.selection1.id}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Reason:</span> {diff.selection1.reason}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No selection</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Execution 2:</p>
                    {diff.selection2 ? (
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-sm">
                          <span className="font-medium">ID:</span> {diff.selection2.id}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Reason:</span> {diff.selection2.reason}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No selection</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Differences */}
      {stepDifferences.length === 0 &&
        filterDifferences.length === 0 &&
        selectionDifferences.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <p className="text-green-800 font-medium">No differences found</p>
            <p className="text-sm text-green-600 mt-1">
              These executions are identical in their decision-making process.
            </p>
          </div>
        )}
    </div>
  );
}

