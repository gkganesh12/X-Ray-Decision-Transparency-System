/// <reference types="express" />
/**
 * Authentication middleware for protecting routes
 */
import type { Response, NextFunction } from "express";
import { verifyToken, extractTokenFromHeader } from "./jwt";
import { AppError } from "../errors";
import { AuthenticatedRequest } from "./types";

/**
 * Middleware to authenticate requests using JWT tokens
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.header("authorization");
    const token = extractTokenFromHeader(authHeader || undefined);

    if (!token) {
      throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
    }

    const payload = verifyToken(token);
    req.user = {
      id: payload.userId,
      role: undefined,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        error: {
          message: error.message,
          code: error.code || "AUTH_ERROR",
        },
      });
      return;
    }

    res.status(401).json({
      error: {
        message: error instanceof Error ? error.message : "Authentication failed",
        code: "AUTH_ERROR",
      },
    });
  }
}

/**
 * Optional authentication - doesn't fail if no token provided
 */
export function optionalAuthenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.header("authorization");
    const token = extractTokenFromHeader(authHeader || undefined);
    if (token) {
      const payload = verifyToken(token);
      req.user = {
        id: payload.userId,
        role: undefined,
      };
    }
  } catch {
    // Ignore errors for optional auth
  }
  next();
}
