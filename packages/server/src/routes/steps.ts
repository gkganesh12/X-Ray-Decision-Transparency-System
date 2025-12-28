/// <reference types="express" />
import type { Request, Response } from "express";
import { Router } from "express";
import type { EventStore } from "@xray/sdk";
import { StepRepository } from "../repositories";
import { ExecutionRepository } from "../repositories";
import { StepService } from "../services";
import { toStepListDTO } from "../dto";
import { asyncHandler } from "../middleware/asyncHandler";
import { NotFoundError } from "../errors";

export function createStepsRouter(store: EventStore): Router {
  const router = Router();

  // Initialize services
  const stepRepository = new StepRepository(store);
  const executionRepository = new ExecutionRepository(store);
  const stepService = new StepService(stepRepository, executionRepository);

  // GET /api/executions/:id/steps - Get all steps for an execution
  router.get("/:id/steps", asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    // Service layer will validate execution exists
    const steps = await stepService.getStepsByExecutionId(id);
    const dto = toStepListDTO(steps);

    res.json({ steps: dto });
  }));

  return router;
}

