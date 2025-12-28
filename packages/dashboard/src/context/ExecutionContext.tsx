/**
 * Context for real-time execution updates
 */
import { createContext, useContext, ReactNode } from "react";
import { useWebSocket } from "../hooks/useWebSocket";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const WS_URL = API_BASE_URL.replace(/^http/, "ws") + "/ws";

interface ExecutionContextValue {
  isConnected: boolean;
  isReconnecting: boolean;
  lastMessage: any;
}

const ExecutionContext = createContext<ExecutionContextValue | null>(null);

export function ExecutionProvider({ children }: { children: ReactNode }) {
  const { isConnected, isReconnecting, lastMessage } = useWebSocket(WS_URL);

  return (
    <ExecutionContext.Provider value={{ isConnected, isReconnecting, lastMessage }}>
      {children}
    </ExecutionContext.Provider>
  );
}

export function useExecutionContext() {
  const context = useContext(ExecutionContext);
  if (!context) {
    throw new Error("useExecutionContext must be used within ExecutionProvider");
  }
  return context;
}

