import envConfig from "@/config/envConfig";
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/domain/realtime";
import { io, type Socket } from "socket.io-client";

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const RECONNECT_DELAY_MS = 1_000;
const RECONNECT_DELAY_MAX_MS = 15_000;

let socket: AppSocket | null = null;
let currentToken: string | null = null;

export const isRealtimeConfigured = (): boolean => envConfig.socketEnabled;

export const getSocket = (): AppSocket | null => socket;

/**
 * Opens the connection, or re-authenticates the existing one when the access
 * token has been rotated by the refresh flow. Calling it repeatedly with the
 * same token is a no-op, so it is safe to run on every render pass.
 */
export const connectSocket = (token: string): AppSocket | null => {
  if (!envConfig.socketEnabled || !token) return null;

  if (socket) {
    if (currentToken === token) return socket;

    // A rotated token has to travel in a fresh handshake — the server reads it
    // once, during the connect middleware.
    currentToken = token;
    socket.auth = { token };
    socket.disconnect().connect();
    return socket;
  }

  currentToken = token;

  socket = io(envConfig.socketURL, {
    path: envConfig.socketPath,
    auth: { token },
    // WebSocket first, with polling kept as the fallback for networks and
    // proxies that block the upgrade.
    transports: ["websocket", "polling"],
    withCredentials: true,
    reconnection: true,
    reconnectionDelay: RECONNECT_DELAY_MS,
    reconnectionDelayMax: RECONNECT_DELAY_MAX_MS,
    reconnectionAttempts: Infinity,
    timeout: 10_000,
    autoConnect: true,
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  currentToken = null;
};
