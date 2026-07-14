import { ENV } from '../../config/environment';

export class WebSocketManager {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectInterval = 5000;
  private listeners: Set<(data: any) => void> = new Set();
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(url: string = ENV.wsUrl) {
    this.url = url;
  }

  connect() {
    if (this.socket) return;

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('StadiumOS WebSocket Connected');
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.listeners.forEach((listener) => listener(data));
        } catch (e) {
          console.error('WebSocket failed to parse data:', e);
        }
      };

      this.socket.onclose = () => {
        console.log('StadiumOS WebSocket Disconnected. Retrying...');
        this.socket = null;
        this.scheduleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket operational error occurred:', error);
      };
    } catch (e) {
      console.error('WebSocket failed to establish connection:', e);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectInterval);
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  subscribe(listener: (data: any) => void) {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  send(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket message unsent: Connection is not active.');
    }
  }
}

export const globalSocketManager = typeof window !== 'undefined' ? new WebSocketManager() : null;
export default globalSocketManager;
