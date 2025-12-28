/// <reference types="express" />
import type { Router, Request, Response } from "express";
import { Router as ExpressRouter } from "express";
import type { EventStore } from "@xray/sdk";
import { logger } from "../utils/logger";
import { metrics } from "../utils/metrics";
import { ExecutionRepository } from "../repositories";
import { StepRepository } from "../repositories";
import { ExecutionService } from "../services";
import { StepService } from "../services";
import { toExecutionDTO, toExecutionListDTO, createPaginationDTO } from "../dto";
import { validateExecutionQuery, validateUpdateMetadata } from "../middleware/validation";
import { cacheMiddleware } from "../middleware/cache";
import { asyncHandler } from "../middleware/asyncHandler";
import { NotFoundError } from "../errors";
import type { ExecutionSocket } from "../websocket/ExecutionSocket";

export function createExecutionsRouter(
  store: EventStore,
  executionSocket?: ExecutionSocket | null
): ExpressRouter {
  const router = ExpressRouter();
  
  // Initialize services
  const executionRepository = new ExecutionRepository(store);
  const stepRepository = new StepRepository(store);
  const executionService = new ExecutionService(executionRepository);
  const stepService = new StepService(stepRepository);

  // GET /api/executions - List all executions with pagination and filtering
  router.get("/", cacheMiddleware(30 * 1000), validateExecutionQuery, asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    const query = (req as any).validatedQuery || {};
    const page = query.page || 1;
    const limit = query.limit || 20;

    const result = await executionService.listExecutions(query);
    const pagination = createPaginationDTO(page, limit, result.total);
    const dto = toExecutionListDTO(result.executions, pagination);

    const duration = Date.now() - startTime;
    metrics.gauge("api.executions.list.duration", duration);
    metrics.increment("api.executions.list.success");

    logger.info("Listed executions", { page, limit: limit, total: result.total, duration });

    res.json(dto);
  }));

  // GET /api/executions/:id - Get execution details
  router.get("/:id", cacheMiddleware(60 * 1000), asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    const { id } = req.params;
    const execution = await executionService.getExecution(id);
    const dto = toExecutionDTO(execution);
    
    const duration = Date.now() - startTime;
    metrics.gauge("api.executions.get.duration", duration);
    metrics.increment("api.executions.get.success");
    logger.info("Retrieved execution", { executionId: id, duration });

    res.json(dto);
  }));

  // PATCH /api/executions/:id - Update execution metadata
  router.patch("/:id", validateUpdateMetadata, asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    const { id } = req.params;
    const updates = (req as any).validatedBody;

    const execution = await executionService.updateMetadata(id, updates);
    const dto = toExecutionDTO(execution);
    
    const duration = Date.now() - startTime;
    metrics.gauge("api.executions.update.duration", duration);
    metrics.increment("api.executions.update.success");
    logger.info("Updated execution metadata", { executionId: id, duration });

    // Broadcast update via WebSocket
    if (executionSocket) {
      executionSocket.broadcastExecutionUpdated(dto);
    }

    res.json(dto);
  }));

  // DELETE /api/executions - Bulk delete executions
  router.delete("/", asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({
        error: {
          message: "ids must be a non-empty array",
          code: "VALIDATION_ERROR",
        },
      });
      return;
    }

    await executionService.deleteExecutions(ids);

    const duration = Date.now() - startTime;
    metrics.gauge("api.executions.bulk_delete.duration", duration);
    metrics.increment("api.executions.bulk_delete.success");
    logger.info("Bulk deleted executions", { count: ids.length, duration });

    // Broadcast deletion via WebSocket
    if (executionSocket) {
      ids.forEach((id) => {
        executionSocket.broadcastExecutionUpdate({ id, deleted: true });
      });
    }

    res.json({ deleted: ids.length, ids });
  }));

  return router;
}

