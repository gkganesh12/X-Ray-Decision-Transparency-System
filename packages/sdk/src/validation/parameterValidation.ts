/**
 * Parameter validation for SDK methods
 */

export function validateExecutionId(id: string): void {
  if (!id || typeof id !== "string" || id.trim().length === 0) {
    throw new Error("Execution ID must be a non-empty string");
  }
}

export function validateStepName(name: string): void {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new Error("Step name must be a non-empty string");
  }
}

export function validateExecutionName(name: string): void {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new Error("Execution name must be a non-empty string");
  }
}

export function validateTags(tags: unknown): void {
  if (tags === undefined) {
    return; // Tags are optional
  }
  if (!Array.isArray(tags)) {
    throw new Error("Tags must be an array");
  }
  if (!tags.every((tag) => typeof tag === "string")) {
    throw new Error("All tags must be strings");
  }
}

export function validateNotes(notes: unknown): void {
  if (notes === undefined || notes === null) {
    return; // Notes are optional
  }
  if (typeof notes !== "string") {
    throw new Error("Notes must be a string");
  }
}

