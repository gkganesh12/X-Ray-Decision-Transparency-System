# X-Ray System Architecture

## Overview

The X-Ray system is a monorepo containing four main packages:

1. **SDK** (`packages/sdk`) - Core library for instrumenting decision processes
2. **Server** (`packages/server`) - REST API and WebSocket server
3. **Dashboard** (`packages/dashboard`) - React-based visualization UI
4. **Demo** (`packages/demo`) - Example application demonstrating usage

## Architecture Layers

### SDK Layer

```
┌─────────────────────────────────────┐
│         XRaySession                 │
│  - Manages execution lifecycle      │
│  - Orchestrates step creation        │
│  - Handles hooks and middleware      │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                 │
┌──────▼──────┐  ┌──────▼──────────┐
│ XRayStep    │  │ EventStore      │
│ Builder     │  │ Interface       │
└─────────────┘  └─────────────────┘
                        │
                ┌───────┴────────┐
                │               │
        ┌───────▼────┐  ┌───────▼────────┐
        │InMemoryStore│  │ SQLiteStore   │
        └────────────┘  └───────────────┘
```

### Server Layer

```
┌─────────────────────────────────────┐
│         Express App                 │
│  - Routes                           │
│  - Middleware                       │
│  - WebSocket                        │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────────┐
│  Services │ Repositories    │
│  - Business   │  │  - Data Access │
│  Logic      │  │  - Queries      │
└──────┬─────┘  └──────┬───────────┘
       │                │
       └───────┬────────┘
               │
       ┌───────▼──────────┐
       │   EventStore     │
       │   (SQLiteStore)  │
       └──────────────────┘
```

### Dashboard Layer

```
┌─────────────────────────────────────┐
│         React App                    │
│  - Pages                             │
│  - Components                        │
│  - Hooks                             │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────────┐
│   API       │  │  WebSocket      │
│   Client    │  │  Context        │
└──────┬──────┘  └─────────────────┘
       │
       └───────────┐
                   │
           ┌───────▼────────┐
           │  REST API      │
           │  (Express)     │
           └────────────────┘
```

## Data Flow

### Execution Creation

1. User creates `XRaySession` with name and store
2. Session generates execution ID
3. First step triggers execution save to store
4. Subsequent steps are added via `addStep`
5. `complete()` marks execution as finished

### API Request Flow

1. Request → Middleware (CORS, Security, Rate Limit, Validation)
2. Route Handler → Service Layer
3. Service → Repository
4. Repository → EventStore
5. Response → DTO Transformation
6. WebSocket Broadcast (if applicable)

## Key Design Decisions

### Service Layer Pattern

Business logic is separated from routes and data access:
- Routes handle HTTP concerns
- Services contain business logic
- Repositories handle data access

### Repository Pattern

Abstraction over EventStore with additional query capabilities:
- Filters and aggregations
- Transaction support
- Query optimization

### DTO Layer

API responses use DTOs for:
- Versioning support
- API contract stability
- Response transformation

### Type Safety

Generics throughout SDK for compile-time type checking:
- `XRayStep<TInput, TOutput, TFilters, TMetadata>`
- Builder methods are type-safe
- Prevents runtime type errors

### Extensibility

- Hooks for lifecycle events
- Middleware for step processing
- Decorators for automatic instrumentation
- Pluggable storage backends

## Database Schema

### executions

- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `started_at` (INTEGER, NOT NULL)
- `completed_at` (INTEGER)
- `tags` (TEXT, JSON array)
- `notes` (TEXT)

### steps

- `id` (TEXT, PRIMARY KEY)
- `execution_id` (TEXT, FOREIGN KEY)
- `name` (TEXT, NOT NULL)
- `input` (TEXT, JSON)
- `output` (TEXT, JSON)
- `filters` (TEXT, JSON)
- `evaluations` (TEXT, JSON)
- `selection` (TEXT, JSON)
- `reasoning` (TEXT)
- `metadata` (TEXT, JSON)
- `created_at` (INTEGER, NOT NULL)

## Security

- Rate limiting (100 req/15min default)
- Security headers (XSS, CSRF protection)
- CORS configuration
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)

## Performance

- Response caching (30-60s TTL)
- Database indexes on frequently queried columns
- Pagination for large datasets
- WebSocket for real-time updates (reduces polling)

## Scalability

- Stateless API design
- Pluggable storage (can migrate to PostgreSQL/ClickHouse)
- Horizontal scaling support
- WebSocket connection pooling

