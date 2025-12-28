import type { XRayExecution, XRayStep } from "@xray/sdk";

export interface StepDifference {
  stepName: string;
  stepIndex: number;
  differences: {
    field: string;
    left: any;
    right: any;
  }[];
}

export interface ExecutionComparison {
  execution1: XRayExecution;
  execution2: XRayExecution;
  stepDifferences: StepDifference[];
  filterDifferences: {
    stepName: string;
    filters1: Record<string, any>;
    filters2: Record<string, any>;
  }[];
  selectionDifferences: {
    stepName: string;
    selection1?: { id: string; reason: string };
    selection2?: { id: string; reason: string };
  }[];
}

export function compareExecutions(
  exec1: XRayExecution,
  exec2: XRayExecution
): ExecutionComparison {
  const stepDifferences: StepDifference[] = [];
  const filterDifferences: Array<{
    stepName: string;
    filters1: Record<string, any>;
    filters2: Record<string, any>;
  }> = [];
  const selectionDifferences: Array<{
    stepName: string;
    selection1?: { id: string; reason: string };
    selection2?: { id: string; reason: string };
  }> = [];

  const maxSteps = Math.max(exec1.steps.length, exec2.steps.length);

  for (let i = 0; i < maxSteps; i++) {
    const step1 = exec1.steps[i];
    const step2 = exec2.steps[i];

    if (!step1 || !step2) {
      stepDifferences.push({
        stepName: step1?.name || step2?.name || `Step ${i + 1}`,
        stepIndex: i,
        differences: [
          {
            field: "existence",
            left: step1 ? "exists" : "missing",
            right: step2 ? "exists" : "missing",
          },
        ],
      });
      continue;
    }

    if (step1.name !== step2.name) {
      stepDifferences.push({
        stepName: step1.name,
        stepIndex: i,
        differences: [
          {
            field: "name",
            left: step1.name,
            right: step2.name,
          },
        ],
      });
    }

    // Compare filters
    if (step1.filters || step2.filters) {
      const filters1 = step1.filters || {};
      const filters2 = step2.filters || {};
      const filterKeys = new Set([
        ...Object.keys(filters1),
        ...Object.keys(filters2),
      ]);

      const hasFilterDiff = Array.from(filterKeys).some(
        (key) => JSON.stringify(filters1[key]) !== JSON.stringify(filters2[key])
      );

      if (hasFilterDiff) {
        filterDifferences.push({
          stepName: step1.name,
          filters1,
          filters2,
        });
      }
    }

    // Compare selections
    if (step1.selection || step2.selection) {
      const sel1 = step1.selection;
      const sel2 = step2.selection;

      if (
        !sel1 ||
        !sel2 ||
        sel1.id !== sel2.id ||
        sel1.reason !== sel2.reason
      ) {
        selectionDifferences.push({
          stepName: step1.name,
          selection1: sel1,
          selection2: sel2,
        });
      }
    }

    // Compare evaluation counts
    const evalCount1 = step1.evaluations?.length || 0;
    const evalCount2 = step2.evaluations?.length || 0;
    if (evalCount1 !== evalCount2) {
      stepDifferences.push({
        stepName: step1.name,
        stepIndex: i,
        differences: [
          {
            field: "evaluation_count",
            left: evalCount1,
            right: evalCount2,
          },
        ],
      });
    }
  }

  return {
    execution1: exec1,
    execution2: exec2,
    stepDifferences,
    filterDifferences,
    selectionDifferences,
  };
}

