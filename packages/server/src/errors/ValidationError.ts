import { AppError } from "./AppError";

/**
 * Error for validation failures (400)
 */
export class ValidationError extends AppError {
  public readonly fields: Record<string, string[]>;

  constructor(
    message: string,
    fields: Record<string, string[]> = {}
  ) {
    super(message, 400, "VALIDATION_ERROR");
    this.fields = fields;
  }

  /**
   * Create validation error from Zod errors
   */
  static fromZodErrors(errors: Array<{ path: (string | number)[]; message: string }>): ValidationError {
    const fields: Record<string, string[]> = {};
    
    errors.forEach((error) => {
      const path = error.path.join(".");
      if (!fields[path]) {
        fields[path] = [];
      }
      fields[path].push(error.message);
    });

    const message = `Validation failed: ${Object.keys(fields).join(", ")}`;
    return new ValidationError(message, fields);
  }
}

