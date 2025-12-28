/**
 * Validation schemas for step-related requests
 */

// Placeholder for step validation schemas
// Can be expanded when needed

export interface StepQueryParams {
  executionId: string;
  stepId?: string;
  stepName?: string;
}

export function validateStepQuery(
  params: any
): { valid: boolean; errors: string[]; data?: StepQueryParams } {
  const errors: string[] = [];

  if (!params.id || typeof params.id !== "string") {
    errors.push("execution ID is required");
  }

  const data: StepQueryParams = {
    executionId: params.id,
  };

  if (params.stepId !== undefined) {
    if (typeof params.stepId !== "string") {
      errors.push("stepId must be a string");
    } else {
      data.stepId = params.stepId;
    }
  }

  if (params.stepName !== undefined) {
    if (typeof params.stepName !== "string") {
      errors.push("stepName must be a string");
    } else {
      data.stepName = params.stepName;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? data : undefined,
  };
}

