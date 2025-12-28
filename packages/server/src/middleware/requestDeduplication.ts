/// <reference types="express" />
/**
 * Request deduplication middleware
 * Prevents duplicate requests within a short time window
 */
import type { Request, Response, NextFunction } from "express";

interface RequestCache {
  response: any;
  timestamp: number;
}

const cache = new Map<string, RequestCache>();
const DEDUP_WINDOW = 1000; // 1 second

// Export function to clear cache (for testing)
export function clearDeduplicationCache(): void {
  cache.clear();
}

export function requestDeduplication(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Only deduplicate GET requests
  if (req.method !== "GET") {
    return next();
  }

  const cacheKey = `${req.method}:${req.originalUrl}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < DEDUP_WINDOW) {
    res.setHeader("X-Deduplicated", "true");
    res.json(cached.response);
    return;
  }

  // Override res.json to cache the response
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    cache.set(cacheKey, {
      response: data,
      timestamp: Date.now(),
    });
    return originalJson(data);
  } as typeof res.json;

  next();
}
