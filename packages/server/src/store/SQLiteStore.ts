/**
 * SQLite implementation of EventStore for production persistence
 */
import Database from "better-sqlite3";
import { join } from "path";
import { readFileSync } from "fs";
import type { EventStore, XRayExecution, XRayStep } from "@xray/sdk";

export class SQLiteStore implements EventStore {
  private db: Database.Database;
  private schemaPath: string;

  constructor(dbPath?: string) {
    const dataDir = process.env.DB_PATH
      ? process.env.DB_PATH.replace(/\/[^/]+\.db$/, "")
      : join(__dirname, "../../data");
    const finalDbPath =
      dbPath || process.env.DB_PATH || join(dataDir, "xray.db");

    // Ensure data directory exists
    try {
      require("fs").mkdirSync(dataDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    this.db = new Database(finalDbPath);
    // Schema path - will use inline fallback if file not found
    this.schemaPath = join(__dirname, "schema.sql");
    this.initializeSchema();
  }

  private initializeSchema(): void {
    try {
      const schema = readFileSync(this.schemaPath, "utf-8");
      this.db.exec(schema);
    } catch (error) {
      // Fallback: if schema file not found (e.g., in production build), use inline schema
      const inlineSchema = `
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
          input TEXT,
          output TEXT,
          filters TEXT,
          evaluations TEXT,
          selection TEXT,
          reasoning TEXT,
          metadata TEXT,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (execution_id) REFERENCES executions(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_steps_execution_id ON steps(execution_id);
        CREATE INDEX IF NOT EXISTS idx_steps_created_at ON steps(created_at);
        CREATE INDEX IF NOT EXISTS idx_executions_started_at ON executions(started_at);
      `;
      this.db.exec(inlineSchema);
    }

    // Migrate existing databases to add tags and notes columns if they don't exist
    this.migrateSchema();
  }

  private migrateSchema(): void {
    try {
      // First check if the executions table exists
      const tableExists = this.db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='executions'"
        )
        .get();
      
      if (!tableExists) {
        // Table doesn't exist, schema initialization will create it with all columns
        return;
      }

      // Check if tags column exists
      const tableInfo = this.db.prepare("PRAGMA table_info(executions)").all() as Array<{
        name: string;
      }>;
      const columnNames = tableInfo.map((col) => col.name);

      if (!columnNames.includes("tags")) {
        console.log("Migrating database: Adding 'tags' column to executions table");
        this.db.exec("ALTER TABLE executions ADD COLUMN tags TEXT");
      }

      if (!columnNames.includes("notes")) {
        console.log("Migrating database: Adding 'notes' column to executions table");
        this.db.exec("ALTER TABLE executions ADD COLUMN notes TEXT");
      }
    } catch (error) {
      // Migration failed - log error but don't throw
      console.error("Schema migration error:", error);
      // Re-throw if it's a critical error that prevents operation
      if (error instanceof Error && error.message.includes("no such table")) {
        // Table doesn't exist yet, which is fine - it will be created by schema initialization
        return;
      }
    }
  }

  async saveExecution(execution: XRayExecution): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO executions (id, name, started_at, completed_at, tags, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      execution.id,
      execution.name,
      execution.startedAt,
      execution.completedAt || null,
      execution.tags ? JSON.stringify(execution.tags) : null,
      execution.notes || null
    );

    // Save all steps
    for (const step of execution.steps) {
      await this.addStep(execution.id, step);
    }
  }

  async getExecution(id: string): Promise<XRayExecution | null> {
    const execStmt = this.db.prepare("SELECT * FROM executions WHERE id = ?");
    const execRow = execStmt.get(id) as any;

    if (!execRow) {
      return null;
    }

    const steps = await this.getStepsForExecution(id);

    return {
      id: execRow.id,
      name: execRow.name,
      startedAt: execRow.started_at,
      completedAt: execRow.completed_at || undefined,
      steps,
      ...(execRow.tags && { tags: JSON.parse(execRow.tags) }),
      ...(execRow.notes && { notes: execRow.notes }),
    };
  }

