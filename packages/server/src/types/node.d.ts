export {};

declare global {
  var process: NodeJS.Process;
  var __dirname: string;
  function require(id: string): any;
  const console: Console;
}

