/**
 * XRayStep - Builder for creating X-Ray step data
 */
import type { CandidateEvaluation, XRayStep as XRayStepType } from "./types";
import { validateStepName } from "./validation/parameterValidation";

export class XRayStepBuilder {
  private step: Partial<XRayStepType> = {
    id: this.generateId(),
    createdAt: Date.now(),
  };

  constructor(name: string) {
    validateStepName(name);
    this.step.name = name;
  }

  /**
   * Record inputs to the step
   * @template TInput - Type of the input data
   */
  input<TInput = unknown>(data: TInput): this {
    this.step.input = data;
    return this;
  }

  /**
   * Record outputs of the step
   * @template TOutput - Type of the output data
   */
  output<TOutput = unknown>(data: TOutput): this {
    this.step.output = data;
    return this;
  }

  /**
   * Describe applied filters or rules
   * @template TFilters - Type of the filters object
   */
  filters<TFilters extends Record<string, unknown> = Record<string, unknown>>(
    data: TFilters
  ): this {
    this.step.filters = data;
    return this;
  }

  /**
   * Evaluate multiple candidates against filters
   * @param items Array of items to evaluate
   * @param evaluator Function that returns filter results for each item
   */
  evaluate<T>(
    items: T[],
    evaluator: (item: T, index: number) => {
      [filterName: string]: { passed: boolean; detail: string };
    }
  ): this {
    const evaluations: CandidateEvaluation[] = items.map((item, index) => {
      const results = evaluator(item, index);
      const passed = Object.values(results).every((r) => r.passed);

      return {
        id: this.generateId(),
        label: this.getItemLabel(item),
        metrics: this.extractMetrics(item),
        results,
        qualified: passed,
      };
    });

    this.step.evaluations = evaluations;
    return this;
  }

  /**
   * Record final selection from evaluated candidates
   */
  select(id: string, reason: string): this {
    this.step.selection = { id, reason };
    return this;
  }

  /**
   * Add free-form explanation
   */
  reasoning(text: string): this {
    this.step.reasoning = text;
    return this;
  }

  /**
   * Add arbitrary metadata
   * @template TMetadata - Type of the metadata object
   */
  metadata<TMetadata extends Record<string, unknown> = Record<string, unknown>>(
    data: TMetadata
  ): this {
    this.step.metadata = { ...this.step.metadata, ...data };
    return this;
  }

  /**
   * Build the final step (immutable)
   */
  build(): XRayStepType {
    if (!this.step.name) {
      throw new Error("Step name is required");
    }

    return {
      id: this.step.id!,
      name: this.step.name,
      createdAt: this.step.createdAt!,
      ...(this.step.input !== undefined && { input: this.step.input }),
      ...(this.step.output !== undefined && { output: this.step.output }),
      ...(this.step.filters && { filters: this.step.filters }),
      ...(this.step.evaluations && { evaluations: this.step.evaluations }),
      ...(this.step.selection && { selection: this.step.selection }),
      ...(this.step.reasoning && { reasoning: this.step.reasoning }),
      ...(this.step.metadata && { metadata: this.step.metadata }),
    };
  }

  private generateId(): string {
    return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getItemLabel(item: unknown): string {
    if (typeof item === "string") return item;
    if (typeof item === "object" && item !== null) {
      const obj = item as Record<string, unknown>;
      return (
        (obj.title as string) ||
        (obj.name as string) ||
        (obj.id as string) ||
        (obj.label as string) ||
        JSON.stringify(item)
      );
    }
    return String(item);
  }

  private extractMetrics(item: unknown): Record<string, number> | undefined {
    if (typeof item !== "object" || item === null) return undefined;

    const metrics: Record<string, number> = {};
    const metricKeys = ["price", "rating", "reviews", "score", "count", "value"];
    const obj = item as Record<string, unknown>;

    for (const key of metricKeys) {
      if (typeof obj[key] === "number") {
        metrics[key] = obj[key] as number;
      }
    }

    return Object.keys(metrics).length > 0 ? metrics : undefined;
  }
}

