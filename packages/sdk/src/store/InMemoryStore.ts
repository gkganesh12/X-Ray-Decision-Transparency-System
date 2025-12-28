/**
 * In-memory implementation of EventStore for testing and development
 */
import type { EventStore, XRayExecution, XRayStep } from "../types";

export class InMemoryStore implements EventStore {
  private executions: Map<string, XRayExecution> = new Map();

  async saveExecution(execution: XRayExecution): Promise<void> {
    this.executions.set(execution.id, { ...execution });
  }

  async getExecution(id: string): Promise<XRayExecution | null> {
    const execution = this.executions.get(id);
    return execution ? { ...execution } : null;
  }

  async listExecutions(limit?: number, offset?: number): Promise<XRayExecution[]> {
    let executions = Array.from(this.executions.values()).map((e) => ({ ...e }));

    if (offset !== undefined) {
      executions = executions.slice(offset);
    }
    if (limit !== undefined) {
      executions = executions.slice(0, limit);
    }

    return executions;
  }

  async countExecutions(): Promise<number> {
    return this.executions.size;
  }

  async addStep(executionId: string, step: XRayStep): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    // Check if step already exists (by id) to avoid duplicates
    const stepExists = execution.steps.some((s) => s.id === step.id);
    if (stepExists) {
      return; // Step already exists, skip adding
    }

    // Create a new execution with the added step (immutability)
    const updatedExecution: XRayExecution = {
      ...execution,
      steps: [...execution.steps, step],
    };

    this.executions.set(executionId, updatedExecution);
  }

  // Utility method for testing
  async deleteExecution(id: string): Promise<void> {
    this.executions.delete(id);
  }

  async deleteExecutions(ids: string[]): Promise<void> {
    ids.forEach((id) => this.executions.delete(id));
  }

  clear(): void {
    this.executions.clear();
  }
}

