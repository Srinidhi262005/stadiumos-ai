/**
 * Realtime synchronization store for WebSocket events
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getRealtimeClient, ConnectionStatus } from "@/services/realtime";

interface RealtimeStore {
  // Connection state
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  connectionId?: string;
  lastHeartbeat?: Date;

  // Methods
  initializeConnection: () => Promise<void>;
  updateConnectionStatus: (status: ConnectionStatus) => void;
  disconnectWebSocket: () => void;

  // Event subscription (for testing/debugging)
  lastEvent?: any;
  recordEvent: (event: any) => void;
}

export const useRealtimeStore = create<RealtimeStore>()(
  devtools((set, get) => ({
    connectionStatus: {
      connected: false,
      connecting: false,
      reconnectAttempts: 0,
    },
    isConnected: false,
    connectionId: undefined,
    lastHeartbeat: undefined,

    initializeConnection: async () => {
      try {
        const client = getRealtimeClient();

        // Subscribe to status changes
        client.onStatusChange((status) => {
          set(() => ({
            connectionStatus: status,
            isConnected: status.connected,
            connectionId: status.connectionId,
            lastHeartbeat: status.lastHeartbeat,
          }));
        });

        // Connect to WebSocket
        await client.connect();
      } catch (error) {
        console.error("Failed to initialize realtime connection:", error);
      }
    },

    updateConnectionStatus: (status: ConnectionStatus) => {
      set(() => ({
        connectionStatus: status,
        isConnected: status.connected,
        connectionId: status.connectionId,
        lastHeartbeat: status.lastHeartbeat,
      }));
    },

    disconnectWebSocket: () => {
      const client = getRealtimeClient();
      client.disconnect();
      set(() => ({
        connectionStatus: {
          connected: false,
          connecting: false,
          reconnectAttempts: 0,
        },
        isConnected: false,
        connectionId: undefined,
        lastHeartbeat: undefined,
      }));
    },

    recordEvent: (event) => {
      set(() => ({
        lastEvent: event,
      }));
    },
  }))
);

/**
 * Hook to subscribe to WebSocket events
 * Usage: useRealtimeEvent("incident:updated", (event) => { ... })
 */
export function useRealtimeEvent(
  eventType: string,
  handler: (event: any) => void
) {
  const client = getRealtimeClient();

  // Subscribe when hook mounts
  const unsubscribe = client.on(eventType, handler);

  // Unsubscribe when hook unmounts
  return () => unsubscribe();
}
