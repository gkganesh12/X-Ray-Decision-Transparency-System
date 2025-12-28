/**
 * Authentication middleware for protecting routes
 */
import { Request, Response, NextFunction } from "express";
import { verifyToken, extractTokenFromHeader } from "./jwt";
import { AppError } from "../errors";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Middleware to authenticate requests using JWT tokens
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
    }

    const payload = verifyToken(token);
    req.user = {
      id: payload.userId,
      email: payload.username,
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
    const token = extractTokenFromHeader(req.headers.authorization);
    if (token) {
      const payload = verifyToken(token);
      req.user = {
        id: payload.userId,
        email: payload.username,
      };
    }
  } catch {
    // Ignore errors for optional auth
  }
  next();
}

