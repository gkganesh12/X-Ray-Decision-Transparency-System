import type { XRayExecution } from "@xray/sdk";

/**
 * Export execution as JSON
 */
export function exportExecutionAsJSON(execution: XRayExecution): void {
  const dataStr = JSON.stringify(execution, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${execution.name}_${execution.id}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export multiple executions as JSON array
 */
export function exportExecutionsAsJSON(executions: XRayExecution[]): void {
  const dataStr = JSON.stringify(executions, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `xray_executions_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert execution to CSV row
 */
function executionToCSVRow(execution: XRayExecution): string {
  const name = escapeCSV(execution.name);
  const id = escapeCSV(execution.id);
  const startedAt = new Date(execution.startedAt).toISOString();
  const completedAt = execution.completedAt
    ? new Date(execution.completedAt).toISOString()
    : "";
  const status = execution.completedAt ? "Completed" : "In Progress";
  const steps = execution.steps.length;
  const duration = execution.completedAt
    ? execution.completedAt - execution.startedAt
    : "";

  return `${name},${id},${startedAt},${completedAt},${status},${steps},${duration}`;
}

/**
 * Escape CSV values
 */
function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Export execution as CSV
 */
export function exportExecutionAsCSV(execution: XRayExecution): void {
  const headers = "Name,ID,Started At,Completed At,Status,Steps,Duration (ms)\n";
  const row = executionToCSVRow(execution);
  const csv = headers + row;

  const dataBlob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${execution.name}_${execution.id}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export multiple executions as CSV
 */
export function exportExecutionsAsCSV(executions: XRayExecution[]): void {
  const headers = "Name,ID,Started At,Completed At,Status,Steps,Duration (ms)\n";
  const rows = executions.map(executionToCSVRow).join("\n");
  const csv = headers + rows;

  const dataBlob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `xray_executions_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

