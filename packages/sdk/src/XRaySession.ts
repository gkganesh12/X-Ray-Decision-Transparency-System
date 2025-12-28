/**
 * XRaySession - Main session manager for X-Ray executions
 */
import type {
  EventStore,
  XRayExecution,
  XRaySessionOptions,
  XRayStep,
} from "./types";
import type { StepHook, ExecutionHook } from "./hooks";
import type { StepMiddleware } from "./middleware";
import { InMemoryStore } from "./store/InMemoryStore";
import { XRayStepBuilder } from "./XRayStep";
import { logger } from "./utils/logger";
import { validateExecutionName, validateStepName } from "./validation/parameterValidation";

export class XRaySession {
  private execution: XRayExecution;
  private store: EventStore;
  private isCompleted = false;
  private stepHooks: StepHook[];
  private executionHooks: ExecutionHook[];
  private stepMiddleware: StepMiddleware[];

  constructor(options: XRaySessionOptions) {
    validateExecutionName(options.name);
    
    const executionId = options.executionId || this.generateExecutionId();
    this.store = options.store || new InMemoryStore();
    this.stepHooks = options.stepHooks || [];
    this.executionHooks = options.executionHooks || [];
    this.stepMiddleware = options.stepMiddleware || [];

    this.execution = {
      id: executionId,
      name: options.name,
      startedAt: Date.now(),
      steps: [],
    };

    // Call execution start hooks
    this.callExecutionHooks("onExecutionStart");
  }

  /**
   * Create a new step in the execution
   * @param name Step name
   * @param callback Function that receives a step builder
   * @template TCallback - Type of the callback function
   */
  async step(
    name: string,
    callback: (step: XRayStepBuilder) => void | Promise<void>
  ): Promise<this> {
    validateStepName(name);
    
    if (this.isCompleted) {
      throw new Error("Cannot add steps to a completed execution");
    }

    // Ensure execution exists in database before adding steps or checking hooks
    if (this.execution.steps.length === 0) {
      try {
        await this.store.saveExecution({
          ...this.execution,
          completedAt: undefined,
        });
      } catch (err) {
        logger.error("Failed to save execution", err);
      }
    }

    // Call before step hooks
    for (const hook of this.stepHooks) {
      if (hook.beforeStep) {
        const shouldContinue = await hook.beforeStep(name);
        if (shouldContinue === false) {
          return this; // Skip this step
        }
      }
    }

    try {
      let stepBuilder = new XRayStepBuilder(name);

      // Apply middleware pre-processing
      for (const middleware of this.stepMiddleware) {
        if (middleware.process) {
          stepBuilder = await middleware.process(name, stepBuilder);
        }
      }

      const result = callback(stepBuilder);

      // Apply middleware post-processing
      for (const middleware of this.stepMiddleware) {
        if (middleware.postProcess) {
          stepBuilder = await middleware.postProcess(name, stepBuilder);
        }
      }

      // Handle async callbacks
      const finalizeStep = async () => {
        // Re-apply middleware post-processing in case builder was modified
        let finalBuilder = stepBuilder;
        for (const middleware of this.stepMiddleware) {
          if (middleware.postProcess) {
            finalBuilder = await middleware.postProcess(name, finalBuilder);
          }
        }

        let step = finalBuilder.build();

        // Call after step created hooks
        for (const hook of this.stepHooks) {
          if (hook.afterStepCreated) {
            step = await hook.afterStepCreated(step);
          }
        }

        try {
          await this.store.addStep(this.execution.id, step);
          
          // Update in-memory execution to keep it in sync
          this.execution.steps.push(step);

          // Call after step persisted hooks
          for (const hook of this.stepHooks) {
            if (hook.afterStepPersisted) {
              await hook.afterStepPersisted(step);
            }
          }
        } catch (err) {
          logger.error("Failed to persist step", err);
          throw err;
        }
      };

      if (result instanceof Promise) {
        await result;
        await finalizeStep();
      } else {
        await finalizeStep();
      }
    } catch (error) {
      // Call error hooks
      for (const hook of this.stepHooks) {
        if (hook.onStepError) {
          await hook.onStepError(name, error as Error);
        }
      }
      throw error;
    }

    return this;
  }

