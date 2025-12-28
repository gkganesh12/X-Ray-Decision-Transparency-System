/**
 * Advanced filtering component for executions
 */
import { useState } from "react";

export interface FilterState {
  dateRange: {
    start?: number;
    end?: number;
  };
  tags: string[];
  stepCountRange: {
    min?: number;
    max?: number;
  };
  durationRange: {
    min?: number;
    max?: number;
  };
  stepNameSearch?: string;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export function AdvancedFilters({
  filters,
  onChange,
  onReset,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
      >
        {isOpen ? "▼" : "▶"} Advanced Filters
      </button>

      {isOpen && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg space-y-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">Start Date</label>
                <input
                  type="date"
                  value={
                    filters.dateRange.start
                      ? new Date(filters.dateRange.start).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => {
                    const date = e.target.value
                      ? new Date(e.target.value).getTime()
                      : undefined;
                    updateFilter("dateRange", {
                      ...filters.dateRange,
                      start: date,
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">End Date</label>
                <input
                  type="date"
                  value={
                    filters.dateRange.end
                      ? new Date(filters.dateRange.end).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => {
                    const date = e.target.value
                      ? new Date(e.target.value).getTime()
                      : undefined;
                    updateFilter("dateRange", {
                      ...filters.dateRange,
                      end: date,
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={filters.tags.join(", ")}
              onChange={(e) => {
                const tags = e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean);
                updateFilter("tags", tags);
              }}
              placeholder="tag1, tag2, tag3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          {/* Step Count Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step Count Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">Min</label>
                <input
                  type="number"
                  value={filters.stepCountRange.min || ""}
                  onChange={(e) => {
                    const min = e.target.value ? parseInt(e.target.value) : undefined;
                    updateFilter("stepCountRange", {
                      ...filters.stepCountRange,
                      min,
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  min="0"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Max</label>
                <input
                  type="number"
                  value={filters.stepCountRange.max || ""}
                  onChange={(e) => {
                    const max = e.target.value ? parseInt(e.target.value) : undefined;
                    updateFilter("stepCountRange", {
                      ...filters.stepCountRange,
                      max,
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Duration Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration Range (ms)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">Min</label>
                <input
                  type="number"
                  value={filters.durationRange.min || ""}
                  onChange={(e) => {
                    const min = e.target.value ? parseInt(e.target.value) : undefined;
                    updateFilter("durationRange", {
                      ...filters.durationRange,
                      min,
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  min="0"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Max</label>
                <input
                  type="number"
                  value={filters.durationRange.max || ""}
                  onChange={(e) => {
                    const max = e.target.value ? parseInt(e.target.value) : undefined;
                    updateFilter("durationRange", {
                      ...filters.durationRange,
                      max,
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Step Name Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Step Name
            </label>
            <input
              type="text"
              value={filters.stepNameSearch || ""}
              onChange={(e) => updateFilter("stepNameSearch", e.target.value)}
              placeholder="Enter step name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          {/* Reset Button */}
          <div className="flex justify-end">
            <button
              onClick={onReset}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

