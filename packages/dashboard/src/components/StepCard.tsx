import { useState } from "react";
import type { XRayStep } from "@xray/sdk";
import { CandidateTable } from "./CandidateTable";
import { FilterBadge } from "./FilterBadge";

interface StepCardProps {
  step: XRayStep;
  index: number;
}

export function StepCard({ step, index }: StepCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        data-testid="step-card"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-semibold">
            {index + 1}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{step.name}</h3>
            <p className="text-sm text-gray-500">
              {new Date(step.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {step.selection && (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
              Selected
            </span>
          )}
          {step.evaluations && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
              {step.evaluations.filter((e) => e.qualified).length} / {step.evaluations.length} passed
            </span>
          )}
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expanded ? "transform rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          {step.reasoning && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Reasoning</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{step.reasoning}</p>
            </div>
          )}

          {step.input && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Input</h4>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                {JSON.stringify(step.input, null, 2)}
              </pre>
            </div>
          )}

          {step.filters && Object.keys(step.filters).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Filters Applied</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(step.filters).map(([key, value]) => (
                  <FilterBadge key={key} name={key} value={value} />
                ))}
              </div>
            </div>
          )}

          {step.evaluations && step.evaluations.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Candidate Evaluations ({step.evaluations.length})
              </h4>
              <CandidateTable evaluations={step.evaluations} />
            </div>
          )}

          {step.selection && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Selection</h4>
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-sm font-medium text-green-900">
                  ID: {step.selection.id}
                </p>
                {step.selection.reason && (
                  <p className="text-sm text-green-700 mt-1">{step.selection.reason}</p>
                )}
              </div>
            </div>
          )}

          {step.output && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Output</h4>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                {JSON.stringify(step.output, null, 2)}
              </pre>
            </div>
          )}

          {step.metadata && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Metadata</h4>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                {JSON.stringify(step.metadata, null, 2)}
              </pre>
            </div>
          )}

          {!step.reasoning && 
           !step.input && 
           (!step.filters || Object.keys(step.filters).length === 0) &&
           (!step.evaluations || step.evaluations.length === 0) &&
           !step.selection &&
           !step.output &&
           !step.metadata && (
            <div className="text-sm text-gray-500 italic">
              No additional details available for this step.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

