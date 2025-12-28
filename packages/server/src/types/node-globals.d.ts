/// <reference types="node" />

export {};

declare global {
  var process: NodeJS.Process;
  var __dirname: string;
  var console: Console;
  function require(id: string): any;
}
