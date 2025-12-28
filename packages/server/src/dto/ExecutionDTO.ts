/**
 * Data Transfer Objects for Execution API responses
 * Provides versioning and API contract stability
 */
import type { XRayExecution } from "@xray/sdk";
import type { PaginationDTO } from "./PaginationDTO";

export interface ExecutionDTO {
  id: string;
  name: string;
  startedAt: number;
  completedAt?: number;
  steps: StepSummaryDTO[];
  tags?: string[];
  notes?: string;
  duration?: number;
  status: "completed" | "in_progress";
}

export interface StepSummaryDTO {
  id: string;
  name: string;
  createdAt: number;
  hasInput: boolean;
  hasOutput: boolean;
  hasFilters: boolean;
  hasEvaluations: boolean;
  hasSelection: boolean;
  hasReasoning: boolean;
}

export interface ExecutionListDTO {
  executions: ExecutionDTO[];
  pagination: PaginationDTO;
}

// PaginationDTO is defined in PaginationDTO.ts

/**
 * Convert domain execution to DTO
 */
export function toExecutionDTO(execution: XRayExecution): ExecutionDTO {
  const duration = execution.completedAt
    ? execution.completedAt - execution.startedAt
    : undefined;

  return {
    id: execution.id,
    name: execution.name,
    startedAt: execution.startedAt,
    completedAt: execution.completedAt,
    tags: execution.tags,
    notes: execution.notes,
    duration,
    status: execution.completedAt ? "completed" : "in_progress",
    steps: execution.steps.map((step: any) => ({
      id: step.id,
      name: step.name,
      createdAt: step.createdAt,
      hasInput: step.input !== undefined,
      hasOutput: step.output !== undefined,
      hasFilters: step.filters !== undefined,
      hasEvaluations: step.evaluations !== undefined,
      hasSelection: step.selection !== undefined,
      hasReasoning: step.reasoning !== undefined,
    })),
  };
}

/**
 * Convert multiple executions to DTOs
 */
export function toExecutionListDTO(
  executions: XRayExecution[],
  pagination: PaginationDTO
): ExecutionListDTO {
  return {
    executions: executions.map(toExecutionDTO),
    pagination,
  };
}

