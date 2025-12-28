/// <reference types="express" />
/**
 * Demo routes - Run demo workflows to generate sample data
 */
import type { Router, Request, Response } from "express";
import { Router as ExpressRouter } from "express";
import type { EventStore } from "@xray/sdk";
import { DemoService } from "../services/DemoService";
import { asyncHandler } from "../middleware/asyncHandler";
import { logger } from "../utils/logger";

export function createDemoRouter(store: EventStore): ExpressRouter {
  const router = ExpressRouter();
  const demoService = new DemoService(store);

  /**
   * POST /api/demo/run
   * Run demo workflows to generate sample execution data
   */
  router.post(
    "/run",
    asyncHandler(async (req: Request, res: Response) => {
      const count = parseInt(req.body.count as string) || 3;
      const limitCount = Math.min(Math.max(count, 1), 10); // Limit between 1 and 10

      logger.info("Running demo", { count: limitCount });

      const result = await demoService.runDemo(limitCount);

      logger.info("Demo completed", { executionIds: result.executionIds.length });

      res.json({
        success: true,
        ...result,
      });
    })
  );

  return router;
}

