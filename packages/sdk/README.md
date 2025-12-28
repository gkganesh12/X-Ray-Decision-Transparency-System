# X-Ray SDK

A lightweight TypeScript library for capturing decision-level transparency in multi-step, non-deterministic systems.

## Installation

```bash
npm install @xray/sdk
```

## Quick Start

```typescript
import { XRaySession } from "@xray/sdk";
import { SQLiteStore } from "@xray/server/store";

// Create a session
const store = new SQLiteStore();
const xray = new XRaySession({
  name: "my_workflow",
  store,
});

// Add steps
await xray.step("keyword_generation", (step) => {
  step
    .input({ query: "water bottle" })
    .output({ keywords: ["water", "bottle", "hydration"] })
    .reasoning("Generated keywords from query");
});

await xray.step("filter_and_rank", (step) => {
  const candidates = [/* ... */];
  
  step
    .input({ candidates })
    .filters({
      price_range: { min: 10, max: 50 },
      min_rating: 4.0,
    })
    .evaluate(candidates, (item) => ({
      price_range: {
        passed: item.price >= 10 && item.price <= 50,
        detail: `Price $${item.price} is in range`,
      },
      min_rating: {
        passed: item.rating >= 4.0,
        detail: `Rating ${item.rating} >= 4.0`,
      },
    }))
    .select("product_123", "Highest score based on price and rating");
});

// Complete the execution
await xray.complete();
```

## API Reference

### XRaySession

Main class for managing X-Ray executions.

#### Constructor

```typescript
new XRaySession(options: XRaySessionOptions)
```

**Options:**
- `name: string` - Execution name (required)
- `executionId?: string` - Custom execution ID (optional)
- `store?: EventStore` - Storage backend (optional, defaults to InMemoryStore)
- `stepHooks?: StepHook[]` - Step lifecycle hooks (optional)
- `executionHooks?: ExecutionHook[]` - Execution lifecycle hooks (optional)
- `stepMiddleware?: StepMiddleware[]` - Step processing middleware (optional)

#### Methods

- `step(name: string, callback: (step: XRayStepBuilder) => void | Promise<void>): Promise<this>`
- `batchSteps(steps: Array<{ name: string; callback: ... }>): Promise<this>`
- `complete(): Promise<void>`
- `getId(): string`
- `getExecution(): Readonly<XRayExecution>`

### XRayStepBuilder

Fluent builder for creating step data.

#### Methods

- `input<T>(data: T): this`
- `output<T>(data: T): this`
- `filters<T>(data: T): this`
- `evaluate<T>(items: T[], evaluator: (item: T, index: number) => Record<string, { passed: boolean; detail: string }>): this`
- `select(id: string, reason: string): this`
- `reasoning(text: string): this`
- `metadata<T>(data: T): this`
- `build(): XRayStep`

## Advanced Features

### Hooks

```typescript
const stepHook: StepHook = {
  beforeStep: async (stepName) => {
    console.log(`Starting step: ${stepName}`);
    return true; // Return false to skip
  },
  afterStepCreated: async (step) => {
    // Modify step before persistence
    return step;
  },
  afterStepPersisted: async (step) => {
    console.log(`Step persisted: ${step.id}`);
  },
};

const xray = new XRaySession({
  name: "workflow",
  stepHooks: [stepHook],
});
```

### Middleware

```typescript
const middleware: StepMiddleware = {
  process: (stepName, builder) => {
    // Pre-process step builder
    return builder;
  },
  postProcess: (stepName, builder) => {
    // Post-process step builder
    return builder;
  },
};
```

### Decorators

```typescript
import { withXRayStep } from "@xray/sdk";

const myFunction = withXRayStep(xray, "my_step", async (input: string) => {
  // Function implementation
  return result;
});
```

## Type Safety

The SDK uses generics for type safety:

```typescript
await xray.step("search", (step) => {
  step
    .input<{ query: string }>({ query: "test" })
    .output<{ results: string[] }>({ results: ["result1"] });
});
```

## License

MIT

