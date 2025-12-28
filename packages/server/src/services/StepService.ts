/**
 * Service layer for step business logic
 */
import { StepRepository } from "../repositories";
import { ExecutionRepository } from "../repositories";
import { NotFoundError } from "../errors";
import type { XRayStep } from "@xray/sdk";

export class StepService {
  constructor(
    private repository: StepRepository,
    private executionRepository?: ExecutionRepository
  ) {}

  /**
   * Get steps for an execution
   */
  async getStepsByExecutionId(executionId: string): Promise<XRayStep[]> {
    // Validate execution exists if we have access to execution repository
    if (this.executionRepository) {
      const execution = await this.executionRepository.findById(executionId);
      if (!execution) {
        throw new NotFoundError("Execution", executionId);
      }
    }
    
    return this.repository.findByExecutionId(executionId);
  }

  /**
   * Get step by ID
   */
  async getStep(executionId: string, stepId: string): Promise<XRayStep> {
    return this.repository.findById(executionId, stepId);
  }

  /**
   * Get steps by name pattern
   */
  async getStepsByName(
    executionId: string,
    stepName: string
  ): Promise<XRayStep[]> {
    return this.repository.findByStepName(executionId, stepName);
  }
}

