# X-Ray API Documentation

REST API for accessing X-Ray execution data.

## Base URL

```
http://localhost:3001/api
```

## Endpoints

### GET /executions

List executions with pagination and filtering.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `status` (string, optional) - Filter by status: "all", "completed", "in_progress"
- `tags` (string, optional) - Comma-separated tags
- `startDate` (number, optional) - Start timestamp
- `endDate` (number, optional) - End timestamp
- `minSteps` (number, optional) - Minimum step count
- `maxSteps` (number, optional) - Maximum step count
- `search` (string, optional) - Search in name, ID, or step names

**Response:**
```json
{
  "executions": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### GET /executions/:id

Get execution details.

**Response:**
```json
{
  "id": "exec_123",
  "name": "workflow",
  "startedAt": 1234567890,
  "completedAt": 1234567895,
  "steps": [...],
  "tags": ["tag1"],
  "notes": "Notes"
}
```

### PATCH /executions/:id

Update execution metadata.

**Request Body:**
```json
{
  "tags": ["tag1", "tag2"],
  "notes": "Updated notes"
}
```

### DELETE /executions

Bulk delete executions.

**Request Body:**
```json
{
  "ids": ["exec_1", "exec_2"]
}
```

### GET /executions/:id/steps

Get all steps for an execution.

**Response:**
```json
[
  {
    "id": "step_1",
    "name": "step_name",
    "input": {...},
    "output": {...},
    ...
  }
]
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/metrics

Get server metrics.

**Response:**
```json
{
  "summary": {...},
  "recent": [...]
}
```

## WebSocket

Connect to `ws://localhost:3001/ws` for real-time updates.

**Message Types:**
- `connected` - Connection established
- `execution_created` - New execution created
- `execution_updated` - Execution updated
- `execution_update` - Generic execution update

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "fields": {...} // For validation errors
  }
}
```

**Status Codes:**
- `400` - Bad Request (validation error)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

## Rate Limiting

Default: 100 requests per 15 minutes per IP.

Rate limit headers:
- `X-RateLimit-Limit` - Maximum requests
- `X-RateLimit-Remaining` - Remaining requests
- `Retry-After` - Seconds to wait (when rate limited)

