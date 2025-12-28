/**
 * Integration tests for SQLiteStore
 */
import { SQLiteStore } from "../../src/store/SQLiteStore";
import type { XRayExecution, XRayStep } from "@xray/sdk";
import { join } from "path";
import { unlinkSync } from "fs";

describe("SQLiteStore", () => {
  let store: SQLiteStore;
  const testDbPath = join(__dirname, "../../data/test-xray.db");

  beforeEach(() => {
    // Clean up test database if it exists
    try {
      unlinkSync(testDbPath);
    } catch {
      // Ignore if file doesn't exist
    }
    store = new SQLiteStore(testDbPath);
  });

  afterEach(() => {
    store.close();
    // Clean up test database
    try {
      unlinkSync(testDbPath);
    } catch {
      // Ignore if file doesn't exist
    }
  });

  describe("saveExecution", () => {
    it("should save an execution", async () => {
      const execution: XRayExecution = {
        id: "exec-1",
        name: "test",
        startedAt: Date.now(),
        steps: [],
      };

      await store.saveExecution(execution);
      const retrieved = await store.getExecution("exec-1");

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe("exec-1");
      expect(retrieved?.name).toBe("test");
    });
  });

  describe("getExecution", () => {
    it("should return null for non-existent execution", async () => {
      const result = await store.getExecution("non-existent");
      expect(result).toBeNull();
    });
  });

  describe("addStep", () => {
    it("should add a step to an execution", async () => {
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
        input: { data: "test" },
      };

      await store.addStep("exec-1", step);

      const retrieved = await store.getExecution("exec-1");
      expect(retrieved?.steps).toHaveLength(1);
      expect(retrieved?.steps[0].id).toBe("step-1");
    });
  });

  describe("listExecutions", () => {
    it("should return all executions", async () => {
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

      const executions = await store.listExecutions();
      expect(executions.length).toBeGreaterThanOrEqual(2);
    });
  });
});

