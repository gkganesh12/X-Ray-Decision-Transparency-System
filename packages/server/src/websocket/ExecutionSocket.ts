/**
 * WebSocket handler for real-time execution updates
 * Using optional ws package - gracefully degrades if not available
 */
import type { Server } from "http";
import { logger } from "../utils/logger";

// WebSocket types
interface WebSocketLike {
  send(data: string): void;
  close(): void;
  readyState: number;
  on(event: "close", handler: () => void): void;
  on(event: "error", handler: (error: Error) => void): void;
}

interface WebSocketServerLike {
  on(event: "connection", handler: (ws: WebSocketLike) => void): void;
  close(): void;
}

export class ExecutionSocket {
  private wss: WebSocketServerLike | null = null;
  private clients: Set<WebSocketLike> = new Set();

  constructor(server: Server) {
    // Try to use ws package if available
    try {
      const ws = require("ws");
      this.wss = new ws.WebSocketServer({ server, path: "/ws" });

      if (!this.wss) {
        return;
      }

      this.wss.on("connection", (ws: WebSocketLike) => {
        this.clients.add(ws);
        logger.info("WebSocket client connected", { clientCount: this.clients.size });

        ws.on("close", () => {
          this.clients.delete(ws);
          logger.info("WebSocket client disconnected", { clientCount: this.clients.size });
        });

        ws.on("error", (error: Error) => {
          logger.error("WebSocket error", error);
        });

        // Send welcome message
        ws.send(JSON.stringify({ type: "connected", message: "Connected to X-Ray updates" }));

        // Start heartbeat
        const heartbeatInterval = setInterval(() => {
          if (ws.readyState === 1) { // WebSocket.OPEN
            ws.send(JSON.stringify({ type: "ping" }));
          } else {
            clearInterval(heartbeatInterval);
          }
        }, 30000); // Every 30 seconds

        ws.on("close", () => {
          clearInterval(heartbeatInterval);
        });
      });

      logger.info("WebSocket server initialized", { path: "/ws" });
    } catch (error) {
      // ws package not installed, real-time updates will be disabled
      logger.warn("WebSocket package not installed, real-time updates disabled");
      this.wss = null;
    }
  }

  /**
   * Broadcast execution update to all connected clients
   */
  broadcastExecutionUpdate(execution: any): void {
    if (!this.wss || this.clients.size === 0) return;

    const message = JSON.stringify({
      type: "execution_update",
      data: execution,
    });

    this.broadcast(message);
  }

  /**
   * Broadcast execution created event
   */
  broadcastExecutionCreated(execution: any): void {
    if (!this.wss || this.clients.size === 0) return;

    const message = JSON.stringify({
      type: "execution_created",
      data: execution,
    });

    this.broadcast(message);
  }

  /**
   * Broadcast execution updated event
   */
  broadcastExecutionUpdated(execution: any): void {
    if (!this.wss || this.clients.size === 0) return;

    const message = JSON.stringify({
      type: "execution_updated",
      data: execution,
    });

    this.broadcast(message);
  }

  /**
   * Broadcast message to all connected clients
   */
  private broadcast(message: string): void {
    this.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN = 1
        try {
          client.send(message);
        } catch (error) {
          logger.error("Failed to send WebSocket message", error as Error);
        }
      }
    });
  }

  /**
   * Get number of connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Close all connections and cleanup
   */
  close(): void {
    this.clients.forEach((client) => {
      client.close();
    });
    if (this.wss) {
      this.wss.close();
    }
  }
}
