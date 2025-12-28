/**
 * Repository for execution data access
 * Provides abstraction over EventStore with additional query capabilities
 */
import type { EventStore, XRayExecution } from "@xray/sdk";
import { DatabaseError, NotFoundError } from "../errors";

export interface ExecutionQuery {
  page?: number;
  limit?: number;
  status?: "all" | "completed" | "in_progress";
  tags?: string[];
  startDate?: number;
  endDate?: number;
  minSteps?: number;
  maxSteps?: number;
  search?: string;
}

export interface ExecutionStatistics {
  total: number;
  completed: number;
  inProgress: number;
  averageDuration: number;
  averageSteps: number;
}

export class ExecutionRepository {
  constructor(private store: EventStore) {}

  /**
   * Get execution by ID
   */
  async findById(id: string): Promise<XRayExecution | null> {
    try {
      const execution = await this.store.getExecution(id);
      return execution;
    } catch (error) {
      throw new DatabaseError(`Failed to get execution: ${id}`, error as Error);
    }
  }

  /**
   * List executions with pagination and filtering
   */
  async findMany(query: ExecutionQuery = {}): Promise<{
    executions: XRayExecution[];
    total: number;
  }> {
    try {
      // Get all executions first to apply filters correctly
      // Use a large limit to get all executions, or use countExecutions if available
      let allExecutions: XRayExecution[];
      let total: number;
      
      // Get all executions - InMemoryStore returns all if limit/offset are undefined
      // Get count first if available
      if (this.store.countExecutions) {
        total = await this.store.countExecutions();
      }
      
      // Get all executions without limit/offset to get everything
      allExecutions = await this.store.listExecutions();
      
      // Update total if we didn't get it from countExecutions
      if (!this.store.countExecutions) {
        total = allExecutions.length;
      }
      
      // Apply filters before pagination
      let filteredExecutions = this.applyFilters(allExecutions, query);
      
      // Calculate total after filtering
      total = filteredExecutions.length;
      
      // Apply pagination
      const page = query.page || 1;
      const limit = query.limit || 20;
      const offset = (page - 1) * limit;
      const executions = filteredExecutions.slice(offset, offset + limit);

      return { executions, total };
    } catch (error) {
      throw new DatabaseError("Failed to list executions", error as Error);
    }
  }

  /**
   * Update execution metadata
   */
  async updateMetadata(
    id: string,
    updates: { tags?: string[]; notes?: string }
  ): Promise<XRayExecution | null> {
    try {
      const execution = await this.findById(id);
      if (!execution) {
        return null;
      }

      if (updates.tags !== undefined) {
        execution.tags = updates.tags;
      }
      if (updates.notes !== undefined) {
        execution.notes = updates.notes;
      }

      await this.store.saveExecution(execution);
      return execution;
    } catch (error) {
      throw new DatabaseError(`Failed to update execution: ${id}`, error as Error);
    }
  }

  /**
   * Delete execution by ID
   */
  async delete(id: string): Promise<void> {
    try {
      if (this.store.deleteExecution) {
        await this.store.deleteExecution(id);
      } else {
        throw new Error("Delete operation not supported by store");
      }
    } catch (error) {
      throw new DatabaseError(`Failed to delete execution: ${id}`, error as Error);
    }
  }

  /**
   * Delete multiple executions
   */
  async deleteMany(ids: string[]): Promise<void> {
    try {
      if (this.store.deleteExecutions) {
        await this.store.deleteExecutions(ids);
      } else {
        // Fallback: delete one by one
        for (const id of ids) {
          await this.delete(id);
        }
      }
    } catch (error) {
      throw new DatabaseError("Failed to delete executions", error as Error);
    }
  }

  /**
   * Get execution statistics
   */
  async getStatistics(): Promise<ExecutionStatistics> {
    try {
      const allExecutions = await this.store.listExecutions(1000, 0);
      
      const completed = allExecutions.filter((e) => e.completedAt).length;
      const inProgress = allExecutions.length - completed;
      
      const completedExecutions = allExecutions.filter((e) => e.completedAt);
      const averageDuration =
        completedExecutions.length > 0
          ? completedExecutions.reduce(
              (sum, e) => sum + ((e.completedAt || 0) - e.startedAt),
              0
            ) / completedExecutions.length
          : 0;

      const averageSteps =
        allExecutions.length > 0
          ? allExecutions.reduce((sum, e) => sum + e.steps.length, 0) /
            allExecutions.length
          : 0;

      return {
        total: allExecutions.length,
        completed,
        inProgress,
        averageDuration,
        averageSteps,
      };
    } catch (error) {
      throw new DatabaseError("Failed to get statistics", error as Error);
    }
  }

  /**
   * Apply filters to executions
   */
  private applyFilters(
    executions: XRayExecution[],
    query: ExecutionQuery
  ): XRayExecution[] {
    let filtered = [...executions];

    // Status filter
    if (query.status === "completed") {
      filtered = filtered.filter((e) => e.completedAt);
    } else if (query.status === "in_progress") {
      filtered = filtered.filter((e) => !e.completedAt);
    }

    // Tag filter
    if (query.tags && query.tags.length > 0) {
      filtered = filtered.filter((e) => {
        if (!e.tags || e.tags.length === 0) return false;
        return query.tags!.some((tag) => e.tags!.includes(tag));
      });
    }

    // Date range filter
    if (query.startDate) {
      filtered = filtered.filter((e) => e.startedAt >= query.startDate!);
    }
    if (query.endDate) {
      filtered = filtered.filter((e) => e.startedAt <= query.endDate!);
    }

    // Step count filter
    if (query.minSteps !== undefined) {
      filtered = filtered.filter((e) => e.steps.length >= query.minSteps!);
    }
    if (query.maxSteps !== undefined) {
      filtered = filtered.filter((e) => e.steps.length <= query.maxSteps!);
    }

    // Search filter
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(searchLower) ||
          e.id.toLowerCase().includes(searchLower) ||
          e.steps.some((s) => s.name.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }
}

