# X-Ray Decision Transparency System

A production-grade system for debugging non-deterministic, multi-step algorithmic systems. X-Ray provides **decision-level transparency** by capturing the "why" behind system decisions, not just the "what".

## Overview

X-Ray is designed for systems that make complex decisions through multiple steps:
- LLM-based keyword generation
- Search and retrieval
- Filtering and ranking
- Selection algorithms

Unlike traditional logging or tracing, X-Ray captures:
- **Inputs and outputs** at each step
- **Filters and rules** applied
- **Candidate evaluations** with pass/fail details
- **Selection reasoning** explaining why a choice was made

## Architecture

```
┌─────────────────┐
│  Demo App       │
│  (Node.js)      │
└────────┬────────┘
         │ uses
         ▼
┌─────────────────┐
│  X-Ray SDK      │
│  (TypeScript)   │
└────────┬────────┘
         │ emits events
         ▼
┌─────────────────┐
│  Event Store    │
│  (SQLite)       │
└────────┬────────┘
         │ serves via
         ▼
┌─────────────────┐
│  API Server     │
│  (Express)      │
└────────┬────────┘
         │ REST API
         ▼
┌─────────────────┐
│  Dashboard UI   │
│  (React + Vite) │
└─────────────────┘
```

## Project Structure

This is a monorepo containing:

- **`packages/sdk/`** - X-Ray SDK library
- **`packages/server/`** - API server with SQLite event store
- **`packages/dashboard/`** - React dashboard UI
- **`packages/demo/`** - Demo competitor selection application

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install all dependencies
npm install
```

### Development

```bash
# Start API server and dashboard concurrently
npm run dev

# Or start individually:
npm run server    # API server on http://localhost:3001
npm run dashboard # Dashboard on http://localhost:5173
```

### Run Demo

```bash
# Generate sample execution data
npm run demo
```

This will create 3 sample executions in the database that you can view in the dashboard.

## Usage

### SDK Integration

```typescript
import { XRaySession } from "@xray/sdk";
import { SQLiteStore } from "@xray/server";

// Initialize session
const store = new SQLiteStore();
const xray = new XRaySession({
  name: "my_workflow",
  store,
});

// Create steps
xray.step("apply_filters", (step) => {
  step.input({ candidatesCount: 50 });
  
  step.filters({
    price_range: "0.5x-2x",
    min_rating: 3.8,
    min_reviews: 100,
  });

  step.evaluate(candidates, (candidate) => ({
    price_range: {
      passed: candidate.price >= min && candidate.price <= max,
      detail: `$${candidate.price} is within range`,
    },
    min_rating: {
      passed: candidate.rating >= 3.8,
      detail: `${candidate.rating} >= 3.8`,
    },
  }));

  step.select(bestCandidate.id, "Highest review count");
  step.reasoning("Applied filters to narrow from 50 to 12 candidates");
});

// Complete and persist
await xray.complete();
```

### API Endpoints

- `GET /api/health` - Health check
- `GET /api/executions` - List all executions
- `GET /api/executions/:id` - Get execution details
- `GET /api/executions/:id/steps` - Get steps for an execution

### Dashboard

The dashboard provides:
- **Execution List**: View all executions with metadata
- **Execution Detail**: Step-by-step timeline with expandable details
- **Step Visualization**: Inputs, filters, evaluations, and selections
- **Candidate Table**: Pass/fail status for each evaluated candidate

## Demo Application

The demo implements a **Competitor Product Selection** workflow:

1. **Keyword Generation**: Generate search keywords from product title (mock LLM)
2. **Candidate Search**: Search and retrieve candidate products (mock API)
3. **Filter & Rank**: Apply filters (price, rating, reviews) and select best match

Run `npm run demo` to generate sample data, then view it in the dashboard.

## Key Features

### SDK Features

- **Fluent API**: Clean, readable step definitions
- **Type Safety**: Full TypeScript support
- **Flexible Data**: Schema-agnostic inputs/outputs
- **Immutable Steps**: Data integrity guaranteed
- **Store Abstraction**: Pluggable storage backends

### Dashboard Features

- **Real-time Updates**: Refresh to see new executions
- **Detailed Views**: Expandable step details
- **Visual Indicators**: Color-coded pass/fail status
- **Responsive Design**: Works on all screen sizes
- **JSON Viewer**: Pretty-printed complex data

### Production Ready

- **SQLite Persistence**: Reliable file-based storage
- **Error Handling**: Graceful degradation
- **CORS Support**: Cross-origin API access
- **Health Checks**: Monitoring endpoints
- **Type Safety**: End-to-end TypeScript

## Development

### Build

```bash
# Build all packages
npm run build
```

### Linting

```bash
npm run lint
```

### Project Structure

```
xray-system/
├── packages/
│   ├── sdk/          # X-Ray SDK
│   ├── server/       # API server
│   ├── dashboard/    # React UI
│   └── demo/         # Demo app
├── package.json
├── tsconfig.json
└── README.md
```

## Architecture Decisions

1. **Monorepo**: Shared types, easier development, single build
2. **SQLite**: Production-ready, no external dependencies, file-based
3. **TypeScript**: Type safety, better DX, production quality
4. **React + Vite**: Fast development, modern tooling
5. **Fluent API**: Developer-friendly, readable code
6. **Separation of Concerns**: SDK, store, API, UI are decoupled

## Known Limitations

- Single-node execution storage (no distributed support)
- No schema versioning
- No execution comparison/diffing
- No real-time streaming updates
- No automated decision validation

## Future Enhancements

- Execution comparison and diffing
- Sensitivity analysis on filters
- LLM prompt/version tracking
- Role-based access control
- Streaming updates
- Postgres/ClickHouse support for scale
- Execution replay
- Alerting on decision anomalies

## License

MIT

## Contributing

This is a take-home assignment project. For production use, consider:
- Adding comprehensive tests
- Implementing proper authentication
- Adding rate limiting
- Setting up CI/CD
- Adding monitoring and alerting
- Implementing data retention policies

