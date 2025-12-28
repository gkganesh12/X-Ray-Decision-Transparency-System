import { Request } from "express";

// Request.user is now available via express-fix.d.ts
export type AuthenticatedRequest = Request;

