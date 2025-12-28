/**
 * Unit tests for XRaySession
 */
import { XRaySession } from "../src/XRaySession";
import { InMemoryStore } from "../src/store/InMemoryStore";
import type { StepHook, ExecutionHook } from "../src/hooks";
import type { StepMiddleware } from "../src/middleware";

describe("XRaySession", () => {
  let store: InMemoryStore;

  beforeEach(() => {
    store = new InMemoryStore();
  });

  describe("constructor", () => {
    it("should create a session with a name", () => {
      const session = new XRaySession({ name: "test_execution", store });
      expect(session).toBeDefined();
    });

    it("should generate an execution ID if not provided", () => {
      const session = new XRaySession({ name: "test", store });
      const execution = (session as any).execution;
      expect(execution.id).toBeDefined();
      expect(typeof execution.id).toBe("string");
    });

    it("should use provided execution ID", () => {
      const session = new XRaySession({
        name: "test",
        store,
        executionId: "custom-id",
      });
      const execution = (session as any).execution;
      expect(execution.id).toBe("custom-id");
    });

    it("should use InMemoryStore by default if no store provided", () => {
      const session = new XRaySession({ name: "test" });
      expect((session as any).store).toBeDefined();
    });

    it("should throw error for invalid execution name", () => {
      expect(() => {
        new XRaySession({ name: "", store });
      }).toThrow();
    });
  });

  describe("step", () => {
    it("should create a step", async () => {
      const session = new XRaySession({ name: "test", store });
      await session.step("test_step", (step: any) => {
        step.input({ data: "test" });
      });

      const execution = await store.getExecution((session as any).execution.id);
      expect(execution?.steps).toHaveLength(1);
      expect(execution?.steps[0].name).toBe("test_step");
    });

    it("should save execution before first step", async () => {
      const session = new XRaySession({ name: "test", store });
      await session.step("step1", (step: any) => {
        step.input({});
      });

      const execution = await store.getExecution((session as any).execution.id);
      expect(execution).toBeDefined();
      expect(execution?.steps).toHaveLength(1);
    });

    it("should throw error when adding step to completed execution", async () => {
      const session = new XRaySession({ name: "test", store });
      await session.complete();

      await expect(
        session.step("step", (step: any) => {
          step.input({});
        })
      ).rejects.toThrow("Cannot add steps to a completed execution");
    });

    it("should call step hooks before step creation", async () => {
      const beforeStepHook = jest.fn().mockResolvedValue(true);
      const stepHook: StepHook = { beforeStep: beforeStepHook };

      const session = new XRaySession({
        name: "test",
        store,
        stepHooks: [stepHook],
      });

      await session.step("test_step", (step: any) => {
        step.input({});
      });

      expect(beforeStepHook).toHaveBeenCalledWith("test_step");
    });

    it("should skip step if hook returns false", async () => {
      const stepHook: StepHook = {
        beforeStep: jest.fn().mockResolvedValue(false),
      };

      const session = new XRaySession({
        name: "test",
        store,
        stepHooks: [stepHook],
      });

      await session.step("test_step", (step: any) => {
        step.input({});
      });

      const execution = await store.getExecution((session as any).execution.id);
      expect(execution?.steps).toHaveLength(0);
    });

    it("should apply middleware", async () => {
      const processMiddleware = jest.fn((name, builder) => builder);
      const middleware: StepMiddleware = {
        process: processMiddleware,
      };

      const session = new XRaySession({
        name: "test",
        store,
        stepMiddleware: [middleware],
      });

      await session.step("test_step", (step: any) => {
        step.input({});
      });

      expect(processMiddleware).toHaveBeenCalled();
    });
  });

  describe("complete", () => {
    it("should mark execution as completed", async () => {
      const session = new XRaySession({ name: "test", store });
      await session.complete();

      const execution = await store.getExecution((session as any).execution.id);
      expect(execution?.completedAt).toBeDefined();
      expect((session as any).isCompleted).toBe(true);
    });

    it("should call execution hooks on completion", async () => {
      const onExecutionComplete = jest.fn();
      const executionHook: ExecutionHook = {
        onExecutionComplete,
      };

      const session = new XRaySession({
        name: "test",
        store,
        executionHooks: [executionHook],
      });

      await session.complete();

      expect(onExecutionComplete).toHaveBeenCalled();
    });

    it("should save execution on completion", async () => {
      const session = new XRaySession({ name: "test", store });
      await session.complete();

      const execution = await store.getExecution((session as any).execution.id);
      expect(execution?.completedAt).toBeDefined();
    });
  });

  describe("batchSteps", () => {
    it("should add multiple steps atomically", async () => {
      const session = new XRaySession({ name: "test", store });
      await session.batchSteps([
        { name: "step1", callback: (s: any) => s.input({ data: 1 }) },
        { name: "step2", callback: (s: any) => s.input({ data: 2 }) },
      ]);

      const execution = await store.getExecution((session as any).execution.id);
      expect(execution?.steps).toHaveLength(2);
    });
  });
});

