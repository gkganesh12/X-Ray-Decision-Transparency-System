/**
 * Test app helper for integration tests
 */
import express, { type Express } from "express";
import { createServer } from "http";
import { InMemoryStore } from "@xray/sdk";
import { createExecutionsRouter } from "../../src/routes/executions";
import { createStepsRouter } from "../../src/routes/steps";
import { corsMiddleware } from "../../src/middleware/cors";
import { errorHandler } from "../../src/middleware/errorHandler";
import { securityHeaders } from "../../src/middleware/security";
import { rateLimit } from "../../src/middleware/rateLimit";
import type { EventStore } from "@xray/sdk";

export function createTestApp(store?: EventStore): Express {
  const app = express();
  const testStore = store || new InMemoryStore();

  // Middleware
  app.use(securityHeaders);
  app.use(rateLimit(15 * 60 * 1000, 1000)); // Higher limit for tests
  app.use(express.json());
  app.use(corsMiddleware);

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Routes
  app.use("/api/executions", createExecutionsRouter(testStore, null));
  app.use("/api/executions", createStepsRouter(testStore));

  // Error handling
  app.use(errorHandler);

  return app;
}

