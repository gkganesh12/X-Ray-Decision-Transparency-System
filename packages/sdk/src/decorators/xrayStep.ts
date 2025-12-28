/**
 * Decorator for automatically instrumenting functions with X-Ray steps
 * 
 * @example
 * ```typescript
 * const xray = new XRaySession({ name: "workflow" });
 * 
 * @xrayStep(xray, "keyword_generation")
 * async function generateKeywords(product: Product): Promise<string[]> {
 *   // Function implementation
 * }
 * ```
 */

import type { XRaySession } from "../XRaySession";
import type { XRayStepBuilder } from "../XRayStep";

/**
 * Creates a decorator that wraps a function with X-Ray step tracking
 */
export function xrayStep(
  session: XRaySession,
  stepName: string
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return session.step(stepName, async (step: XRayStepBuilder) => {
        step.input({ args });
        try {
          const result = await originalMethod.apply(this, args);
          step.output({ result });
          return result;
        } catch (error) {
          step.metadata({ error: (error as Error).message });
          throw error;
        }
      });
    };

    return descriptor;
  };
}

/**
 * Higher-order function version for non-class methods
 */
export function withXRayStep<T extends (...args: any[]) => any>(
  session: XRaySession,
  stepName: string,
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    return session.step(stepName, async (step) => {
      step.input({ args });
      try {
        const result = await fn(...args);
        step.output({ result });
        return result;
      } catch (error) {
        step.metadata({ error: (error as Error).message });
        throw error;
      }
    });
  }) as T;
}

