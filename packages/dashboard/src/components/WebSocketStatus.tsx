/**
 * WebSocket connection status indicator
 */
interface WebSocketStatusProps {
  isConnected: boolean;
  isReconnecting?: boolean;
}

export function WebSocketStatus({ isConnected, isReconnecting }: WebSocketStatusProps) {
  if (isReconnecting) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
        <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div>
        <span>Reconnecting...</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
        <span>Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
      <span>Disconnected</span>
    </div>
  );
}

