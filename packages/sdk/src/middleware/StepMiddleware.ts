/**
 * Middleware interface for step processing
 */
import type { XRayStepBuilder } from "../XRayStep";

export interface StepMiddleware {
  /**
   * Process the step builder before the callback is executed
   * @param stepName - Name of the step
   * @param builder - The step builder
   * @returns The step builder (can be modified or replaced)
   */
  process?(stepName: string, builder: XRayStepBuilder): XRayStepBuilder | Promise<XRayStepBuilder>;

  /**
   * Process the step after the callback is executed but before building
   * @param stepName - Name of the step
   * @param builder - The step builder
   * @returns The step builder (can be modified or replaced)
   */
  postProcess?(stepName: string, builder: XRayStepBuilder): XRayStepBuilder | Promise<XRayStepBuilder>;
}

