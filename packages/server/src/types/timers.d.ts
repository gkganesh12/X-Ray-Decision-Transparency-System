export {};

declare global {
  function setInterval(
    handler: (...args: any[]) => void,
    timeout?: number,
    ...args: any[]
  ): number;

  function clearInterval(id?: number): void;
}

