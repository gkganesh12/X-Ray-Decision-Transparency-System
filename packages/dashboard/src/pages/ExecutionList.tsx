import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useExecutions } from "../hooks/useExecutions";
import { useExecutionContext } from "../context/ExecutionContext";
import { useSelection } from "../hooks/useSelection";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useAuth } from "../auth/AuthContext";
import { useOffline } from "../hooks/useOffline";
import { useToastContext } from "../context/ToastContext";
import { useDebounce } from "../hooks/useDebounce";
import { WebSocketStatus } from "../components/WebSocketStatus";
import { KeyboardShortcutsModal } from "../components/KeyboardShortcutsModal";
import { TableSkeleton } from "../components/LoadingSkeleton";
import { SearchBar } from "../components/SearchBar";
import { FilterDropdown } from "../components/FilterDropdown";
import { BulkActions } from "../components/BulkActions";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { exportExecutionsAsJSON, exportExecutionsAsCSV } from "../utils/export";
import { SHORTCUTS } from "../utils/shortcuts";
import { api } from "../api/client";
import type { XRayExecution } from "@xray/sdk";

export function ExecutionList() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "in_progress">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const { lastMessage, isConnected, isReconnecting } = useExecutionContext();
  const isOffline = useOffline();
  const { warning } = useToastContext();

  // Show offline warning
  useEffect(() => {
    if (isOffline) {
      warning("You are currently offline. Some features may not work.");
    }
  }, [isOffline, warning]);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Build filter object for API (use debounced search term)
  const apiFilters = useMemo(() => ({
    status: statusFilter === "all" ? undefined : statusFilter,
    ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
  }), [statusFilter, debouncedSearchTerm]);

  const { executions, loading, error, refetch, pagination } = useExecutions(currentPage, pageSize, apiFilters);
  const selection = useSelection(executions);

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage) {
      if (
        lastMessage.type === "execution_created" ||
        lastMessage.type === "execution_updated"
      ) {
        // Refetch executions when new/updated execution is received
        refetch();
      }
    }
  }, [lastMessage, refetch]);

  // Keyboard shortcuts
  useKeyboardShortcuts(
    [
    {
      key: SHORTCUTS.SEARCH.key,
      action: () => {
        searchInputRef.current?.focus();
      },
    },
    {
      key: SHORTCUTS.EXPORT.key,
      ctrl: SHORTCUTS.EXPORT.ctrl,
      action: () => {
        if (executions.length > 0) {
          exportExecutionsAsJSON(executions);
        }
      },
    },
    {
      key: SHORTCUTS.REFRESH.key,
      ctrl: SHORTCUTS.REFRESH.ctrl,
      action: () => {
        refetch();
      },
    },
    {
      key: SHORTCUTS.FILTERS.key,
      action: () => {
        setShowFilters(!showFilters);
      },
    },
    {
      key: SHORTCUTS.ANALYTICS.key,
      ctrl: SHORTCUTS.ANALYTICS.ctrl,
      action: () => {
        navigate("/analytics");
      },
    },
    {
      key: SHORTCUTS.COMPARE.key,
      ctrl: SHORTCUTS.COMPARE.ctrl,
      action: () => {
        navigate("/compare");
      },
    },
  ],
    { onShowShortcuts: () => setShowShortcutsModal(true) }
  );

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await api.bulkDeleteExecutions(ids);
      refetch();
    } catch (error) {
      throw error;
    }
  };

  const filteredExecutions = useMemo(() => {
    return executions.filter((exec: XRayExecution) => {
      // Search filter
      const matchesSearch =
        exec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exec.id.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && exec.completedAt) ||
        (statusFilter === "in_progress" && !exec.completedAt);

      return matchesSearch && matchesStatus;
    });
  }, [executions, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <TableSkeleton rows={10} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen px-4">
        <EmptyState
          title="Error Loading Executions"
          message={error.message}
          action={{
            label: "Retry",
            onClick: refetch,
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">X-Ray Executions</h1>
              <p className="mt-2 text-gray-600">
                View and debug decision transparency data
              </p>
            </div>
            <div className="flex items-center gap-3">
              <WebSocketStatus isConnected={isConnected} isReconnecting={isReconnecting} />
              <span className="text-sm text-gray-600">
                Logged in as: <strong>{user?.username}</strong>
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
              >
                Logout
              </button>
              <Link
                to="/analytics"
                className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors text-sm"
              >
                Analytics
              </Link>
              <Link
                to="/compare"
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm"
              >
                Compare
              </Link>
              <button
                onClick={() => exportExecutionsAsJSON(filteredExecutions)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                disabled={filteredExecutions.length === 0}
              >
                Export JSON
              </button>
              <button
                onClick={() => exportExecutionsAsCSV(filteredExecutions)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                disabled={filteredExecutions.length === 0}
              >
                Export CSV
              </button>
              <button
                onClick={refetch}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar
                ref={searchInputRef}
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by name or ID... (Press / to focus)"
              />
            </div>
            <FilterDropdown
              label="Status"
              value={statusFilter}
              options={[
                { value: "all", label: "All" },
                { value: "completed", label: "Completed" },
                { value: "in_progress", label: "In Progress" },
              ]}
              onChange={(value) => setStatusFilter(value as "all" | "completed" | "in_progress")}
            />
          </div>

          {searchTerm || statusFilter !== "all" ? (
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredExecutions.length} of {executions.length} executions
            </div>
          ) : null}
        </div>

        {filteredExecutions.length === 0 ? (
          <EmptyState
            title="No Executions Found"
            message="Run the demo app to generate execution data or adjust your filter criteria."
            action={{
              label: "Run Demo",
              onClick: () => {
                window.open("https://github.com/your-repo#running-the-demo", "_blank");
              },
            }}
          />
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-12">
                      <input
                        type="checkbox"
                        checked={selection.selectedCount === executions.length && executions.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            selection.selectAll();
                          } else {
                            selection.clearSelection();
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Started
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Steps
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {executions.map((execution) => (
                    <tr key={execution.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selection.isSelected(execution.id)}
                          onChange={() => selection.toggle(execution.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {execution.name}
                        </div>
                        <div className="text-sm text-gray-500">{execution.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(execution.startedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {execution.steps.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {execution.completedAt ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            Completed
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                            In Progress
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/executions/${execution.id}`}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <BulkActions
              selected={selection.selected}
              executions={executions}
              onClearSelection={selection.clearSelection}
              onDelete={handleBulkDelete}
            />
          </>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, pagination.total)} of {pagination.total} executions
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  );
}

