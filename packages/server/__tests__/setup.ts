/**
 * Jest setup file for server tests
 */
import { clearCache } from "../../src/middleware/cache";
import { clearDeduplicationCache } from "../../src/middleware/requestDeduplication";
import { clearRateLimitStore } from "../../src/middleware/rateLimit";

// Clear all global caches before each test
beforeEach(() => {
  clearCache();
  clearDeduplicationCache();
  clearRateLimitStore();
});

// Clear all global caches after each test
afterEach(() => {
  clearCache();
  clearDeduplicationCache();
  clearRateLimitStore();
});

