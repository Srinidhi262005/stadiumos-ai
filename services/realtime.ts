/**
 * WebSocket client for real-time communication with backend
 */

export interface WebSocketEvent {
  id: string;
  event: string;
  data: Record<string, any>;
  user_id?: string;
  timestamp: string;
}

export interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  connectionId?: string;
  lastHeartbeat?: Date;
  reconnectAttempts: number;
}

type EventHandler = (event: WebSocketEvent) => void;

export class RealtimeClient {
  private ws: WebSocket | null = null;
  private url: string;
  private messageHandlers: Map<string, EventHandler[]> = new Map();
  private connectionStatusHandlers: ((status: ConnectionStatus) => void)[] = [];
  private status: ConnectionStatus = {
    connected: false,
    connecting: false,
    reconnectAttempts: 0,
  };
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private heartbeatTimeout?: NodeJS.Timeout;
  private reconnectTimeout?: NodeJS.Timeout;
  private userId?: string;

  constructor(url: string, userId?: string) {
    this.url = url;
    this.userId = userId;
  }

  /**
   * Connect to WebSocket server
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.status.connecting = true;
        this.notifyStatusChange();

        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.status.connected = true;
          this.status.connecting = false;
          this.status.reconnectAttempts = 0;
          this.reconnectAttempts = 0;
          this.notifyStatusChange();
          console.log("WebSocket connected");
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const wsEvent: WebSocketEvent = JSON.parse(event.data);
            this.handleMessage(wsEvent);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.status.connected = false;
          this.status.connecting = false;
          this.notifyStatusChange();
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("WebSocket disconnected");
          this.status.connected = false;
          this.status.connecting = false;
          this.notifyStatusChange();
          this.attemptReconnect();
        };
      } catch (error) {
        this.status.connecting = false;
        this.notifyStatusChange();
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.status.connected = false;
    this.status.connecting = false;
    this.notifyStatusChange();
  }

  /**
   * Subscribe to WebSocket events
   */
  public on(eventType: string, handler: EventHandler): () => void {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, []);
    }
    this.messageHandlers.get(eventType)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to connection status changes
   */
  public onStatusChange(handler: (status: ConnectionStatus) => void): () => void {
    this.connectionStatusHandlers.push(handler);

    // Return unsubscribe function
    return () => {
      const index = this.connectionStatusHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionStatusHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Get current connection status
   */
  public getStatus(): ConnectionStatus {
    return { ...this.status };
  }

  /**
   * Send message to server (if needed)
   */
  public send(data: any): void {
    if (this.ws && this.status.connected) {
      this.ws.send(JSON.stringify(data));
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: WebSocketEvent): void {
    // Update heartbeat timer
    this.resetHeartbeatTimer();

    // Handle system events
    if (event.event === "system:connection") {
      this.status.connectionId = event.data.connection_id;
      this.notifyStatusChange();
    } else if (event.event === "system:heartbeat") {
      this.status.lastHeartbeat = new Date();
      this.notifyStatusChange();
    }

    // Call registered handlers for this event type
    const handlers = this.messageHandlers.get(event.event) || [];
    handlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${event.event}:`, error);
      }
    });

    // Also call wildcard handlers
    const wildcardHandlers = this.messageHandlers.get("*") || [];
    wildcardHandlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in wildcard event handler:", error);
      }
    });
  }

  /**
   * Notify all status change listeners
   */
  private notifyStatusChange(): void {
    this.connectionStatusHandlers.forEach((handler) => {
      try {
        handler({ ...this.status });
      } catch (error) {
        console.error("Error in status change handler:", error);
      }
    });
  }

  /**
   * Reset heartbeat timer to detect disconnections
   */
  private resetHeartbeatTimer(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
    }
    // If no heartbeat for 60 seconds, consider disconnected
    this.heartbeatTimeout = setTimeout(() => {
      if (this.status.connected) {
        console.warn("Heartbeat timeout - reconnecting...");
        this.disconnect();
        this.attemptReconnect();
      }
    }, 60000);
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        `Failed to reconnect after ${this.maxReconnectAttempts} attempts`
      );
      this.status.connected = false;
      this.notifyStatusChange();
      return;
    }

    this.reconnectAttempts++;
    this.status.reconnectAttempts = this.reconnectAttempts;
    this.notifyStatusChange();

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch((error) => {
        console.error("Reconnection failed:", error);
      });
    }, delay);
  }
}

// Create and export singleton instance
let realtimeClient: RealtimeClient | null = null;

export function initializeRealtimeClient(
  baseUrl: string = "ws://localhost:8000",
  userId?: string
): RealtimeClient {
  if (!realtimeClient) {
    let wsUrl = baseUrl.replace(/^http/, "ws");
    if (!wsUrl.endsWith("/api/v1") && !wsUrl.endsWith("/api/v1/")) {
      wsUrl = `${wsUrl.replace(/\/$/, "")}/api/v1`;
    }
    wsUrl = `${wsUrl.replace(/\/$/, "")}/ws${userId ? `?user_id=${userId}` : ""}`;
    realtimeClient = new RealtimeClient(wsUrl, userId);
  }
  return realtimeClient;
}

export function getRealtimeClient(): RealtimeClient {
  if (!realtimeClient) {
    throw new Error("Realtime client not initialized. Call initializeRealtimeClient first.");
  }
  return realtimeClient;
}

export function resetRealtimeClient(): void {
  if (realtimeClient) {
    realtimeClient.disconnect();
    realtimeClient = null;
  }
}