  /**
   * Complete the execution and persist to store
   */
  async complete(): Promise<void> {
    if (this.isCompleted) {
      return;
    }

    this.isCompleted = true;
    this.execution.completedAt = Date.now();

    try {
      await this.store.saveExecution(this.execution);

      // Call execution complete hooks
      await this.callExecutionHooks("onExecutionComplete");
    } catch (error) {
      // Call execution error hooks
      await this.callExecutionHooks("onExecutionError", error as Error);
      logger.error("Failed to save execution", error);
      throw error;
    }
  }

  /**
   * Call execution hooks
   */
  private async callExecutionHooks(
    method: "onExecutionStart" | "onExecutionComplete" | "onExecutionError",
    error?: Error
  ): Promise<void> {
    for (const hook of this.executionHooks) {
      try {
        if (method === "onExecutionStart" && hook.onExecutionStart) {
          await hook.onExecutionStart(this.execution);
        } else if (method === "onExecutionComplete" && hook.onExecutionComplete) {
          await hook.onExecutionComplete(this.execution);
        } else if (method === "onExecutionError" && hook.onExecutionError && error) {
          await hook.onExecutionError(this.execution, error);
        }
      } catch (hookError) {
        // Don't throw from hooks, just log
        logger.error(`Error in execution hook ${method}`, hookError as Error);
      }
    }
  }

  /**
   * Get the current execution (read-only)
   */
  getExecution(): Readonly<XRayExecution> {
    return { ...this.execution };
  }

  /**
   * Get execution ID
   */
  getId(): string {
    return this.execution.id;
  }

  /**
   * Add multiple steps atomically
   * @param steps Array of step definitions
   */
  async batchSteps(steps: Array<{ name: string; callback: (step: XRayStepBuilder) => void | Promise<void> }>): Promise<this> {
    if (this.isCompleted) {
      throw new Error("Cannot add steps to a completed execution");
    }

    // Ensure execution exists in database
    if (this.execution.steps.length === 0) {
      try {
        await this.store.saveExecution({
          ...this.execution,
          completedAt: undefined,
        });
      } catch (err) {
        logger.error("Failed to save execution", err);
      }
    }

    const builtSteps: XRayStep[] = [];

    // Build all steps first
    for (const stepDef of steps) {
      try {
        // Call before step hooks
        for (const hook of this.stepHooks) {
          if (hook.beforeStep) {
            const shouldContinue = await hook.beforeStep(stepDef.name);
            if (shouldContinue === false) {
              continue; // Skip this step
            }
          }
        }

        let stepBuilder = new XRayStepBuilder(stepDef.name);

        // Apply middleware pre-processing
        for (const middleware of this.stepMiddleware) {
          if (middleware.process) {
            stepBuilder = await middleware.process(stepDef.name, stepBuilder);
          }
        }

        const result = stepDef.callback(stepBuilder);

        // Apply middleware post-processing
        for (const middleware of this.stepMiddleware) {
          if (middleware.postProcess) {
            stepBuilder = await middleware.postProcess(stepDef.name, stepBuilder);
          }
        }

        if (result instanceof Promise) {
          await result;
        }

        let step = stepBuilder.build();

        // Call after step created hooks
        for (const hook of this.stepHooks) {
          if (hook.afterStepCreated) {
            step = await hook.afterStepCreated(step);
          }
        }

        builtSteps.push(step);
      } catch (error) {
        // Call error hooks
        for (const hook of this.stepHooks) {
          if (hook.onStepError) {
            await hook.onStepError(stepDef.name, error as Error);
          }
        }
        throw error;
      }
    }

    // Persist all steps
    for (const step of builtSteps) {
      try {
        await this.store.addStep(this.execution.id, step);
        
        // Update in-memory execution to keep it in sync
        this.execution.steps.push(step);

        // Call after step persisted hooks
        for (const hook of this.stepHooks) {
          if (hook.afterStepPersisted) {
            await hook.afterStepPersisted(step);
          }
        }
      } catch (err) {
        logger.error("Failed to persist step", err);
        throw err;
      }
    }

    return this;
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

