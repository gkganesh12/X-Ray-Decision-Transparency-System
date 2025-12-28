/**
 * Repository for step data access
 */
import type { EventStore, XRayExecution, XRayStep } from "@xray/sdk";
import { DatabaseError, NotFoundError } from "../errors";

export class StepRepository {
  constructor(private store: EventStore) {}

  /**
   * Get steps for an execution
   */
  async findByExecutionId(executionId: string): Promise<XRayStep[]> {
    try {
      const execution = await this.store.getExecution(executionId);
      if (!execution) {
        return [];
      }
      return execution.steps || [];
    } catch (error) {
      throw new DatabaseError(
        `Failed to get steps for execution: ${executionId}`,
        error as Error
      );
    }
  }

  /**
   * Get step by ID and execution ID
   */
  async findById(executionId: string, stepId: string): Promise<XRayStep> {
    try {
      const steps = await this.findByExecutionId(executionId);
      const step = steps.find((s) => s.id === stepId);
      if (!step) {
        throw new NotFoundError("Step", stepId);
      }
      return step;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to get step: ${stepId}`,
        error as Error
      );
    }
  }

  /**
   * Get steps by name pattern
   */
  async findByStepName(
    executionId: string,
    stepName: string
  ): Promise<XRayStep[]> {
    try {
      const steps = await this.findByExecutionId(executionId);
      return steps.filter((s) => s.name === stepName);
    } catch (error) {
      throw new DatabaseError(
        `Failed to get steps by name: ${stepName}`,
        error as Error
      );
    }
  }
}

