/**
 * Hook interface for step lifecycle events
 */
import type { XRayStep } from "../types";

export interface StepHook {
  /**
   * Called before a step is created
   * @param stepName - Name of the step being created
   * @returns true to continue, false to skip the step
   */
  beforeStep?(stepName: string): boolean | Promise<boolean>;

  /**
   * Called after a step is created but before it's persisted
   * @param step - The step that was created
   * @returns The step (can be modified)
   */
  afterStepCreated?(step: XRayStep): XRayStep | Promise<XRayStep>;

  /**
   * Called after a step is persisted
   * @param step - The persisted step
   */
  afterStepPersisted?(step: XRayStep): void | Promise<void>;

  /**
   * Called if step creation fails
   * @param stepName - Name of the step that failed
   * @param error - The error that occurred
   */
  onStepError?(stepName: string, error: Error): void | Promise<void>;
}

