/// <reference types="express" />
import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../errors/NotFoundError";
import { logger } from "../utils/logger";
import { metrics } from "../utils/metrics";
import { AppError } from "../errors";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  metrics.increment("api.errors", { path: req.path, method: req.method });

  // Handle NotFoundError first (most common case)
  if (err instanceof NotFoundError || 
      (err?.statusCode === 404 && err?.code === "NOT_FOUND") ||
      err?.message?.includes("not found")) {
    logger.info("Resource not found", {
      path: req.path,
      method: req.method,
      url: req.url,
    });
    res.status(404).json({
      error: err.message || "Resource not found",
    });
    return;
  }

  // Handle other AppErrors
  if (err instanceof AppError || (err?.statusCode && err?.code)) {
    const statusCode = err.statusCode || 500;
    const code = err.code || "INTERNAL_SERVER_ERROR";
    
    logger.error("Application error", err, {
      path: req.path,
      method: req.method,
      url: req.url,
      statusCode,
      code,
    });

    res.status(statusCode).json({
      error: {
        message: err.message,
        code,
        ...(err instanceof require("../errors").ValidationError && {
          fields: (err as any).fields,
        }),
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      },
    });
    return;
  }

  // Handle unknown errors
  logger.error("Request error", err, {
    path: req.path,
    method: req.method,
    url: req.url,
  });

  res.status(500).json({
    error: "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { 
      message: err?.message,
      stack: err?.stack 
    }),
  });
}

