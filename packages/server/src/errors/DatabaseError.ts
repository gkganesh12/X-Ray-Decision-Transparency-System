import { AppError } from "./AppError";

/**
 * Error for database operations (500)
 */
export class DatabaseError extends AppError {
  public cause?: Error;

  constructor(message: string, originalError?: Error) {
    super(
      `Database error: ${message}`,
      500,
      "DATABASE_ERROR",
      true
    );
    
    if (originalError) {
      this.cause = originalError;
    }
  }
}

