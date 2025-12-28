/**
 * Integration tests for steps API
 */
import request from "supertest";
import { createTestApp } from "../helpers/testApp";
import { InMemoryStore } from "@xray/sdk";
import type { XRayExecution, XRayStep } from "@xray/sdk";

import type { Express } from "express";

describe("Steps API", () => {
  let app: Express;
  let store: InMemoryStore;

  beforeEach(() => {
    // Create fresh store instance for each test
    store = new InMemoryStore();
    // Create fresh app instance with the store
    app = createTestApp(store);
    // Clear store to ensure isolation
    if (store.clear) {
      store.clear();
    }
  });

  afterEach(() => {
    // Cleanup: clear store after each test
    if (store && store.clear) {
      store.clear();
    }
  });

  describe("GET /api/executions/:id/steps", () => {
    it("should return steps for an execution", async () => {
      const execution: XRayExecution = {
        id: "exec-1",
        name: "test",
        startedAt: Date.now(),
        steps: [],
      };

      await store.saveExecution(execution);

      const step: XRayStep = {
        id: "step-1",
        name: "test_step",
        createdAt: Date.now(),
      };

      await store.addStep("exec-1", step);

      const response = await request(app).get("/api/executions/exec-1/steps");

      expect(response.status).toBe(200);
      expect(response.body.steps).toHaveLength(1);
      expect(response.body.steps[0].id).toBe("step-1");
    });

    it("should return empty array when execution has no steps", async () => {
      const execution: XRayExecution = {
        id: "exec-1",
        name: "test",
        startedAt: Date.now(),
        steps: [],
      };

      await store.saveExecution(execution);

      const response = await request(app).get("/api/executions/exec-1/steps");

      expect(response.status).toBe(200);
      expect(response.body.steps).toEqual([]);
    });

    it("should return 404 for non-existent execution", async () => {
      const response = await request(app).get("/api/executions/non-existent/steps");

      expect(response.status).toBe(404);
    });
  });
});

