/**
 * Execution comparison utility
 * Moved from dashboard to server for use in services
 */
import type { XRayExecution } from "@xray/sdk";

export interface StepDifference {
  stepName: string;
  differences: Array<{
    field: string;
    left: any;
    right: any;
  }>;
}

export interface FilterDifference {
  stepName: string;
  filters1: Record<string, any>;
  filters2: Record<string, any>;
}

export interface SelectionDifference {
  stepName: string;
  selection1?: { id: string; reason: string };
  selection2?: { id: string; reason: string };
}

export interface ExecutionComparison {
  execution1: XRayExecution;
  execution2: XRayExecution;
  stepDifferences: StepDifference[];
  filterDifferences: FilterDifference[];
  selectionDifferences: SelectionDifference[];
}

export function compareExecutions(
  execution1: XRayExecution,
  execution2: XRayExecution
): ExecutionComparison {
  const stepDifferences: StepDifference[] = [];
  const filterDifferences: FilterDifference[] = [];
  const selectionDifferences: SelectionDifference[] = [];

  // Compare steps by name
  const stepMap1 = new Map(execution1.steps.map((s) => [s.name, s]));
  const stepMap2 = new Map(execution2.steps.map((s) => [s.name, s]));

  const allStepNames = new Set([
    ...stepMap1.keys(),
    ...stepMap2.keys(),
  ]);

  for (const stepName of allStepNames) {
    const step1 = stepMap1.get(stepName);
    const step2 = stepMap2.get(stepName);

    if (!step1 || !step2) {
      continue; // Step exists in one but not the other
    }

    // Compare step fields
    const differences: Array<{ field: string; left: any; right: any }> = [];

    if (JSON.stringify(step1.input) !== JSON.stringify(step2.input)) {
      differences.push({
        field: "input",
        left: step1.input,
        right: step2.input,
      });
    }

    if (JSON.stringify(step1.output) !== JSON.stringify(step2.output)) {
      differences.push({
        field: "output",
        left: step1.output,
        right: step2.output,
      });
    }

    if (differences.length > 0) {
      stepDifferences.push({ stepName, differences });
    }

    // Compare filters
    if (
      JSON.stringify(step1.filters || {}) !==
      JSON.stringify(step2.filters || {})
    ) {
      filterDifferences.push({
        stepName,
        filters1: step1.filters || {},
        filters2: step2.filters || {},
      });
    }

    // Compare selections
    if (
      JSON.stringify(step1.selection || {}) !==
      JSON.stringify(step2.selection || {})
    ) {
      selectionDifferences.push({
        stepName,
        selection1: step1.selection,
        selection2: step2.selection,
      });
    }
  }

  return {
    execution1,
    execution2,
    stepDifferences,
    filterDifferences,
    selectionDifferences,
  };
}

