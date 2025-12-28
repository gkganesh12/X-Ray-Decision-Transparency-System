import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useExecution } from "../hooks/useExecutions";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useToastContext } from "../context/ToastContext";
import { StepCard } from "../components/StepCard";
import { ExecutionSummary } from "../components/ExecutionSummary";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { CardSkeleton } from "../components/CardSkeleton";
import { exportExecutionAsJSON, exportExecutionAsCSV } from "../utils/export";
import { SHORTCUTS } from "../utils/shortcuts";
import { api } from "../api/client";
import type { XRayStep } from "@xray/sdk";

export function ExecutionDetail() {
  const { id } = useParams<{ id: string }>();
  const { execution, loading, error } = useExecution(id || null);
  const { success, error: showError } = useToastContext();
  const [editingTags, setEditingTags] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [steps, setSteps] = useState<XRayStep[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(false);

  // Update local state when execution changes
  useEffect(() => {
    if (execution) {
      setTags(execution.tags || []);
      setNotes(execution.notes || "");
    }
  }, [execution]);

  // Fetch full step details
  useEffect(() => {
    if (!id || !execution) return;

    async function fetchSteps() {
      try {
        setLoadingSteps(true);
        const stepData = await api.getSteps(id);
        setSteps(stepData.steps || []);
      } catch (err) {
        console.error("Failed to fetch steps:", err);
        // Fallback to execution.steps if available (may be summaries)
        setSteps(execution.steps || []);
      } finally {
        setLoadingSteps(false);
      }
    }

    fetchSteps();
  }, [id, execution]);

  // Keyboard shortcuts - must be called before any early returns
  useKeyboardShortcuts([
    {
      key: SHORTCUTS.EXPORT.key,
      ctrl: SHORTCUTS.EXPORT.ctrl,
      action: () => {
        if (execution) {
          exportExecutionAsJSON(execution);
        }
      },
    },
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <CardSkeleton />
          <div className="mt-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error || !execution) {
    return (
      <div className="flex items-center justify-center h-screen px-4">
        <EmptyState
          title="Execution Not Found"
          message={error ? error.message : "The requested execution could not be found."}
          action={{
            label: "Back to List",
            onClick: () => {
              window.location.href = "/";
            },
          }}
        />
      </div>
    );
  }

  const duration = execution.completedAt
    ? execution.completedAt - execution.startedAt
    : Date.now() - execution.startedAt;

  const handleSaveMetadata = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await api.updateExecutionMetadata(id, { tags, notes });
      setEditingTags(false);
      setEditingNotes(false);
      success("Metadata saved successfully");
      // Refetch to get updated data
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error("Failed to save metadata:", error);
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.message || 
                          "Failed to save metadata";
      showError(`Failed to save metadata: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          {/* Breadcrumb */}
          <nav className="mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <Link to="/" className="hover:text-gray-900">
                  Executions
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-900 font-medium">{execution.name}</li>
            </ol>
          </nav>

          <div className="flex items-center justify-between mb-4">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-900 inline-block"
            >
              ← Back to Executions
            </Link>
            <div className="flex gap-2">
              <button
                onClick={() => exportExecutionAsJSON(execution)}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
              >
                Export JSON
              </button>
              <button
                onClick={() => exportExecutionAsCSV(execution)}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
              >
                Export CSV
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{execution.name}</h1>
                <p className="text-sm text-gray-500 mt-1">ID: {execution.id}</p>
              </div>
              {execution.completedAt ? (
                <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded">
                  Completed
                </span>
              ) : (
                <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded">
                  In Progress
                </span>
              )}
            </div>

            {/* Summary Cards */}
            <ExecutionSummary execution={execution} />

            {/* Tags */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Tags</p>
                {!editingTags && (
                  <button
                    onClick={() => setEditingTags(true)}
                    className="text-xs text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                )}
              </div>
              {editingTags ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={tags.join(", ")}
                    onChange={(e) =>
                      setTags(
                        e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean)
                      )
                    }
                    placeholder="Enter tags separated by commas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveMetadata}
                      disabled={saving}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingTags(false);
                        setTags(execution.tags || []);
                      }}
                      className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.length > 0 ? (
                    tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No tags</span>
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Notes</p>
                {!editingNotes && (
                  <button
                    onClick={() => setEditingNotes(true)}
                    className="text-xs text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                )}
              </div>
              {editingNotes ? (
                <div className="space-y-2">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this execution..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveMetadata}
                      disabled={saving}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingNotes(false);
                        setNotes(execution.notes || "");
                      }}
                      className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {notes || <span className="text-gray-400">No notes</span>}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Step Timeline</h2>
          {loadingSteps ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : steps.length === 0 ? (
            <EmptyState
              title="No Steps Recorded"
              message="This execution doesn't have any steps yet."
            />
          ) : (
            <div>
              {steps.map((step, index) => (
                <StepCard key={step.id} step={step} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
