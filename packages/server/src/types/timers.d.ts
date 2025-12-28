export {};

declare global {
  function setInterval(
    handler: (...args: any[]) => void,
    timeout?: number,
    ...args: any[]
  ): NodeJS.Timeout;

  function clearInterval(id: NodeJS.Timeout): void;
}
