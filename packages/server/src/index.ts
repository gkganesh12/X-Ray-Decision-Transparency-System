/// <reference types="express" />
/**
 * X-Ray API Server
 * Provides REST API for accessing X-Ray execution data
 */
import express from "express";
import type { Request, Response } from "express";
import { createServer } from "http";
import { SQLiteStore } from "./store/SQLiteStore";
import { createExecutionsRouter } from "./routes/executions";
import { createStepsRouter } from "./routes/steps";
import { createAuthRouter } from "./routes/auth";
import { createDemoRouter } from "./routes/demo";
import { authenticate } from "./auth/middleware";
import { requestDeduplication } from "./middleware/requestDeduplication";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/errorHandler";
import { securityHeaders } from "./middleware/security";
import { rateLimit } from "./middleware/rateLimit";
import { logger } from "./utils/logger";
import { metrics } from "./utils/metrics";
import { ExecutionSocket } from "./websocket/ExecutionSocket";

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize store
const store = new SQLiteStore();

// Initialize WebSocket server
const executionSocket = new ExecutionSocket(server);

// Middleware
app.use(securityHeaders);
app.use(rateLimit(15 * 60 * 1000, 100)); // 100 requests per 15 minutes
app.use(express.json());
app.use(corsMiddleware);
app.use(requestDeduplication);

// Health check (public)
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth routes (public)
app.use("/api/auth", createAuthRouter());

// Protected routes (require authentication)
app.use("/api/executions", authenticate, createExecutionsRouter(store, executionSocket));
app.use("/api/executions", authenticate, createStepsRouter(store));
app.use("/api/demo", authenticate, createDemoRouter(store));

// Error handling
app.use(errorHandler);

// Metrics endpoint (protected)
app.get("/api/metrics", authenticate, (req: Request, res: Response) => {
  res.json({
    summary: metrics.getSummary(),
    recent: metrics.getMetrics().slice(-50),
  });
});

// Start server
server.listen(PORT, () => {
  logger.info("X-Ray API Server started", { port: PORT });
  console.log(`X-Ray API Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Metrics: http://localhost:${PORT}/api/metrics`);
  console.log(`WebSocket: ws://localhost:${PORT}/ws`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  logger.info("Shutting down server...");
  executionSocket.close();
  store.close();
  server.close(() => {
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  logger.info("Shutting down server...");
  executionSocket.close();
  store.close();
  server.close(() => {
    process.exit(0);
  });
});

// Export socket for use in routes
export { executionSocket };

// Export store for use in demo app (after server setup)
export { SQLiteStore } from "./store/SQLiteStore";
