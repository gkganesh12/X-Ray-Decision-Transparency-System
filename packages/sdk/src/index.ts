/**
 * X-Ray Decision Transparency System - SDK
 * 
 * A lightweight library for capturing decision-level transparency
 * in multi-step, non-deterministic systems.
 */

export { XRaySession } from "./XRaySession";
export { XRayStepBuilder } from "./XRayStep";
export { InMemoryStore } from "./store/InMemoryStore";
export { xrayStep, withXRayStep } from "./decorators/xrayStep";
export type {
  XRayExecution,
  XRayStep,
  CandidateEvaluation,
  Selection,
  EventStore,
  XRaySessionOptions,
  BatchStep,
} from "./types";
export type { StepHook, ExecutionHook } from "./hooks";
export type { StepMiddleware } from "./middleware";

