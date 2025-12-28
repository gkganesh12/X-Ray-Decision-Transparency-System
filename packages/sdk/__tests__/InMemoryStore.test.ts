/**
 * Unit tests for InMemoryStore
 */
import { InMemoryStore } from "../src/store/InMemoryStore";
import type { XRayExecution, XRayStep } from "../src/types";

describe("InMemoryStore", () => {
  let store: InMemoryStore;

  beforeEach(() => {
    store = new InMemoryStore();
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
    });

    it("should update existing execution", async () => {
      const execution: XRayExecution = {
        id: "exec-1",
        name: "test",
        startedAt: Date.now(),
        steps: [],
      };

      await store.saveExecution(execution);
      const updated: XRayExecution = {
        ...execution,
        completedAt: Date.now(),
      };
      await store.saveExecution(updated);

      const retrieved = await store.getExecution("exec-1");
      expect(retrieved?.completedAt).toBeDefined();
    });
  });

  describe("getExecution", () => {
    it("should return null for non-existent execution", async () => {
      const result = await store.getExecution("non-existent");
      expect(result).toBeNull();
    });

    it("should return a copy of the execution", async () => {
      const execution: XRayExecution = {
        id: "exec-1",
        name: "test",
        startedAt: Date.now(),
        steps: [],
      };

      await store.saveExecution(execution);
      const retrieved = await store.getExecution("exec-1");
      
      // Modify retrieved execution
      if (retrieved) {
        retrieved.name = "modified";
      }

      // Original should not be modified
      const original = await store.getExecution("exec-1");
      expect(original?.name).toBe("test");
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
      expect(executions).toHaveLength(2);
    });

    it("should respect limit", async () => {
      for (let i = 0; i < 5; i++) {
        await store.saveExecution({
          id: `exec-${i}`,
          name: `test${i}`,
          startedAt: Date.now(),
          steps: [],
        });
      }

      const executions = await store.listExecutions(3);
      expect(executions).toHaveLength(3);
    });

    it("should respect offset", async () => {
      for (let i = 0; i < 5; i++) {
        await store.saveExecution({
          id: `exec-${i}`,
          name: `test${i}`,
          startedAt: Date.now(),
          steps: [],
        });
      }

      const executions = await store.listExecutions(undefined, 2);
      expect(executions).toHaveLength(3);
    });
  });

  describe("countExecutions", () => {
    it("should return correct count", async () => {
      expect(await store.countExecutions()).toBe(0);

      await store.saveExecution({
        id: "exec-1",
        name: "test",
        startedAt: Date.now(),
        steps: [],
      });

      expect(await store.countExecutions()).toBe(1);
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
      };

      await store.addStep("exec-1", step);

      const retrieved = await store.getExecution("exec-1");
      expect(retrieved?.steps).toHaveLength(1);
      expect(retrieved?.steps[0].id).toBe("step-1");
    });

    it("should throw error if execution not found", async () => {
      const step: XRayStep = {
        id: "step-1",
        name: "test_step",
        createdAt: Date.now(),
      };

      await expect(store.addStep("non-existent", step)).rejects.toThrow();
    });
  });

  describe("deleteExecution", () => {
    it("should delete an execution", async () => {
      await store.saveExecution({
        id: "exec-1",
        name: "test",
        startedAt: Date.now(),
        steps: [],
      });

      await store.deleteExecution("exec-1");
      const result = await store.getExecution("exec-1");
      expect(result).toBeNull();
    });
  });

  describe("deleteExecutions", () => {
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

      await store.deleteExecutions(["exec-1", "exec-2"]);

      expect(await store.getExecution("exec-1")).toBeNull();
      expect(await store.getExecution("exec-2")).toBeNull();
    });
  });
});

