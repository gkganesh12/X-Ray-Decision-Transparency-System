declare module "@xray/sdk" {
  export type Execution = any;
  export type Step = any;
  export type Evaluation = any;
  export type EventStore = any;

  // aliases used in server code
  export type XRayExecution = Execution;
  export type XRayStep = Step;
}
