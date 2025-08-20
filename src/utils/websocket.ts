import { getCookie } from './cookie';
import { refreshToken } from './burger-api';

export const WS_BASE_URL = 'wss://norma.nomoreparties.space';

export const createWebSocketUrl = (
  endpoint: string = '',
  withAuth: boolean = false
): string => {
  if (withAuth) {
    const accessToken = getCookie('accessToken');
    if (!accessToken) {
      return '';
    }
  const token = encodeURIComponent(accessToken.replace(/^Bearer\s+/i, ''));
  return `${WS_BASE_URL}/orders?token=${token}`;
  }
  return `${WS_BASE_URL}/orders/all`;
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
  private manualClose = false;

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
      this.onStatusChange('OFFLINE');
    }
  }

  async connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

  try { new URL(this.url); } catch { return; }

    this.isConnecting = true;
    this.onStatusChange('CONNECTING');

    try {
      let finalUrl = this.url;
      if (this.url.includes('/orders?token=')) {
        try {
          await refreshToken();
          const updatedUrl = createWebSocketUrl('', true);
          if (!updatedUrl) {
            throw new Error('Failed to build private WebSocket URL after token refresh');
          }
          finalUrl = updatedUrl;
        } catch (e) {
        }
      }

      this.ws = new WebSocket(finalUrl);
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

      if (this.manualClose) {
        this.manualClose = false;
        return;
      }

      if (event.code === 1000) {
        return;
      }

      if (event.code === 1006) {
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
        }
        this.reconnectTimer = setTimeout(() => {
          this.reconnectAttempts = this.maxReconnectAttempts - 1;
          this.connect();
        }, 2000);
        return;
      }

      if (event.code === 1002 || event.code === 1003) {
        this.reconnectAttempts = Math.max(
          this.reconnectAttempts,
          this.maxReconnectAttempts - 1
        );
      }
      this.tryReconnect();
    };

    this.ws.onerror = () => {
      this.isConnecting = false;
      this.onStatusChange('OFFLINE');

      if (this.manualClose) {
        return;
      }

      if (this.reconnectAttempts === 0) {
        this.tryReconnect();
      }
    };
  }

  disconnect() {
    this.manualClose = true;
    this.reconnectAttempts = this.maxReconnectAttempts;
    this.isConnecting = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      const current = this.ws;
      try {
        if (current.readyState === WebSocket.CONNECTING) {
          const handleOpenAndClose = () => {
            try {
              current.close(1000, 'Normal closure');
            } catch {}
          };
          current.addEventListener('open', handleOpenAndClose, { once: true });
          setTimeout(() => {
            try {
              if (current.readyState === WebSocket.CONNECTING) {
                current.close();
              }
            } catch {}
          }, 3000);
        } else {
          current.close(1000, 'Normal closure');
        }
      } catch (_) {
      }
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
