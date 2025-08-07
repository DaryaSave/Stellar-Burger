import { Middleware } from '@reduxjs/toolkit';
import {
  WebSocketService,
  createWebSocketUrl,
  WSStatus,
  WSMessage
} from '../../utils/websocket';

export type { WSMessage } from '../../utils/websocket';

export const WS_CONNECTION_START = 'WS_CONNECTION_START';
export const WS_CONNECTION_SUCCESS = 'WS_CONNECTION_SUCCESS';
export const WS_CONNECTION_ERROR = 'WS_CONNECTION_ERROR';
export const WS_CONNECTION_CLOSED = 'WS_CONNECTION_CLOSED';
export const WS_GET_MESSAGE = 'WS_GET_MESSAGE';
export const WS_SEND_MESSAGE = 'WS_SEND_MESSAGE';
export const WS_CONNECTION_CLOSE = 'WS_CONNECTION_CLOSE';

export const wsFeedConnectionStart = (url: string) => ({
  type: WS_CONNECTION_START,
  payload: { url, wsType: 'feed' }
});

export const wsFeedConnectionSuccess = () => ({
  type: WS_CONNECTION_SUCCESS,
  payload: { wsType: 'feed' }
});

export const wsFeedConnectionError = (error: string) => ({
  type: WS_CONNECTION_ERROR,
  payload: { error, wsType: 'feed' }
});

export const wsFeedConnectionClosed = () => ({
  type: WS_CONNECTION_CLOSED,
  payload: { wsType: 'feed' }
});

export const wsFeedGetMessage = (message: WSMessage) => ({
  type: WS_GET_MESSAGE,
  payload: { message, wsType: 'feed' }
});

export const wsFeedConnectionClose = () => ({
  type: WS_CONNECTION_CLOSE,
  payload: { wsType: 'feed' }
});

export const wsUserOrdersConnectionStart = (url: string) => ({
  type: WS_CONNECTION_START,
  payload: { url, wsType: 'userOrders' }
});

export const wsUserOrdersConnectionSuccess = () => ({
  type: WS_CONNECTION_SUCCESS,
  payload: { wsType: 'userOrders' }
});

export const wsUserOrdersConnectionError = (error: string) => ({
  type: WS_CONNECTION_ERROR,
  payload: { error, wsType: 'userOrders' }
});

export const wsUserOrdersConnectionClosed = () => ({
  type: WS_CONNECTION_CLOSED,
  payload: { wsType: 'userOrders' }
});

export const wsUserOrdersGetMessage = (message: WSMessage) => ({
  type: WS_GET_MESSAGE,
  payload: { message, wsType: 'userOrders' }
});

export const wsUserOrdersConnectionClose = () => ({
  type: WS_CONNECTION_CLOSE,
  payload: { wsType: 'userOrders' }
});

export type WSActionType = ReturnType<
  | typeof wsFeedConnectionStart
  | typeof wsFeedConnectionSuccess
  | typeof wsFeedConnectionError
  | typeof wsFeedConnectionClosed
  | typeof wsFeedGetMessage
  | typeof wsFeedConnectionClose
  | typeof wsUserOrdersConnectionStart
  | typeof wsUserOrdersConnectionSuccess
  | typeof wsUserOrdersConnectionError
  | typeof wsUserOrdersConnectionClosed
  | typeof wsUserOrdersGetMessage
  | typeof wsUserOrdersConnectionClose
>;

interface WSConnections {
  feed?: WebSocketService;
  userOrders?: WebSocketService;
}

let wsConnectionAttempts = {
  feed: 0,
  userOrders: 0
};

const MAX_CONNECTION_ATTEMPTS = 3;
const CONNECTION_RETRY_DELAY = 60000;

const resetConnectionAttempts = (wsType: string) => {
  setTimeout(() => {
    wsConnectionAttempts[wsType as keyof typeof wsConnectionAttempts] = 0;
  }, CONNECTION_RETRY_DELAY);
};

export const socketMiddleware = (): Middleware => {
  const connections: WSConnections = {};

  return (store) => (next) => (action: any) => {
    const { dispatch } = store;
    const { type, payload } = action;

    if (type === WS_CONNECTION_START) {
      const { url, wsType } = payload;

      if (
        wsConnectionAttempts[wsType as keyof typeof wsConnectionAttempts] >=
        MAX_CONNECTION_ATTEMPTS
      ) {
        console.warn(
          `WebSocket connection limit reached for ${wsType}. Skipping connection attempt.`
        );

        resetConnectionAttempts(wsType);
        return next(action);
      }

      if (connections[wsType as keyof WSConnections]) {
        connections[wsType as keyof WSConnections]!.disconnect();
        delete connections[wsType as keyof WSConnections];
      }

      wsConnectionAttempts[wsType as keyof typeof wsConnectionAttempts]++;

      const onMessage = (data: WSMessage) => {
        wsConnectionAttempts[wsType as keyof typeof wsConnectionAttempts] = 0;

        if (wsType === 'feed') {
          dispatch(wsFeedGetMessage(data));
        } else if (wsType === 'userOrders') {
          dispatch(wsUserOrdersGetMessage(data));
        }
      };

      const onStatusChange = (status: WSStatus) => {
        if (status === 'ONLINE') {
          wsConnectionAttempts[wsType as keyof typeof wsConnectionAttempts] = 0;

          if (wsType === 'feed') {
            dispatch(wsFeedConnectionSuccess());
          } else if (wsType === 'userOrders') {
            dispatch(wsUserOrdersConnectionSuccess());
          }
        } else if (status === 'OFFLINE') {
          if (wsType === 'feed') {
            dispatch(wsFeedConnectionClosed());
          } else if (wsType === 'userOrders') {
            dispatch(wsUserOrdersConnectionClosed());
          }
        } else if (status === 'CONNECTING') {
        }
      };

      try {
        const wsService = new WebSocketService(url, onMessage, onStatusChange);
        connections[wsType as keyof WSConnections] = wsService;
        wsService.connect();
      } catch (error) {
        if (wsType === 'feed') {
          dispatch(
            wsFeedConnectionError('Failed to create WebSocket connection')
          );
        } else if (wsType === 'userOrders') {
          dispatch(
            wsUserOrdersConnectionError('Failed to create WebSocket connection')
          );
        }
      }
    }

    if (type === WS_CONNECTION_CLOSE) {
      const { wsType } = payload;
      const connection = connections[wsType as keyof WSConnections];
      if (connection) {
        connection.disconnect();
        delete connections[wsType as keyof WSConnections];
      }
    }

    next(action);
  };
};

export const startFeedConnection = () => {
  const url = createWebSocketUrl('/all');
  return wsFeedConnectionStart(url);
};

export const startUserOrdersConnection = () => {
  const url = createWebSocketUrl('', true);
  return wsUserOrdersConnectionStart(url);
};

export const closeFeedConnection = () => wsFeedConnectionClose();
export const closeUserOrdersConnection = () => wsUserOrdersConnectionClose();
