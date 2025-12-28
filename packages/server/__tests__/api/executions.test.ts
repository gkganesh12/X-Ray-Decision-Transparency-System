/**
 * Integration tests for executions API
 */
import request from "supertest";
import { createTestApp } from "../helpers/testApp";
import { InMemoryStore } from "@xray/sdk";
import type { XRayExecution } from "@xray/sdk";

import type { Express } from "express";

describe("Executions API", () => {
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

  describe("GET /api/executions", () => {
    it("should return empty list when no executions exist", async () => {
      const response = await request(app).get("/api/executions");

      expect(response.status).toBe(200);
      expect(response.body.executions).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });

    it("should return list of executions", async () => {
      const execution: XRayExecution = {
        id: "exec-1",
        name: "test_execution",
        startedAt: Date.now(),
        steps: [],
      };

      await store.saveExecution(execution);

      const response = await request(app).get("/api/executions");

      expect(response.status).toBe(200);
      expect(response.body.executions).toHaveLength(1);
      expect(response.body.executions[0].id).toBe("exec-1");
    });

    it("should support pagination", async () => {
      // Create multiple executions
      for (let i = 0; i < 5; i++) {
        await store.saveExecution({
          id: `exec-${i}`,
          name: `test-${i}`,
          startedAt: Date.now(),
          steps: [],
        });
      }

      const response = await request(app)
        .get("/api/executions")
        .query({ page: 1, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body.executions).toHaveLength(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.total).toBe(5);
    });

    it("should support search filter", async () => {
      await store.saveExecution({
        id: "exec-1",
        name: "test_execution",
        startedAt: Date.now(),
        steps: [],
      });
      await store.saveExecution({
        id: "exec-2",
        name: "other_execution",
        startedAt: Date.now(),
        steps: [],
      });

      const response = await request(app)
        .get("/api/executions")
        .query({ search: "test" });

      expect(response.status).toBe(200);
      expect(response.body.executions).toHaveLength(1);
      expect(response.body.executions[0].name).toContain("test");
    });
  });

  describe("GET /api/executions/:id", () => {
    it("should return execution by id", async () => {
      const execution: XRayExecution = {
        id: "exec-1",
        name: "test_execution",
        startedAt: Date.now(),
        steps: [],
      };

      await store.saveExecution(execution);

      const response = await request(app).get("/api/executions/exec-1");

      expect(response.status).toBe(200);
      expect(response.body.id).toBe("exec-1");
      expect(response.body.name).toBe("test_execution");
    });

    it("should return 404 for non-existent execution", async () => {
      const response = await request(app).get("/api/executions/non-existent");

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PATCH /api/executions/:id", () => {
    it("should update execution metadata", async () => {
      const execution: XRayExecution = {
        id: "exec-1",
        name: "test",
        startedAt: Date.now(),
        steps: [],
      };

      await store.saveExecution(execution);

      const response = await request(app)
        .patch("/api/executions/exec-1")
        .send({ tags: ["tag1", "tag2"], notes: "Test notes" });

      expect(response.status).toBe(200);
      expect(response.body.tags).toEqual(["tag1", "tag2"]);
      expect(response.body.notes).toBe("Test notes");
    });

    it("should return 404 for non-existent execution", async () => {
      const response = await request(app)
        .patch("/api/executions/non-existent")
        .send({ tags: ["tag1"] });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/executions", () => {
    it("should delete multiple executions", async () => {
      await store.saveExecution({
        id: "exec-1",
        name: "test1",
        startedAt: Date.now(),
        steps: [],
      });
      await store.saveExecution({
        id: "exec-2",
        name: "test2",
        startedAt: Date.now(),
        steps: [],
      });

      const response = await request(app)
        .delete("/api/executions")
        .send({ ids: ["exec-1", "exec-2"] });

      expect(response.status).toBe(200);
      expect(response.body.deleted).toBe(2);

      // Verify deletions
      const exec1 = await store.getExecution("exec-1");
      const exec2 = await store.getExecution("exec-2");
      expect(exec1).toBeNull();
      expect(exec2).toBeNull();
    });

    it("should return 400 for invalid request", async () => {
      const response = await request(app)
        .delete("/api/executions")
        .send({ ids: [] });

      expect(response.status).toBe(400);
    });
  });
});

