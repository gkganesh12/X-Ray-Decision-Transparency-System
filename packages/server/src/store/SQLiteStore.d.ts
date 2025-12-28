import type { EventStore, XRayExecution, XRayStep } from "@xray/sdk";
export declare class SQLiteStore implements EventStore {
    private db;
    private schemaPath;
    constructor(dbPath?: string);
    private initializeSchema;
    private migrateSchema;
    saveExecution(execution: XRayExecution): Promise<void>;
    getExecution(id: string): Promise<XRayExecution | null>;
    listExecutions(limit?: number, offset?: number): Promise<XRayExecution[]>;
    countExecutions(): Promise<number>;
    addStep(executionId: string, step: XRayStep): Promise<void>;
    private getStepsForExecution;
    deleteExecution(id: string): Promise<void>;
    deleteExecutions(ids: string[]): Promise<void>;
    close(): void;
}
//# sourceMappingURL=SQLiteStore.d.ts.map