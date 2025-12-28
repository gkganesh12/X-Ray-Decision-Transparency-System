/**
 * Service layer for execution business logic
 */
import { ExecutionRepository, type ExecutionQuery, type ExecutionStatistics } from "../repositories";
import { compareExecutions } from "../utils/comparison";
import { NotFoundError } from "../errors";
import type { XRayExecution } from "@xray/sdk";

export class ExecutionService {
  constructor(private repository: ExecutionRepository) {}

  /**
   * Get execution by ID
   */
  async getExecution(id: string): Promise<XRayExecution> {
    const execution = await this.repository.findById(id);
    if (!execution) {
      throw new NotFoundError("Execution", id);
    }
    return execution;
  }

  /**
   * List executions with filtering and pagination
   */
  async listExecutions(query: ExecutionQuery = {}) {
    return this.repository.findMany(query);
  }

  /**
   * Update execution metadata
   */
  async updateMetadata(
    id: string,
    updates: { tags?: string[]; notes?: string }
  ): Promise<XRayExecution> {
    // Validate tags if provided
    if (updates.tags !== undefined) {
      if (!Array.isArray(updates.tags)) {
        throw new Error("Tags must be an array");
      }
      // Remove duplicates and empty strings
      updates.tags = [...new Set(updates.tags.filter((t) => t.trim().length > 0))];
    }

    // Validate notes if provided
    if (updates.notes !== undefined && typeof updates.notes !== "string") {
      throw new Error("Notes must be a string");
    }

    const execution = await this.repository.updateMetadata(id, updates);
    if (!execution) {
      throw new NotFoundError("Execution", id);
    }
    return execution;
  }

  /**
   * Get execution statistics
   */
  async getStatistics(): Promise<ExecutionStatistics> {
    return this.repository.getStatistics();
  }

  /**
   * Compare two executions
   */
  async compareExecutions(id1: string, id2: string) {
    const execution1 = await this.repository.findById(id1);
    if (!execution1) {
      throw new NotFoundError("Execution", id1);
    }

    const execution2 = await this.repository.findById(id2);
    if (!execution2) {
      throw new NotFoundError("Execution", id2);
    }

    return compareExecutions(execution1, execution2);
  }

  /**
   * Delete execution
   */
  async deleteExecution(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  /**
   * Delete multiple executions
   */
  async deleteExecutions(ids: string[]): Promise<void> {
    return this.repository.deleteMany(ids);
  }
}

