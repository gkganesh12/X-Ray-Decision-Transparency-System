# X-Ray Decision Transparency System

<div align="center">

![X-Ray Logo](https://img.shields.io/badge/X--Ray-Decision%20Transparency-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

**A production-grade system for debugging non-deterministic, multi-step algorithmic systems**

[Features](#-key-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Architecture](#-architecture)

</div>

---

## 🎯 What is X-Ray?

X-Ray provides **decision-level transparency** by capturing the **"why"** behind system decisions, not just the **"what"**. Unlike traditional logging or tracing that shows you which functions were called and how long they took, X-Ray captures the *reasoning* behind every decision.

### The Problem

Modern software increasingly relies on complex, multi-step decision processes:
- **LLM-based systems** (keyword generation, content evaluation)
- **Search and retrieval** pipelines
- **Filtering and ranking** algorithms
- **Selection and recommendation** systems

When these systems produce unexpected outputs, debugging is extremely difficult. Traditional tools show you *what* happened, but not *why* a particular decision was made.

**Example Scenario:**
A competitor product selection system for e-commerce:
1. LLM generates search keywords (non-deterministic)
2. Search API returns thousands of candidates
3. Filters narrow down based on business rules
4. Ranking algorithm selects the final output

If the selected competitor is wrong, which step failed? Was it the keyword generation? Were filters too strict? Did ranking pick the wrong product? **X-Ray answers these questions.**

### The Solution

X-Ray captures:
- ✅ **Inputs and outputs** at each step
- ✅ **Filters and rules** applied
- ✅ **Candidate evaluations** with pass/fail details
- ✅ **Selection reasoning** explaining why a choice was made
- ✅ **Complete decision trail** for full transparency

---

## ✨ Key Features

### 🛠️ SDK Features

- **Fluent API**: Clean, readable step definitions that read like documentation
- **Type Safety**: Full TypeScript support with generics for compile-time safety
- **Flexible Data**: Schema-agnostic inputs/outputs - works with any data structure
- **Immutable Steps**: Data integrity guaranteed - steps cannot be modified after creation
- **Store Abstraction**: Pluggable storage backends (InMemory, SQLite, easily add PostgreSQL/ClickHouse)
- **Hooks & Middleware**: Extensible with lifecycle hooks and processing middleware
- **Decorators**: Declarative step definition with `@xrayStep` decorator
- **Batch Operations**: Atomic addition of multiple steps

### 📊 Dashboard Features

- **Real-time Updates**: WebSocket integration for live dashboard updates
- **Execution List**: Search, filter, and paginate through all executions
- **Detailed Views**: Expandable step details with full decision trail
- **Visual Indicators**: Color-coded pass/fail status for quick scanning
- **Analytics Dashboard**: Execution trends, step performance, filter effectiveness
- **Execution Comparison**: Side-by-side comparison of two executions
- **Metadata Management**: Add tags and notes to executions
- **Export Functionality**: Download execution data as JSON or CSV
- **Bulk Operations**: Select, delete, or export multiple executions
- **Keyboard Shortcuts**: Power user features for faster navigation
- **Responsive Design**: Works seamlessly on all screen sizes

### 🚀 Production Ready

- **SQLite Persistence**: Reliable file-based storage, no external dependencies
- **JWT Authentication**: Secure access with token-based authentication
- **Error Handling**: Comprehensive error handling with graceful degradation
- **Input Validation**: Zod schemas for robust input validation
- **Rate Limiting**: Protection against abuse
- **Security Headers**: CORS, security headers, and best practices
- **Health Checks**: Monitoring endpoints for system health
- **Type Safety**: End-to-end TypeScript for production confidence
- **Testing Infrastructure**: Unit, integration, and component tests

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Code                          │
│              (Your multi-step decision system)                │
└───────────────────────┬─────────────────────────────────────┘
                        │ uses
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    X-Ray SDK                                 │
│              (TypeScript Library)                            │
│  • Fluent API for step definition                            │
│  • Hooks & Middleware                                        │
│  • Type-safe with generics                                   │
└───────────────────────┬─────────────────────────────────────┘
                        │ emits events
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Event Store                                 │
│              (SQLite / InMemory)                             │
│  • Immutable execution storage                               │
│  • Pluggable backend interface                               │
└───────────────────────┬─────────────────────────────────────┘
                        │ serves via
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  REST API Server                             │
│              (Express.js)                                    │
│  • Repository/Service pattern                                │
│  • DTO layer for API contracts                               │
│  • WebSocket for real-time updates                          │
│  • JWT authentication                                       │
└───────────────────────┬─────────────────────────────────────┘
                        │ REST API + WebSocket
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Dashboard UI                                │
│              (React + Vite)                                  │
│  • Execution visualization                                  │
│  • Analytics & comparison                                    │
│  • Real-time updates                                        │
└─────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Separation of Concerns**: SDK, Store, API, and UI are completely decoupled
2. **Pluggable Architecture**: Easy to swap storage backends
3. **Type Safety**: End-to-end TypeScript with generics
4. **Developer Experience**: Fluent API that's intuitive and readable
5. **Production Focus**: Built with security, performance, and reliability in mind

---

## 📦 Project Structure

This is a **monorepo** containing four main packages:

```
xray-system/
├── packages/
│   ├── sdk/              # X-Ray SDK library
│   │   ├── src/          # Source code
│   │   ├── __tests__/    # Unit tests
│   │   └── package.json
│   │
│   ├── server/           # API server + SQLite store
│   │   ├── src/          # Express server, routes, services
│   │   ├── __tests__/    # Integration tests
│   │   └── package.json
│   │
│   ├── dashboard/        # React dashboard UI
│   │   ├── src/          # React components, pages, hooks
│   │   ├── __tests__/    # Component tests
│   │   └── package.json
│   │
│   └── demo/             # Demo application
│       ├── src/          # Competitor selection workflow
│       └── package.json
│
├── package.json          # Root workspace configuration
├── tsconfig.json         # Shared TypeScript config
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/gkganesh12/X-Ray-Decision-Transparency-System.git
cd X-Ray-Decision-Transparency-System

# Install all dependencies
npm install

# Build all packages
npm run build
```

### Development

Start the API server and dashboard concurrently:

```bash
npm run dev
```

Or start them individually:

```bash
# Terminal 1: API Server
npm run server    # Runs on http://localhost:3001

# Terminal 2: Dashboard
npm run dashboard # Runs on http://localhost:5173
```

### Generate Demo Data

Run the demo application to create sample execution data:

```bash
npm run demo
```

This will create 3 sample executions in the database that you can view in the dashboard.

### Access the Dashboard

1. Open http://localhost:5173 in your browser
2. Login with default credentials (configure in server)
3. View executions, explore step details, and analyze decision trails

---

## 💻 Usage

### Basic SDK Integration

```typescript
import { XRaySession } from "@xray/sdk";
import { SQLiteStore } from "@xray/server";

// Initialize session
const store = new SQLiteStore();
const xray = new XRaySession({
  name: "competitor_selection",
  store,
});

// Create a step
await xray.step("apply_filters", (step) => {
  // Record inputs
  step.input({ 
    candidatesCount: 50,
    referenceProduct: { price: 29.99, rating: 4.2 }
  });
  
  // Record filters applied
  step.filters({
    price_range: { min: 14.99, max: 59.98, rule: "0.5x - 2x of reference" },
    min_rating: { value: 3.8, rule: "Must be at least 3.8 stars" },
    min_reviews: { value: 100, rule: "Must have at least 100 reviews" }
  });

  // Evaluate candidates
  step.evaluate(candidates, (candidate) => ({
    price_range: {
      passed: candidate.price >= 14.99 && candidate.price <= 59.98,
      detail: `$${candidate.price} is within $14.99-$59.98`,
    },
    min_rating: {
      passed: candidate.rating >= 3.8,
      detail: `${candidate.rating} >= 3.8`,
    },
    min_reviews: {
      passed: candidate.reviews >= 100,
      detail: `${candidate.reviews} >= 100`,
    },
  }));

  // Record final selection
  step.select(bestCandidate.id, "Highest review count with strong rating");
  
  // Explain the reasoning
  step.reasoning("Applied filters to narrow from 50 to 12 candidates. Selected best match based on review count, rating, and price proximity.");
});

// Complete and persist
await xray.complete();
```

### Advanced Features

#### Hooks

```typescript
const stepHook = {
  beforeStep: async (stepName) => {
    console.log(`Starting step: ${stepName}`);
    return true; // Return false to skip step
  },
  afterStepCreated: async (step) => {
    // Modify step before persistence
    return step;
  },
};

const xray = new XRaySession({
  name: "workflow",
  stepHooks: [stepHook],
});
```

#### Batch Operations

```typescript
await xray.batchSteps([
  {
    name: "step1",
    callback: (step) => step.input({ data: "value1" }),
  },
  {
    name: "step2",
    callback: (step) => step.input({ data: "value2" }),
  },
]);
```

#### Decorators

```typescript
import { xrayStep } from "@xray/sdk";

@xrayStep(xray, "keyword_generation")
async function generateKeywords(product: Product): Promise<string[]> {
  // Function implementation
  return keywords;
}
```

---

## 📡 API Endpoints

### Authentication

- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Executions

- `GET /api/executions` - List all executions (with pagination, search, filters)
- `GET /api/executions/:id` - Get execution details
- `PATCH /api/executions/:id` - Update execution metadata (tags, notes)
- `DELETE /api/executions` - Delete executions (supports bulk)

### Steps

- `GET /api/executions/:id/steps` - Get all steps for an execution

### System

- `GET /api/health` - Health check endpoint
- `GET /api/metrics` - System metrics (requires authentication)

For detailed API documentation, see [packages/server/API.md](./packages/server/API.md).

---

## 🎨 Dashboard Features

### Execution List View

- **Search**: Find executions by name or ID
- **Filter**: Filter by status (completed, in progress)
- **Pagination**: Navigate through large datasets
- **Bulk Operations**: Select multiple executions for delete/export
- **Real-time Updates**: See new executions as they're created

### Execution Detail View

- **Summary Cards**: Quick overview of execution metrics
- **Step Timeline**: Visual timeline of all steps
- **Expandable Steps**: Click to see full step details:
  - Inputs and outputs
  - Filters applied
  - Candidate evaluations with pass/fail status
  - Selection reasoning
  - Metadata
- **Metadata Editing**: Add tags and notes
- **Export**: Download execution as JSON or CSV

### Analytics Dashboard

- **Execution Trends**: Chart showing execution patterns over time
- **Step Performance**: Average duration per step type
- **Filter Effectiveness**: Which filters are most/least effective
- **Anomaly Detection**: Identify unusual execution patterns

### Execution Comparison

- **Side-by-side View**: Compare two executions
- **Diff Highlighting**: See what changed between runs
- **Step-by-step Comparison**: Compare corresponding steps

---

## 🧪 Development

### Build

```bash
# Build all packages
npm run build

# Build specific package
npm run build --workspace=packages/sdk
```

### Testing

```bash
# Run all tests
npm test

# Run tests for specific package
npm test --workspace=packages/sdk
```

### Linting

```bash
npm run lint
```

### Project Scripts

```bash
npm run dev          # Start server and dashboard concurrently
npm run server       # Start API server only
npm run dashboard    # Start dashboard only
npm run demo         # Run demo application
npm run build        # Build all packages
npm test             # Run all tests
npm run lint         # Lint all packages
```

---

## 🎯 Demo Application

The demo implements a **Competitor Product Selection** workflow:

1. **Keyword Generation**: Generate search keywords from product title (mock LLM)
2. **Candidate Search**: Search and retrieve candidate products (mock API)
3. **Filter & Rank**: Apply filters (price, rating, reviews) and select best match

Each step is fully instrumented with X-Ray, demonstrating:
- Input/output capture
- Filter application
- Candidate evaluation
- Selection reasoning

**Run the demo:**
```bash
npm run demo
```

Then view the executions in the dashboard at http://localhost:5173.

---

## 🏛️ Architecture Decisions

### Why Monorepo?

- **Shared Types**: Single source of truth for TypeScript types
- **Easier Development**: Make changes across packages in one commit
- **Single Build**: Build all packages together
- **Better DX**: Easier to navigate and understand the system

### Why SQLite?

- **Production-ready**: Reliable, ACID-compliant database
- **No External Dependencies**: File-based, no server setup needed
- **Easy Migration**: EventStore interface allows swapping to PostgreSQL/ClickHouse
- **Perfect for MVP**: Ideal for single-node deployments

### Why TypeScript?

- **Type Safety**: Catch errors at compile time
- **Better IDE Support**: Autocomplete, refactoring, navigation
- **Self-documenting**: Types serve as documentation
- **Production Quality**: Industry standard for large codebases

### Why Fluent API?

- **Readable**: Code reads like documentation
- **Composable**: Chain methods naturally
- **Type-safe**: Full TypeScript support
- **Developer-friendly**: Intuitive and easy to learn

---

## 📚 Documentation

- **[README.md](./README.md)** - This file
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed architecture documentation
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[packages/server/API.md](./packages/server/API.md)** - Complete API reference

---

## 🔒 Security

- **JWT Authentication**: Token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Zod schemas for all inputs
- **Security Headers**: CORS, XSS protection, and more
- **SQL Injection Prevention**: Parameterized queries

---

## 🧩 Extensibility

### Custom Storage Backend

```typescript
import { EventStore } from "@xray/sdk";

class MyCustomStore implements EventStore {
  async saveExecution(execution: XRayExecution): Promise<void> {
    // Your implementation
  }
  
  async getExecution(id: string): Promise<XRayExecution | null> {
    // Your implementation
  }
  
  // ... implement other methods
}

const xray = new XRaySession({
  name: "workflow",
  store: new MyCustomStore(),
});
```

### Custom Hooks

```typescript
const customHook: StepHook = {
  beforeStep: async (stepName) => {
    // Your logic
    return true;
  },
  afterStepCreated: async (step) => {
    // Your logic
    return step;
  },
};
```

---

## 🚧 Known Limitations

- **Single-node Storage**: SQLite is file-based, not distributed
- **No Schema Versioning**: Database schema is fixed
- **No Execution Replay**: Cannot replay with modified inputs
- **No ML-based Anomaly Detection**: Basic analytics only
- **No Distributed Tracing**: Single execution scope

---

## 🔮 Future Enhancements

- Execution replay with modified inputs
- Sensitivity analysis on filters
- ML-based anomaly detection
- Distributed storage support (PostgreSQL, ClickHouse)
- Advanced collaboration features
- Execution versioning
- Automated decision validation
- Real-time streaming updates

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

---

## 🙏 Acknowledgments

- Built with TypeScript, React, Express, and SQLite
- Inspired by the need for better debugging tools in AI-driven systems
- Designed with developer experience and production readiness in mind

---

<div align="center">

**Made with ❤️ for better debugging of complex systems**

[⭐ Star this repo](https://github.com/gkganesh12/X-Ray-Decision-Transparency-System) • [📖 Read the docs](./ARCHITECTURE.md) • [🐛 Report a bug](https://github.com/gkganesh12/X-Ray-Decision-Transparency-System/issues)

</div>
