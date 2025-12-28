# Maximizing the X-Ray Decision Transparency System

## 1. Integration Best Practices

### SDK Integration Patterns

#### Pattern 1: Wrap Existing Functions
```typescript
// Before
async function findCompetitor(product: Product): Promise<Product | null> {
  const keywords = await generateKeywords(product);
  const candidates = await searchCandidates(keywords);
  return await filterAndRank(candidates, product);
}

// After - with X-Ray
async function findCompetitor(product: Product): Promise<Product | null> {
  const xray = new XRaySession({
    name: `competitor_find_${product.asin}`,
    store: new SQLiteStore(),
  });

  try {
    const keywords = await generateKeywords(xray, product);
    const candidates = await searchCandidates(xray, keywords);
    const result = await filterAndRank(xray, candidates, product);
    await xray.complete();
    return result;
  } catch (error) {
    await xray.complete(); // Save partial execution
    throw error;
  }
}
```

#### Pattern 2: Middleware/Decorator Pattern
```typescript
function withXRay<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  executionName: string
): T {
  return (async (...args: Parameters<T>) => {
    const xray = new XRaySession({
      name: executionName,
      store: new SQLiteStore(),
    });
    
    try {
      // Inject xray as first parameter
      const result = await fn(xray, ...args);
      await xray.complete();
      return result;
    } catch (error) {
      await xray.complete();
      throw error;
    }
  }) as T;
}

// Usage
const findCompetitor = withXRay(
  async (xray: XRaySession, product: Product) => {
    // Your logic here
  },
  "competitor_find"
);
```

#### Pattern 3: Class-Based Integration
```typescript
class CompetitorFinder {
  private store: EventStore;

  constructor(store?: EventStore) {
    this.store = store || new SQLiteStore();
  }

  async find(product: Product): Promise<Product | null> {
    const xray = new XRaySession({
      name: `competitor_find_${product.asin}`,
      store: this.store,
    });

    // Your workflow here
    await xray.complete();
    return result;
  }
}
```

## 2. Advanced Features to Add

### A. Execution Comparison
```typescript
// Compare two executions to see what changed
async function compareExecutions(
  execId1: string,
  execId2: string
): Promise<ComparisonResult> {
  const exec1 = await store.getExecution(execId1);
  const exec2 = await store.getExecution(execId2);
  
  // Diff steps, filters, selections
  return {
    stepDifferences: diffSteps(exec1.steps, exec2.steps),
    filterChanges: diffFilters(exec1, exec2),
    selectionChanges: diffSelections(exec1, exec2),
  };
}
```

### B. Sensitivity Analysis
```typescript
// Test how filter changes affect outcomes
async function analyzeFilterSensitivity(
  baseExecution: XRayExecution,
  filterVariations: FilterConfig[]
): Promise<SensitivityReport> {
  // Run multiple executions with different filter values
  // Compare outcomes to identify critical thresholds
}
```

### C. Execution Replay
```typescript
// Replay an execution with modified parameters
async function replayExecution(
  executionId: string,
  modifications: Partial<ExecutionConfig>
): Promise<XRayExecution> {
  const original = await store.getExecution(executionId);
  // Recreate workflow with modifications
  // Useful for "what if" scenarios
}
```

### D. Alerting on Anomalies
```typescript
// Detect unusual patterns
async function checkAnomalies(execution: XRayExecution): Promise<Alert[]> {
  const alerts: Alert[] = [];
  
  // Check for unusually low pass rates
  execution.steps.forEach(step => {
    if (step.evaluations) {
      const passRate = step.evaluations.filter(e => e.qualified).length / 
                      step.evaluations.length;
      if (passRate < 0.1) {
        alerts.push({
          type: "low_pass_rate",
          step: step.name,
          passRate,
          message: `Only ${passRate * 100}% of candidates passed filters`,
        });
      }
    }
  });
  
  return alerts;
}
```

## 3. Performance Optimizations

### A. Batch Step Persistence
```typescript
// Instead of saving each step immediately, batch them
class BatchedXRaySession extends XRaySession {
  private stepQueue: XRayStep[] = [];
  private batchSize = 10;

  async step(name: string, callback: (step: XRayStepBuilder) => void) {
    // ... build step ...
    this.stepQueue.push(step);
    
    if (this.stepQueue.length >= this.batchSize) {
      await this.flushSteps();
    }
  }

  private async flushSteps() {
    // Batch insert all queued steps
    await this.store.addStepsBatch(this.execution.id, this.stepQueue);
    this.stepQueue = [];
  }
}
```

### B. Lazy Evaluation Loading
```typescript
// Only load full evaluation details when needed
interface XRayStep {
  // ... existing fields ...
  evaluationsSummary?: {
    total: number;
    passed: number;
    failed: number;
  };
  evaluations?: CandidateEvaluation[]; // Load on demand
}

// In dashboard, load full evaluations only when step is expanded
```

