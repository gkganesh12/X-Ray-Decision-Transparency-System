/**
 * Hook interface for execution lifecycle events
 */
import type { XRayExecution } from "../types";

export interface ExecutionHook {
  /**
   * Called when execution starts
   * @param execution - The execution that started
   */
  onExecutionStart?(execution: XRayExecution): void | Promise<void>;

  /**
   * Called when execution completes
   * @param execution - The completed execution
   */
  onExecutionComplete?(execution: XRayExecution): void | Promise<void>;

  /**
   * Called if execution fails
   * @param execution - The execution that failed
   * @param error - The error that occurred
   */
  onExecutionError?(execution: XRayExecution, error: Error): void | Promise<void>;
}

