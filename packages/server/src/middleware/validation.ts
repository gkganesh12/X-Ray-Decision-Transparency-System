/// <reference types="express" />
/**
 * Validation middleware for request validation
 */
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../errors";

export function validateUpdateMetadata(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { validateUpdateMetadataRequest } = require("../validation/executionSchemas");
  const result = validateUpdateMetadataRequest(req.body);

  if (!result.valid) {
    const error = new ValidationError(
      "Validation failed",
      { body: result.errors }
    );
    res.status(400).json({
      error: {
        message: error.message,
        fields: error.fields,
        code: error.code,
      },
    });
    return;
  }

  // Attach validated data to request
  (req as any).validatedBody = result.data;
  next();
}

export function validateExecutionQuery(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { validateExecutionQuery } = require("../validation/executionSchemas");
  const result = validateExecutionQuery(req.query);

  if (!result.valid) {
    const error = new ValidationError(
      "Query validation failed",
      { query: result.errors }
    );
    res.status(400).json({
      error: {
        message: error.message,
        fields: error.fields,
        code: error.code,
      },
    });
    return;
  }

  // Attach validated query to request
  (req as any).validatedQuery = result.data;
  next();
}