### C. Database Indexing
```sql
-- Add indexes for common queries
CREATE INDEX idx_executions_name ON executions(name);
CREATE INDEX idx_executions_started_at ON executions(started_at);
CREATE INDEX idx_steps_name ON steps(name);
CREATE INDEX idx_steps_created_at ON steps(created_at);

-- Composite index for filtering
CREATE INDEX idx_executions_name_date ON executions(name, started_at);
```

## 4. Real-World Usage Patterns

### Pattern 1: A/B Testing Decision Logic
```typescript
// Compare two different ranking algorithms
async function abTestRanking(
  candidates: Product[],
  algorithmA: RankingFn,
  algorithmB: RankingFn
) {
  const xrayA = new XRaySession({ name: "ranking_algorithm_a" });
  const xrayB = new XRaySession({ name: "ranking_algorithm_b" });
  
  const resultA = await algorithmA(xrayA, candidates);
  const resultB = await algorithmB(xrayB, candidates);
  
  // Compare results in dashboard
  await xrayA.complete();
  await xrayB.complete();
}
```

### Pattern 2: Debugging Production Issues
```typescript
// When a bad decision is made, capture full context
async function debugBadDecision(executionId: string) {
  const execution = await store.getExecution(executionId);
  
  // Analyze each step
  execution.steps.forEach(step => {
    console.log(`Step: ${step.name}`);
    if (step.evaluations) {
      const failures = step.evaluations.filter(e => !e.qualified);
      console.log(`Failed candidates:`, failures);
    }
    if (step.selection) {
      console.log(`Selected:`, step.selection);
    }
  });
}
```

### Pattern 3: Monitoring Decision Quality
```typescript
// Track decision metrics over time
async function trackDecisionMetrics(timeRange: TimeRange) {
  const executions = await store.listExecutions();
  const filtered = executions.filter(e => 
    e.startedAt >= timeRange.start && e.startedAt <= timeRange.end
  );
  
  const metrics = {
    totalExecutions: filtered.length,
    averageSteps: filtered.reduce((sum, e) => sum + e.steps.length, 0) / filtered.length,
    averageCandidatesPerStep: calculateAverageCandidates(filtered),
    filterPassRates: calculatePassRates(filtered),
  };
  
  return metrics;
}
```

## 5. Dashboard Enhancements

### A. Add Search and Filtering
```typescript
// In ExecutionList.tsx
const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "in_progress">("all");

const filteredExecutions = executions.filter(exec => {
  const matchesSearch = exec.name.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesStatus = 
    statusFilter === "all" ||
    (statusFilter === "completed" && exec.completedAt) ||
    (statusFilter === "in_progress" && !exec.completedAt);
  
  return matchesSearch && matchesStatus;
});
```

### B. Add Execution Comparison View
```typescript
// New component: ExecutionComparison.tsx
export function ExecutionComparison({ execId1, execId2 }: Props) {
  const { execution: exec1 } = useExecution(execId1);
  const { execution: exec2 } = useExecution(execId2);
  
  // Side-by-side comparison
  // Highlight differences
  // Show what changed between executions
}
```

### C. Add Export Functionality
```typescript
// Export execution data as JSON or CSV
function exportExecution(execution: XRayExecution, format: "json" | "csv") {
  if (format === "json") {
    const dataStr = JSON.stringify(execution, null, 2);
    downloadFile(dataStr, `${execution.name}.json`, "application/json");
  } else {
    // Convert to CSV format
    const csv = convertToCSV(execution);
    downloadFile(csv, `${execution.name}.csv`, "text/csv");
  }
}
```

## 6. Scaling Considerations

