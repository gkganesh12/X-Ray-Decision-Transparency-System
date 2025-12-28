/**
 * Unit tests for XRayStepBuilder
 */
import { XRayStepBuilder } from "../src/XRayStep";

describe("XRayStepBuilder", () => {
  describe("constructor", () => {
    it("should create a step builder with a name", () => {
      const builder = new XRayStepBuilder("test_step");
      const step = (builder as any).step;
      expect(step.name).toBe("test_step");
      expect(step.id).toBeDefined();
      expect(step.createdAt).toBeDefined();
    });

    it("should throw error for invalid step name", () => {
      expect(() => {
        new XRayStepBuilder("");
      }).toThrow();
    });
  });

  describe("input", () => {
    it("should set input data", () => {
      const builder = new XRayStepBuilder("test");
      builder.input({ key: "value" });

      const step = (builder as any).step;
      expect(step.input).toEqual({ key: "value" });
    });

    it("should return builder for chaining", () => {
      const builder = new XRayStepBuilder("test");
      const result = builder.input({});
      expect(result).toBe(builder);
    });
  });

  describe("output", () => {
    it("should set output data", () => {
      const builder = new XRayStepBuilder("test");
      builder.output({ result: "success" });

      const step = (builder as any).step;
      expect(step.output).toEqual({ result: "success" });
    });
  });

  describe("filters", () => {
    it("should set filters", () => {
      const builder = new XRayStepBuilder("test");
      builder.filters({ min_price: 10, max_price: 100 });

      const step = (builder as any).step;
      expect(step.filters).toEqual({ min_price: 10, max_price: 100 });
    });
  });

  describe("evaluate", () => {
    it("should evaluate items and create evaluations", () => {
      const builder = new XRayStepBuilder("test");
      const items = [
        { id: "1", price: 50 },
        { id: "2", price: 150 },
      ];

      builder.evaluate(items, (item: any) => ({
        price_range: {
          passed: item.price >= 10 && item.price <= 100,
          detail: `Price: $${item.price}`,
        },
      }));

      const step = (builder as any).step;
      expect(step.evaluations).toHaveLength(2);
      expect(step.evaluations[0].qualified).toBe(true);
      expect(step.evaluations[1].qualified).toBe(false);
    });

    it("should mark as qualified only if all filters pass", () => {
      const builder = new XRayStepBuilder("test");
      const items = [{ id: "1", price: 50, rating: 4.5 }];

      builder.evaluate(items, (item: any) => ({
        price: { passed: item.price <= 100, detail: "OK" },
        rating: { passed: item.rating >= 4.0, detail: "OK" },
      }));

      const step = (builder as any).step;
      expect(step.evaluations[0].qualified).toBe(true);
    });
  });

  describe("select", () => {
    it("should set selection", () => {
      const builder = new XRayStepBuilder("test");
      builder.select("item-123", "Best match");

      const step = (builder as any).step;
      expect(step.selection).toEqual({
        id: "item-123",
        reason: "Best match",
      });
    });
  });

  describe("reasoning", () => {
    it("should set reasoning", () => {
      const builder = new XRayStepBuilder("test");
      builder.reasoning("Applied filters to narrow candidates");

      const step = (builder as any).step;
      expect(step.reasoning).toBe("Applied filters to narrow candidates");
    });
  });

  describe("build", () => {
    it("should build a complete step", () => {
      const builder = new XRayStepBuilder("test");
      builder
        .input({ data: "test" })
        .output({ result: "success" })
        .filters({ filter: "value" })
        .reasoning("Test reasoning")
        .select("id-1", "Best match");

      const step = builder.build();
      expect(step.name).toBe("test");
      expect(step.input).toEqual({ data: "test" });
      expect(step.output).toEqual({ result: "success" });
      expect(step.filters).toEqual({ filter: "value" });
      expect(step.reasoning).toBe("Test reasoning");
      expect(step.selection).toEqual({ id: "id-1", reason: "Best match" });
    });
  });
});

