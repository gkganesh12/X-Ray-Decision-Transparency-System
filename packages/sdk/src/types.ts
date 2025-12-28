/**
 * Core type definitions for X-Ray Decision Transparency System
 * 
 * @packageDocumentation
 */

/**
 * Evaluation result for a candidate in a filtering/ranking step
 * 
 * @example
 * ```typescript
 * const evaluation: CandidateEvaluation = {
 *   id: "candidate_1",
 *   label: "Product A",
 *   metrics: { price: 29.99, rating: 4.5 },
 *   results: {
 *     price_range: { passed: true, detail: "Within range" },
 *     min_rating: { passed: true, detail: "4.5 >= 3.8" }
 *   },
 *   qualified: true
 * };
 * ```
 */
export interface CandidateEvaluation {
  id: string;
  label: string;
  metrics?: Record<string, number>;
  results: {
    [filterName: string]: {
      passed: boolean;
      detail: string;
    };
  };
  qualified: boolean;
}

/**
 * Final selection made in a step
 * 
 * @example
 * ```typescript
 * const selection: Selection = {
 *   id: "product_123",
 *   reason: "Highest score based on price, rating, and reviews"
 * };
 * ```
 */
export interface Selection {
  /** Unique identifier of the selected item */
  id: string;
  /** Human-readable explanation of why this item was selected */
  reason: string;
}

/**
 * A single step in an X-Ray execution
 * 
 * @template TInput - Type of the input data
 * @template TOutput - Type of the output data
 * @template TFilters - Type of the filters object
 * @template TMetadata - Type of the metadata object
 * 
 * @example
 * ```typescript
 * const step: XRayStep<{ query: string }, { results: string[] }> = {
 *   id: "step_1",
 *   name: "search",
 *   input: { query: "water bottle" },
 *   output: { results: ["result1", "result2"] },
 *   createdAt: Date.now()
 * };
 * ```
 */
export interface XRayStep<TInput = unknown, TOutput = unknown, TFilters = Record<string, unknown>, TMetadata = Record<string, unknown>> {
  id: string;
  name: string;
  input?: TInput;
  output?: TOutput;
  filters?: TFilters;
  evaluations?: CandidateEvaluation[];
  selection?: Selection;
  reasoning?: string;
  metadata?: TMetadata;
  createdAt: number;
}

/**
 * Complete X-Ray execution record
 * 
 * @example
 * ```typescript
 * const execution: XRayExecution = {
 *   id: "exec_123",
 *   name: "competitor_selection",
 *   startedAt: Date.now(),
 *   completedAt: Date.now() + 5000,
 *   steps: [step1, step2],
 *   tags: ["production", "v2"],
 *   notes: "Successful run"
 * };
 * ```
 */
export interface XRayExecution {
  /** Unique execution identifier */
  id: string;
  /** Human-readable execution name */
  name: string;
  /** Timestamp when execution started (milliseconds since epoch) */
  startedAt: number;
  /** Timestamp when execution completed (undefined if still in progress) */
  completedAt?: number;
  /** Array of steps in this execution */
  steps: XRayStep[];
  /** Optional tags for categorization */
  tags?: string[];
  /** Optional notes/description */
  notes?: string;
}

import type { StepHook, ExecutionHook } from "./hooks";
import type { StepMiddleware } from "./middleware";
import type { XRayStepBuilder } from "./XRayStep";

/**
 * Configuration options for creating an X-Ray session
 * 
 * @example
 * ```typescript
 * const options: XRaySessionOptions = {
 *   name: "my_workflow",
 *   executionId: "custom_id",
 *   store: new SQLiteStore(),
 *   stepHooks: [myStepHook],
 *   executionHooks: [myExecutionHook]
 * };
 * ```
 */
export interface XRaySessionOptions {
  executionId?: string;
  name: string;
  store?: EventStore;
  stepHooks?: StepHook[];
  executionHooks?: ExecutionHook[];
  stepMiddleware?: StepMiddleware[];
}

export interface BatchStep {
  name: string;
  callback: (step: XRayStepBuilder) => void | Promise<void>;
}

/**
 * Interface for persisting X-Ray execution data
 * 
 * Implementations can use SQLite, PostgreSQL, or any other storage backend.
 * 
 * @example
 * ```typescript
 * class MyStore implements EventStore {
 *   async saveExecution(execution: XRayExecution): Promise<void> {
 *     // Save to database
 *   }
 *   // ... implement other methods
 * }
 * ```
 */
export interface EventStore {
  /** Save or update an execution */
  saveExecution(execution: XRayExecution): Promise<void>;
  /** Retrieve an execution by ID */
  getExecution(id: string): Promise<XRayExecution | null>;
  /** List executions with pagination */
  listExecutions(limit?: number, offset?: number): Promise<XRayExecution[]>;
  /** Add a step to an existing execution */
  addStep(executionId: string, step: XRayStep): Promise<void>;
  /** Get total count of executions (optional) */
  countExecutions?(): Promise<number>;
  /** Delete an execution by ID (optional) */
  deleteExecution?(id: string): Promise<void>;
  /** Delete multiple executions by IDs (optional) */
  deleteExecutions?(ids: string[]): Promise<void>;
}

