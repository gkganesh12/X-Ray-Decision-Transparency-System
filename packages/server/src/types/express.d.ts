/// <reference types="express" />
/// <reference types="node" />

// Force Express types to be loaded
// This ensures Express types are available even if type resolution fails

// Explicitly exclude DOM types
declare global {
  // Remove DOM globals that conflict with Express
  var Headers: never;
  var Request: never;
  var Response: never;
  var ReadableStream: never;
  var fetch: never;
}