  async listExecutions(limit?: number, offset?: number): Promise<XRayExecution[]> {
    let query = `SELECT * FROM executions ORDER BY started_at DESC`;
    const params: any[] = [];

    if (limit !== undefined) {
      query += ` LIMIT ?`;
      params.push(limit);
      if (offset !== undefined) {
        query += ` OFFSET ?`;
        params.push(offset);
      }
    }

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];

    const executions: XRayExecution[] = [];

    for (const row of rows) {
      const steps = await this.getStepsForExecution(row.id);
      executions.push({
        id: row.id,
        name: row.name,
        startedAt: row.started_at,
        completedAt: row.completed_at || undefined,
        steps,
        ...(row.tags && { tags: JSON.parse(row.tags) }),
        ...(row.notes && { notes: row.notes }),
      });
    }

    return executions;
  }

  async countExecutions(): Promise<number> {
    const stmt = this.db.prepare("SELECT COUNT(*) as count FROM executions");
    const result = stmt.get() as { count: number };
    return result.count;
  }

  async addStep(executionId: string, step: XRayStep): Promise<void> {
    // Check if step already exists
    const existingStmt = this.db.prepare("SELECT id FROM steps WHERE id = ?");
    const existing = existingStmt.get(step.id);

    if (existing) {
      // Update existing step
      const updateStmt = this.db.prepare(`
        UPDATE steps SET
          name = ?,
          input = ?,
          output = ?,
          filters = ?,
          evaluations = ?,
          selection = ?,
          reasoning = ?,
          metadata = ?,
          created_at = ?
        WHERE id = ?
      `);

      updateStmt.run(
        step.name,
        step.input ? JSON.stringify(step.input) : null,
        step.output ? JSON.stringify(step.output) : null,
        step.filters ? JSON.stringify(step.filters) : null,
        step.evaluations ? JSON.stringify(step.evaluations) : null,
        step.selection ? JSON.stringify(step.selection) : null,
        step.reasoning || null,
        step.metadata ? JSON.stringify(step.metadata) : null,
        step.createdAt,
        step.id
      );
    } else {
      // Insert new step
      const insertStmt = this.db.prepare(`
        INSERT INTO steps (
          id, execution_id, name, input, output, filters,
          evaluations, selection, reasoning, metadata, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertStmt.run(
        step.id,
        executionId,
        step.name,
        step.input ? JSON.stringify(step.input) : null,
        step.output ? JSON.stringify(step.output) : null,
        step.filters ? JSON.stringify(step.filters) : null,
        step.evaluations ? JSON.stringify(step.evaluations) : null,
        step.selection ? JSON.stringify(step.selection) : null,
        step.reasoning || null,
        step.metadata ? JSON.stringify(step.metadata) : null,
        step.createdAt
      );
    }
  }

  private async getStepsForExecution(executionId: string): Promise<XRayStep[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM steps 
      WHERE execution_id = ? 
      ORDER BY created_at ASC
    `);
    const rows = stmt.all(executionId) as any[];

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
      ...(row.input && { input: JSON.parse(row.input) }),
      ...(row.output && { output: JSON.parse(row.output) }),
      ...(row.filters && { filters: JSON.parse(row.filters) }),
      ...(row.evaluations && { evaluations: JSON.parse(row.evaluations) }),
      ...(row.selection && { selection: JSON.parse(row.selection) }),
      ...(row.reasoning && { reasoning: row.reasoning }),
      ...(row.metadata && { metadata: JSON.parse(row.metadata) }),
    }));
  }

        async deleteExecution(id: string): Promise<void> {
          const stmt = this.db.prepare("DELETE FROM executions WHERE id = ?");
          stmt.run(id);
        }

        async deleteExecutions(ids: string[]): Promise<void> {
          const placeholders = ids.map(() => "?").join(",");
          const stmt = this.db.prepare(`DELETE FROM executions WHERE id IN (${placeholders})`);
          stmt.run(...ids);
        }

        close(): void {
          this.db.close();
        }
      }

