/// <reference types="express" />
/**
 * Response caching middleware
 * Simple in-memory cache (for production, use Redis or similar)
 */
import type { Request, Response, NextFunction } from "express";

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const cache: Map<string, CacheEntry> = new Map();

// Export function to clear cache (for testing)
export function clearCache(): void {
  cache.clear();
}

export function cacheMiddleware(ttl: number = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = `${req.method}:${req.originalUrl}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      res.setHeader("X-Cache", "HIT");
      res.json(cached.data);
      return;
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    const jsonOverride = function (this: Response, data: any) {
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl,
      });
      res.setHeader("X-Cache", "MISS");
      return originalJson.call(this, data);
    };
    (res as any).json = jsonOverride;

    next();
  };
}
