-- X-Ray Event Store Schema

CREATE TABLE IF NOT EXISTS executions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  completed_at INTEGER,
  tags TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS steps (
  id TEXT PRIMARY KEY,
  execution_id TEXT NOT NULL,
  name TEXT NOT NULL,
  input TEXT, -- JSON
  output TEXT, -- JSON
  filters TEXT, -- JSON
  evaluations TEXT, -- JSON array
  selection TEXT, -- JSON
  reasoning TEXT,
  metadata TEXT, -- JSON
  created_at INTEGER NOT NULL,
  FOREIGN KEY (execution_id) REFERENCES executions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_steps_execution_id ON steps(execution_id);
CREATE INDEX IF NOT EXISTS idx_steps_created_at ON steps(created_at);
CREATE INDEX IF NOT EXISTS idx_executions_started_at ON executions(started_at);

