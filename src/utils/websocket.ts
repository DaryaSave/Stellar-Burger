import { getCookie } from './cookie';

export const WS_BASE_URL = 'wss://norma.nomoreparties.space';

export const createWebSocketUrl = (
  endpoint: string,
  withAuth: boolean = false
): string => {
  const baseUrl = `${WS_BASE_URL}${endpoint}`;

  if (withAuth) {
    const accessToken = getCookie('accessToken');
    if (accessToken) {
      const token = accessToken.replace('Bearer ', '');
      return `${baseUrl}?token=${token}`;
    }
  }

  return baseUrl;
};

export type WSStatus = 'CONNECTING' | 'ONLINE' | 'OFFLINE';

export interface WSMessage {
  success: boolean;
  orders: any[];
  total?: number;
  totalToday?: number;
  message?: string;
}

export class WebSocketService {
  constructor(
    url: string,
    onMessage: (data: WSMessage) => void,
    onStatusChange: (status: WSStatus) => void
  ) {
    this.url = url;
    this.onMessage = onMessage;
    this.onStatusChange = onStatusChange;
  }

  private ws: WebSocket | null = null;
  private readonly url: string;
  private readonly onMessage: (data: WSMessage) => void;
  private readonly onStatusChange: (status: WSStatus) => void;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 3;
  private readonly reconnectDelay = 3000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;

  private getCloseReason(code: number): string {
    switch (code) {
      case 1006:
        return 'Connection lost';
      case 1002:
        return 'Protocol error';
      case 1003:
        return 'Unsupported data';
      case 1005:
        return 'No status received';
      case 1015:
        return 'TLS handshake error';
      default:
        return 'Unknown error';
    }
  }

  private tryReconnect() {
    if (
      this.reconnectAttempts < this.maxReconnectAttempts &&
      !this.isConnecting
    ) {
      this.reconnectAttempts++;

      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }

      const delay =
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      this.reconnectTimer = setTimeout(
        () => {
          this.connect();
        },
        Math.min(delay, 30000)
      );
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn(
        'WebSocket: Max reconnection attempts reached. Stopping reconnections.'
      );
      this.onStatusChange('OFFLINE');
    }
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    try {
      new URL(this.url);
    } catch (error) {
      console.error('Invalid WebSocket URL:', this.url);
      return;
    }

    this.isConnecting = true;
    this.onStatusChange('CONNECTING');

    try {
      this.ws = new WebSocket(this.url);
    } catch (error) {
      this.isConnecting = false;
      this.onStatusChange('OFFLINE');
      return;
    }

    this.ws.onopen = () => {
      this.isConnecting = false;
      this.onStatusChange('ONLINE');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessage(data);
      } catch (error) {}
    };

    this.ws.onclose = (event) => {
      this.isConnecting = false;
      this.onStatusChange('OFFLINE');

      if (event.code !== 1000) {
        if (event.code === 1006 || event.code === 1002 || event.code === 1003) {
          console.warn(
            `WebSocket closed with code: ${event.code} (${this.getCloseReason(event.code)}). Limiting reconnection attempts.`
          );

          this.reconnectAttempts = Math.max(
            this.reconnectAttempts,
            this.maxReconnectAttempts - 1
          );
        } else {
          console.warn(
            `WebSocket closed with code: ${event.code}, reason: ${event.reason}`
          );
        }
        this.tryReconnect();
      }
    };

    this.ws.onerror = () => {
      this.isConnecting = false;
      this.onStatusChange('OFFLINE');

      if (this.reconnectAttempts === 0) {
        this.tryReconnect();
      }
    };
  }

  disconnect() {
    this.reconnectAttempts = this.maxReconnectAttempts;
    this.isConnecting = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Normal closure');
      this.ws = null;
    }
    this.onStatusChange('OFFLINE');
  }

  getStatus(): WSStatus {
    if (!this.ws) return 'OFFLINE';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'ONLINE';
      default:
        return 'OFFLINE';
    }
  }
}