### A. Use Postgres for Production
```typescript
// Create PostgresStore implementing EventStore interface
class PostgresStore implements EventStore {
  constructor(private pool: Pool) {}
  
  async saveExecution(execution: XRayExecution): Promise<void> {
    await this.pool.query(
      `INSERT INTO executions (id, name, started_at, completed_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET ...`,
      [execution.id, execution.name, execution.startedAt, execution.completedAt]
    );
  }
  
  // Implement other methods...
}
```

### B. Add Pagination
```typescript
// In API routes
router.get("/executions", async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  
  const executions = await store.listExecutions(limit, offset);
  const total = await store.countExecutions();
  
  res.json({
    executions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
```

### C. Add Caching
```typescript
// Cache frequently accessed executions
import NodeCache from "node-cache";

const executionCache = new NodeCache({ stdTTL: 300 }); // 5 min TTL

router.get("/executions/:id", async (req, res) => {
  const { id } = req.params;
  
  // Check cache first
  const cached = executionCache.get(id);
  if (cached) {
    return res.json(cached);
  }
  
  const execution = await store.getExecution(id);
  if (execution) {
    executionCache.set(id, execution);
  }
  
  res.json(execution);
});
```

## 7. Integration with Monitoring Tools

### A. Send to DataDog/New Relic
```typescript
// Add custom events to monitoring
import { StatsD } from "hot-shots";

const statsd = new StatsD();

xray.step("filter_and_rank", (step) => {
  // ... step logic ...
  
  const passRate = step.evaluations.filter(e => e.qualified).length / 
                   step.evaluations.length;
  
  // Send metrics
  statsd.gauge("xray.filter_pass_rate", passRate, {
    execution: xray.getId(),
    step: "filter_and_rank",
  });
});
```

### B. Add Structured Logging
```typescript
import winston from "winston";

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: "xray.log" })],
});

// Log each step completion
xray.step("filter_and_rank", (step) => {
  // ... step logic ...
  
  logger.info("Step completed", {
    executionId: xray.getId(),
    stepName: "filter_and_rank",
    candidatesEvaluated: step.evaluations?.length,
    candidatesPassed: step.evaluations?.filter(e => e.qualified).length,
  });
});
```

## 8. Best Practices Summary

1. **Always complete executions** - Even on errors, call `xray.complete()` to save partial data
2. **Use descriptive execution names** - Include context like `competitor_find_${productId}_${timestamp}`
3. **Capture reasoning** - Always use `step.reasoning()` to explain decisions
4. **Be specific in filter details** - Show exact values, not just pass/fail
5. **Include metadata** - Use `step.metadata()` for version info, model names, etc.
6. **Monitor pass rates** - Track filter effectiveness over time
7. **Review failed candidates** - Understand why good candidates were rejected
8. **Compare executions** - Use X-Ray to debug why outcomes changed

## 9. Quick Wins

### Immediate Improvements:
1. ✅ Add execution search/filter in dashboard
2. ✅ Add export functionality (JSON/CSV)
3. ✅ Add execution comparison view
4. ✅ Add pagination for large datasets
5. ✅ Add execution tags/labels for organization
6. ✅ Add bookmarking favorite executions
7. ✅ Add notes/comments on executions
8. ✅ Add execution sharing (generate shareable links)

### Medium-term Enhancements:
1. Add execution replay with modified parameters
2. Add sensitivity analysis for filters
3. Add anomaly detection and alerting
4. Add execution templates/presets
5. Add batch operations (delete, export multiple)
6. Add execution archiving

### Long-term Scaling:
1. Migrate to Postgres/ClickHouse for large scale
2. Add distributed tracing integration
3. Add real-time streaming updates
4. Add ML-based anomaly detection
5. Add execution clustering/grouping
6. Add automated report generation

## 10. Example: Complete Integration

```typescript
// Full-featured integration example
class ProductionCompetitorFinder {
  private store: EventStore;
  private logger: Logger;
  private metrics: MetricsClient;

  constructor(config: Config) {
    this.store = config.store || new SQLiteStore();
    this.logger = config.logger;
    this.metrics = config.metrics;
  }

  async findCompetitor(product: Product): Promise<CompetitorResult> {
    const executionId = `comp_find_${product.asin}_${Date.now()}`;
    const xray = new XRaySession({
      name: executionId,
      store: this.store,
    });

    try {
      // Step 1: Generate keywords
      const keywords = await this.generateKeywords(xray, product);
      
      // Step 2: Search candidates
      const candidates = await this.searchCandidates(xray, keywords);
      
      // Step 3: Filter and rank
      const selected = await this.filterAndRank(xray, candidates, product);
      
      // Complete execution
      await xray.complete();
      
      // Log success
      this.logger.info("Competitor found", {
        executionId,
        productId: product.asin,
        competitorId: selected?.asin,
      });
      
      // Send metrics
      this.metrics.increment("competitor.find.success", {
        hasResult: selected ? "yes" : "no",
      });
      
      return { competitor: selected, executionId };
      
    } catch (error) {
      // Save partial execution for debugging
      await xray.complete();
      
      // Log error
      this.logger.error("Competitor find failed", {
        executionId,
        error: error.message,
        executionId, // Can debug in dashboard
      });
      
      // Send error metrics
      this.metrics.increment("competitor.find.error");
      
      throw error;
    }
  }

  private async generateKeywords(xray: XRaySession, product: Product) {
    await xray.step("keyword_generation", async (step) => {
      step.input({ product });
      step.metadata({ model: "gpt-4", version: "1.0" });
      
      const keywords = await this.llmService.generateKeywords(product);
      
      step.output({ keywords });
      step.reasoning(`Generated ${keywords.length} keywords from product attributes`);
      
      return keywords;
    });
  }
  
  // ... other methods ...
}
```

This comprehensive guide shows you how to maximize the X-Ray system's value in production!

