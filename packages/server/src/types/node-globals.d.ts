export {};

declare global {
  const process: NodeJS.Process;
  const __dirname: string;
  function require(id: string): any;
}

