/// <reference types="express" />
/**
 * Rate limiting middleware
 * Simple in-memory rate limiter (for production, use Redis or similar)
 */
import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Export function to clear rate limit store (for testing)
export function clearRateLimitStore(): void {
  Object.keys(store).forEach((key) => {
    delete store[key];
  });
}

export function rateLimit(
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  maxRequests: number = 100
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    if (store[key].count >= maxRequests) {
      logger.warn("Rate limit exceeded", { ip: key, count: store[key].count });
      res.status(429).json({
        error: {
          message: "Too many requests, please try again later",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
        },
      });
      return;
    }

    store[key].count++;
    next();
  };
}
