import { useState } from "react";
import { Link } from "react-router-dom";
import { useExecution } from "../hooks/useExecutions";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { ComparisonView } from "../components/ComparisonView";
import { compareExecutions } from "../utils/comparison";
import { SearchBar } from "../components/SearchBar";
import { api } from "../api/client";
import type { XRayExecution } from "@xray/sdk";

export function ExecutionComparison() {
  const [execId1, setExecId1] = useState<string>("");
  const [execId2, setExecId2] = useState<string>("");
  const [searchTerm1, setSearchTerm1] = useState("");
  const [searchTerm2, setSearchTerm2] = useState("");
  const [availableExecutions, setAvailableExecutions] = useState<XRayExecution[]>([]);
  const [loadingExecutions, setLoadingExecutions] = useState(false);

  const { execution: exec1, loading: loading1 } = useExecution(execId1 || null);
  const { execution: exec2, loading: loading2 } = useExecution(execId2 || null);

  const loadExecutions = async () => {
    setLoadingExecutions(true);
    try {
      const data = await api.getExecutions(1, 100);
      setAvailableExecutions(data.executions);
    } catch (error) {
      console.error("Failed to load executions:", error);
    } finally {
      setLoadingExecutions(false);
    }
  };

  const filteredExecutions1 = availableExecutions.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm1.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm1.toLowerCase())
  );

  const filteredExecutions2 = availableExecutions.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm2.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm2.toLowerCase())
  );

  const comparison =
    exec1 && exec2 ? compareExecutions(exec1, exec2) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-900 mb-4 inline-block"
          >
            ← Back to Executions
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Compare Executions</h1>
          <p className="mt-2 text-gray-600">
            Compare two executions side-by-side to see differences in decision-making
          </p>
        </div>

        {/* Execution Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Execution 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Execution 1
              </label>
              {availableExecutions.length === 0 ? (
                <button
                  onClick={loadExecutions}
                  disabled={loadingExecutions}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loadingExecutions ? "Loading..." : "Load Executions"}
                </button>
              ) : (
                <>
                  <SearchBar
                    value={searchTerm1}
                    onChange={setSearchTerm1}
                    placeholder="Search executions..."
                  />
                  <select
                    value={execId1}
                    onChange={(e) => setExecId1(e.target.value)}
                    className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select execution...</option>
                    {filteredExecutions1.map((exec) => (
                      <option key={exec.id} value={exec.id}>
                        {exec.name} ({exec.id})
                      </option>
                    ))}
                  </select>
                </>
              )}
              {loading1 && (
                <div className="mt-2">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>

            {/* Execution 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Execution 2
              </label>
              {availableExecutions.length === 0 ? (
                <button
                  onClick={loadExecutions}
                  disabled={loadingExecutions}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loadingExecutions ? "Loading..." : "Load Executions"}
                </button>
              ) : (
                <>
                  <SearchBar
                    value={searchTerm2}
                    onChange={setSearchTerm2}
                    placeholder="Search executions..."
                  />
                  <select
                    value={execId2}
                    onChange={(e) => setExecId2(e.target.value)}
                    className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select execution...</option>
                    {filteredExecutions2.map((exec) => (
                      <option key={exec.id} value={exec.id}>
                        {exec.name} ({exec.id})
                      </option>
                    ))}
                  </select>
                </>
              )}
              {loading2 && (
                <div className="mt-2">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comparison Results */}
        {comparison ? (
          <ComparisonView comparison={comparison} />
        ) : (
          <EmptyState
            title="Select Two Executions"
            message="Choose two executions from the dropdowns above to compare them."
          />
        )}
      </div>
    </div>
  );
}

