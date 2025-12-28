/**
 * Data Transfer Objects for Step API responses
 */
import type { XRayStep } from "@xray/sdk";

export interface StepDTO {
  id: string;
  name: string;
  input?: any;
  output?: any;
  filters?: Record<string, any>;
  evaluations?: CandidateEvaluationDTO[];
  selection?: SelectionDTO;
  reasoning?: string;
  metadata?: Record<string, any>;
  createdAt: number;
}

export interface CandidateEvaluationDTO {
  id: string;
  label: string;
  metrics?: Record<string, number>;
  results: Record<string, { passed: boolean; detail: string }>;
  qualified: boolean;
}

export interface SelectionDTO {
  id: string;
  reason: string;
}

/**
 * Convert domain step to DTO
 */
export function toStepDTO(step: XRayStep): StepDTO {
  return {
    id: step.id,
    name: step.name,
    input: step.input,
    output: step.output,
    filters: step.filters,
    evaluations: step.evaluations?.map((evaluation: any) => ({
      id: evaluation.id,
      label: evaluation.label,
      metrics: evaluation.metrics,
      results: evaluation.results,
      qualified: evaluation.qualified,
    })),
    selection: step.selection
      ? {
          id: step.selection.id,
          reason: step.selection.reason,
        }
      : undefined,
    reasoning: step.reasoning,
    metadata: step.metadata,
    createdAt: step.createdAt,
  };
}

/**
 * Convert multiple steps to DTOs
 */
export function toStepListDTO(steps: XRayStep[]): StepDTO[] {
  return steps.map(toStepDTO);
}

