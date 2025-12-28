/**
 * Bulk actions component for selected executions
 */
import { useState } from "react";
import type { XRayExecution } from "@xray/sdk";
import { useToastContext } from "../context/ToastContext";
import { exportExecutionsAsJSON, exportExecutionsAsCSV } from "../utils/export";

interface BulkActionsProps {
  selected: Set<string>;
  executions: XRayExecution[];
  onClearSelection: () => void;
  onDelete?: (ids: string[]) => Promise<void>;
}

export function BulkActions({
  selected,
  executions,
  onClearSelection,
  onDelete,
}: BulkActionsProps) {
  const [deleting, setDeleting] = useState(false);
  const { success, error: showError } = useToastContext();

  if (selected.size === 0) {
    return null;
  }

  const selectedExecutions = executions.filter((e) => selected.has(e.id));

  const handleExportJSON = () => {
    exportExecutionsAsJSON(selectedExecutions);
  };

  const handleExportCSV = () => {
    exportExecutionsAsCSV(selectedExecutions);
  };

  const handleDelete = async () => {
    if (!onDelete || !confirm(`Delete ${selected.size} execution(s)?`)) {
      return;
    }

    setDeleting(true);
    try {
      await onDelete(Array.from(selected));
      onClearSelection();
      success(`Successfully deleted ${selected.size} execution(s)`);
    } catch (error) {
      showError(`Failed to delete: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-medium">
            {selected.size} execution{selected.size !== 1 ? "s" : ""} selected
          </span>
          <button
            onClick={onClearSelection}
            className="text-sm underline hover:no-underline"
          >
            Clear selection
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            Export JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            Export CSV
          </button>
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

