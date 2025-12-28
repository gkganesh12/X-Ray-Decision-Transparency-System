/// <reference types="express" />
import type { Request, Response, NextFunction } from "express";

export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.header("origin");
  
  // Support both CORS_ORIGIN and ALLOWED_ORIGINS for flexibility
  const corsEnv = process.env.CORS_ORIGIN || process.env.ALLOWED_ORIGINS;
  
  // In production, replace "*" with specific allowed origins
  const allowedOrigins = corsEnv
    ? corsEnv.split(",").map((o) => o.trim())
    : process.env.NODE_ENV === "production"
    ? []
    : ["*"];

  // Handle preflight requests first
  if (req.method === "OPTIONS") {
    if (allowedOrigins.includes("*") || (origin && allowedOrigins.includes(origin))) {
      res.header("Access-Control-Allow-Origin", origin || "*");
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Max-Age", "86400"); // 24 hours
    res.sendStatus(200);
    return;
  }

  // Handle actual requests
  if (allowedOrigins.includes("*") || (origin && allowedOrigins.includes(origin))) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Max-Age", "86400"); // 24 hours

  next();
}

