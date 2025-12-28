/**
 * Validation schemas for execution-related requests
 * Using Zod for runtime validation
 */

// We'll use a simple validation approach if Zod isn't available
// This can be replaced with Zod schemas once installed

export interface UpdateMetadataRequest {
  tags?: string[];
  notes?: string;
}

export function validateUpdateMetadataRequest(
  body: any
): { valid: boolean; errors: string[]; data?: UpdateMetadataRequest } {
  const errors: string[] = [];

  if (body === null || typeof body !== "object") {
    return { valid: false, errors: ["Request body must be an object"] };
  }

  const data: UpdateMetadataRequest = {};

  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) {
      errors.push("tags must be an array");
    } else {
      const invalidTags = body.tags.filter(
        (tag: any) => typeof tag !== "string"
      );
      if (invalidTags.length > 0) {
        errors.push("All tags must be strings");
      } else {
        data.tags = body.tags;
      }
    }
  }

  if (body.notes !== undefined) {
    if (typeof body.notes !== "string") {
      errors.push("notes must be a string");
    } else {
      data.notes = body.notes;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? data : undefined,
  };
}

export interface ExecutionQueryParams {
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

export function validateExecutionQuery(
  query: any
): { valid: boolean; errors: string[]; data?: ExecutionQueryParams } {
  const errors: string[] = [];
  const data: ExecutionQueryParams = {};

  if (query.page !== undefined) {
    const page = parseInt(query.page as string);
    if (isNaN(page) || page < 1) {
      errors.push("page must be a positive integer");
    } else {
      data.page = page;
    }
  }

  if (query.limit !== undefined) {
    const limit = parseInt(query.limit as string);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      errors.push("limit must be between 1 and 100");
    } else {
      data.limit = limit;
    }
  }

  if (query.status !== undefined) {
    if (!["all", "completed", "in_progress"].includes(query.status)) {
      errors.push("status must be one of: all, completed, in_progress");
    } else {
      data.status = query.status as "all" | "completed" | "in_progress";
    }
  }

  if (query.tags !== undefined) {
    if (typeof query.tags === "string") {
      data.tags = query.tags.split(",").map((t: string) => t.trim());
    } else if (Array.isArray(query.tags)) {
      data.tags = query.tags;
    } else {
      errors.push("tags must be a string or array");
    }
  }

  if (query.startDate !== undefined) {
    const date = parseInt(query.startDate as string);
    if (isNaN(date) || date < 0) {
      errors.push("startDate must be a valid timestamp");
    } else {
      data.startDate = date;
    }
  }

  if (query.endDate !== undefined) {
    const date = parseInt(query.endDate as string);
    if (isNaN(date) || date < 0) {
      errors.push("endDate must be a valid timestamp");
    } else {
      data.endDate = date;
    }
  }

  if (query.minSteps !== undefined) {
    const min = parseInt(query.minSteps as string);
    if (isNaN(min) || min < 0) {
      errors.push("minSteps must be a non-negative integer");
    } else {
      data.minSteps = min;
    }
  }

  if (query.maxSteps !== undefined) {
    const max = parseInt(query.maxSteps as string);
    if (isNaN(max) || max < 0) {
      errors.push("maxSteps must be a non-negative integer");
    } else {
      data.maxSteps = max;
    }
  }

  if (query.search !== undefined) {
    if (typeof query.search !== "string") {
      errors.push("search must be a string");
    } else {
      data.search = query.search;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? data : undefined,
  };
}

