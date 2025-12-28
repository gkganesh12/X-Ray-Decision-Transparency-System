/// <reference types="express" />
/**
 * Authentication routes
 */
import type { Request, Response } from "express";
import { Router } from "express";
import { signToken } from "../auth/jwt";
import { findUserByUsername, verifyPassword } from "../models/User";
import { ValidationError } from "../errors";
import { asyncHandler } from "../middleware/asyncHandler";
import { logger } from "../utils/logger";
import { metrics } from "../utils/metrics";

export function createAuthRouter(): Router {
  const router = Router();

  /**
   * POST /api/auth/login
   * Login with username and password
   */
  router.post("/login", asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    const { username, password } = req.body;

    if (!username || !password) {
      throw new ValidationError(
        "Username and password are required",
        {}
      );
    }

    const user = findUserByUsername(username);
    if (!user) {
      metrics.increment("api.auth.login.error");
      logger.warn("Login attempt with invalid username", { username });
      res.status(401).json({
        error: {
          message: "Invalid username or password",
          code: "INVALID_CREDENTIALS",
        },
      });
      return;
    }

    const isValid = await verifyPassword(username, password);
    if (!isValid) {
      metrics.increment("api.auth.login.error");
      logger.warn("Login attempt with invalid password", { username });
      res.status(401).json({
        error: {
          message: "Invalid username or password",
          code: "INVALID_CREDENTIALS",
        },
      });
      return;
    }

    const token = signToken({
      userId: user.id,
      username: user.username,
    });

    const duration = Date.now() - startTime;
    metrics.gauge("api.auth.login.duration", duration);
    metrics.increment("api.auth.login.success");
    logger.info("User logged in", { username, duration });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  }));

  /**
   * POST /api/auth/logout
   * Logout (client-side token removal, this is just for consistency)
   */
  router.post("/logout", (_req: Request, res: Response) => {
    logger.info("User logged out");
    res.json({ message: "Logged out successfully" });
  });

  /**
   * GET /api/auth/me
   * Get current user info (requires authentication)
   */
  router.get("/me", (req: Request, res: Response) => {
    const authReq = req as any;
    if (!authReq.user) {
      res.status(401).json({
        error: {
          message: "Authentication required",
          code: "AUTH_REQUIRED",
        },
      });
      return;
    }

    res.json({
      user: {
        id: authReq.user.userId,
        username: authReq.user.username,
      },
    });
  });

  return router;
}

